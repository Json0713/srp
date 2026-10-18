import {
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import type { Game as PhaserGame } from 'phaser';
import { SettingsService, InputMode } from '../core/services/settings.service';
import { MenuStateService } from '../core/services/menu-state.service';
import { CodexService } from '../core/services/codex.service';
import { PersistenceService } from '../core/services/persistence.service';
import { GameHudSnapshot, SurvivalSkillOption } from '../core/models/game-data.model';
import { rollRandomSkillChoices } from './systems/progression.system';
import { Button } from '../shared/ui/button';

@Component({
  selector: 'app-game',
  imports: [Button, RouterLink],
  templateUrl: './game.html',
  styleUrl: './game.css'
})
export class Game implements OnInit, OnDestroy {
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef<HTMLDivElement>;

  private game: PhaserGame | null = null;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly settingsService = inject(SettingsService);
  private readonly menuState = inject(MenuStateService);
  private readonly codexService = inject(CodexService);
  private readonly persistence = inject(PersistenceService);
  private readonly router = inject(Router);

  private isDestroyed = false;
  private isInitializing = false;
  private unlockToastTimer: ReturnType<typeof setTimeout> | null = null;
  private biomassBannerTimer: ReturnType<typeof setTimeout> | null = null;

  readonly isPaused = signal(false);
  readonly isLevelUpModalOpen = signal(false);
  readonly inputMode = this.settingsService.inputMode;
  readonly operator = this.menuState.selectedOperator;
  readonly zone = this.menuState.selectedZone;

  // Persistent meta totals + active run counters
  readonly totalBiomass = this.menuState.biomass;
  readonly totalRpCoins = this.menuState.rpCoins;
  readonly runBiomass = signal(0);
  readonly runRpCoins = signal(0);

  // In-run EXP & Level state
  readonly level = signal(1);
  readonly currentExp = signal(0);
  readonly expToNextLevel = signal(100);
  readonly expPercent = computed(() => {
    const req = Math.max(1, this.expToNextLevel());
    return Math.min(100, Math.round((this.currentExp() / req) * 100));
  });

  readonly nearbyInteractable = signal(false);
  readonly sectorLabel = signal('SEC +0:+0');
  readonly unlockedCodexTitle = signal<string | null>(null);
  readonly recentBiomassReward = signal<{ biomass: number; exp: number; rpCoins: number } | null>(
    null
  );

  // Level-up 3-skill choice state
  readonly skillChoices = signal<SurvivalSkillOption[]>([]);
  readonly chosenSkillRanks = signal<Record<string, number>>({});

  constructor() {
    effect(() => {
      const mode = this.settingsService.inputMode();
      if (this.game) {
        this.game.registry?.set('inputMode', mode);
        this.game.events?.emit('input-mode-changed', mode);
      }
    });
  }

  @HostListener('window:keydown.Escape')
  handleEscape(): void {
    if (this.isLevelUpModalOpen()) {
      return;
    }
    this.togglePause();
  }

  togglePause(): void {
    if (this.isLevelUpModalOpen()) {
      return;
    }
    this.isPaused.set(!this.isPaused());
    this.syncScenePauseState();
  }

  setInputMode(mode: InputMode): void {
    this.settingsService.setInputMode(mode, true);
    if (this.game) {
      this.game.registry?.set('inputMode', mode);
      this.game.events?.emit('input-mode-changed', mode);
    }
  }

  selectLevelUpSkill(skill: SurvivalSkillOption): void {
    const nextRanks = {
      ...this.chosenSkillRanks(),
      [skill.id]: (this.chosenSkillRanks()[skill.id] ?? 0) + 1
    };
    this.chosenSkillRanks.set(nextRanks);
    this.isLevelUpModalOpen.set(false);

    if (this.game) {
      this.game.events.emit('skill-selected', skill.id);
    }

    void this.persistence.saveSession({
      runSeed: 1,
      level: this.level(),
      currentExp: this.currentExp(),
      expToNextLevel: this.expToNextLevel(),
      runBiomass: this.runBiomass(),
      runRpCoins: this.runRpCoins(),
      chosenSkills: nextRanks
    });

    this.syncScenePauseState();
  }

  getSkillRank(skillId: string): number {
    return this.chosenSkillRanks()[skillId] ?? 0;
  }

  handleHudSnapshot(snapshot: GameHudSnapshot): void {
    this.runBiomass.set(snapshot.runBiomass ?? snapshot.resourcesCollected);
    this.runRpCoins.set(snapshot.runRpCoins ?? 0);
    this.nearbyInteractable.set(snapshot.nearbyInteractable);

    if (snapshot.sectorLabel) {
      this.sectorLabel.set(snapshot.sectorLabel);
    }
    if (snapshot.level !== undefined) {
      this.level.set(snapshot.level);
    }
    if (snapshot.currentExp !== undefined) {
      this.currentExp.set(snapshot.currentExp);
    }
    if (snapshot.expToNextLevel !== undefined) {
      this.expToNextLevel.set(snapshot.expToNextLevel);
    }

    if (snapshot.lastBiomassReward) {
      this.recentBiomassReward.set({
        biomass: snapshot.lastBiomassReward.biomass,
        exp: snapshot.lastBiomassReward.exp,
        rpCoins: snapshot.lastBiomassReward.rpCoins
      });
      if (this.biomassBannerTimer) {
        clearTimeout(this.biomassBannerTimer);
      }
      this.biomassBannerTimer = setTimeout(() => {
        this.recentBiomassReward.set(null);
      }, 3200);
    }

    if ((snapshot.pendingLevelUps ?? 0) > 0 && !this.isLevelUpModalOpen()) {
      this.openLevelUpSkillModal();
    }
  }

  private openLevelUpSkillModal(): void {
    const choices = rollRandomSkillChoices(this.menuState.survivalSkills, 3);
    this.skillChoices.set(choices);
    this.isLevelUpModalOpen.set(true);
    this.syncScenePauseState();
  }

  private syncScenePauseState(): void {
    if (!this.game) return;
    if (this.isPaused() || this.isLevelUpModalOpen()) {
      this.game.scene.pause('MainScene');
    } else {
      this.game.scene.resume('MainScene');
    }
  }

  private handleCodexGrant(entryId: string): void {
    const newlyUnlocked = this.codexService.unlockEntry(entryId);
    if (newlyUnlocked) {
      this.unlockedCodexTitle.set(newlyUnlocked.title);
      if (this.unlockToastTimer) {
        clearTimeout(this.unlockToastTimer);
      }
      this.unlockToastTimer = setTimeout(() => {
        this.unlockedCodexTitle.set(null);
      }, 4000);
    }
  }

  returnHome(): void {
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.initGame();
    }
  }

  private async initGame(): Promise<void> {
    if (this.game || this.isInitializing) {
      return;
    }

    this.isInitializing = true;

    const Phaser = await import('phaser');
    const { MainScene } = await import('./scenes/main.scene');

    if (this.isDestroyed) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: this.gameContainer.nativeElement,
        width: '100%',
        height: '100%',
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [MainScene]
      });

      this.game.registry.set('inputMode', this.settingsService.inputMode());
      this.game.registry.set('operatorId', this.operator().id);
      this.game.registry.set('zoneId', this.zone().id);

      this.game.events.on('hud-update', (snapshot: GameHudSnapshot) => {
        this.ngZone.run(() => {
          this.handleHudSnapshot(snapshot);
        });
      });

      this.game.events.on('meta-reward', (reward: { biomass: number; rpCoins: number }) => {
        this.ngZone.run(() => {
          this.menuState.addRunRewards(reward.biomass, reward.rpCoins);
        });
      });

      this.game.events.on('codex-grant', (entryId: string) => {
        this.ngZone.run(() => {
          this.handleCodexGrant(entryId);
        });
      });
    });

    this.isInitializing = false;
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.unlockToastTimer) {
      clearTimeout(this.unlockToastTimer);
      this.unlockToastTimer = null;
    }
    if (this.biomassBannerTimer) {
      clearTimeout(this.biomassBannerTimer);
      this.biomassBannerTimer = null;
    }
    if (this.game) {
      this.game.events.off('hud-update');
      this.game.events.off('meta-reward');
      this.game.events.off('codex-grant');
      this.game.destroy(true);
      this.game = null;
    }
  }
}
