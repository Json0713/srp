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
import { Router } from '@angular/router';
import type { Game as PhaserGame } from 'phaser';
import { SettingsService, InputMode } from '../core/services/settings.service';
import { MenuStateService } from '../core/services/menu-state.service';
import { CodexService } from '../core/services/codex.service';
import {
  CodexCategory,
  CodexEntry,
  GameHudSnapshot,
  SurvivalSkillOption
} from '../core/models/game-data.model';
import { rollRandomSkillChoices } from './systems/progression.system';
import { Button } from '../shared/ui/button';
import { InfoPopover } from '../shared/ui/info-popover';

export type PauseModalView = 'main' | 'stats' | 'codex' | 'settings';
type CodexFilterTab = 'all' | CodexCategory;

@Component({
  selector: 'app-game',
  imports: [Button, InfoPopover],
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
  readonly codexService = inject(CodexService);
  private readonly router = inject(Router);

  private isDestroyed = false;
  private isInitializing = false;
  private isAborted = false;
  private unlockToastTimer: ReturnType<typeof setTimeout> | null = null;
  private biomassBannerTimer: ReturnType<typeof setTimeout> | null = null;

  readonly isPaused = signal(false);
  readonly autoPausedNotice = signal(false);
  readonly pauseView = signal<PauseModalView>('main');
  readonly isLevelUpModalOpen = signal(false);

  readonly inputMode = this.settingsService.inputMode;
  readonly detectedDeviceMode = this.settingsService.detectedDeviceMode;
  readonly operator = this.menuState.selectedOperator;
  readonly zone = this.menuState.selectedZone;

  // Persistent meta totals (Vault) + active in-run counters (always start at 0 on a new run)
  readonly totalBiomass = this.menuState.biomass;
  readonly totalRpCoins = this.menuState.rpCoins;
  readonly runBiomass = signal(0);
  readonly runRpCoins = signal(0);

  // Real-time run telemetry for autosave & Operator Stats modal
  readonly runSeed = signal(1);
  readonly playerX = signal(256);
  readonly playerY = signal(256);
  readonly elapsedSeconds = signal(0);
  readonly playerSpeed = signal(300);
  readonly magnetRadius = signal(78);
  private collectedResourceIds: string[] = [];
  private collectedPickupIds: string[] = [];

  readonly formattedRunTime = computed(() => {
    const total = Math.max(0, Math.floor(this.elapsedSeconds()));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  });

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
  readonly activeSkillsList = computed(() => {
    const ranks = this.chosenSkillRanks();
    return this.menuState.survivalSkills
      .filter((s) => (ranks[s.id] ?? 0) > 0)
      .map((s) => ({ ...s, rank: ranks[s.id] ?? 0 }));
  });

  // In-modal Field Codex state (keeps player inside the active run!)
  readonly codexTabs: { id: CodexFilterTab; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '📘' },
    { id: 'items', label: 'Items', icon: '🧪' },
    { id: 'parasites', label: 'Parasites', icon: '🕷️' },
    { id: 'powers', label: 'Powers', icon: '⚡' },
    { id: 'archive', label: 'Archive', icon: '🛡️' }
  ];
  readonly activeCodexTab = signal<CodexFilterTab>('all');
  readonly selectedCodexId = signal<string>('raw-biomass');
  readonly filteredCodexEntries = computed<CodexEntry[]>(() =>
    this.codexService.getEntriesByCategory(this.activeCodexTab())
  );
  readonly selectedCodexEntry = computed<CodexEntry | undefined>(() => {
    const list = this.filteredCodexEntries();
    return list.find((e) => e.id === this.selectedCodexId()) ?? list[0];
  });

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
    if (this.isPaused() && this.pauseView() !== 'main') {
      this.pauseView.set('main');
      return;
    }
    this.togglePause();
  }

  /**
   * Real-time dynamic auto-pause & autosave when switching browser tabs or minimizing app.
   */
  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      this.triggerAutoPauseAndSave();
    }
  }

  @HostListener('window:blur')
  onWindowBlur(): void {
    this.triggerAutoPauseAndSave();
  }

  @HostListener('window:pagehide')
  @HostListener('window:beforeunload')
  onPageUnload(): void {
    if (!this.isAborted) {
      this.autosaveCurrentRun();
    }
  }

  triggerAutoPauseAndSave(): void {
    if (this.isAborted || this.isDestroyed) {
      return;
    }
    this.autosaveCurrentRun();
    if (!this.isPaused() && !this.isLevelUpModalOpen()) {
      this.autoPausedNotice.set(true);
      this.pauseView.set('main');
      this.isPaused.set(true);
      this.syncScenePauseState();
    }
  }

  togglePause(): void {
    if (this.isLevelUpModalOpen()) {
      return;
    }
    const nextPaused = !this.isPaused();
    this.isPaused.set(nextPaused);
    if (!nextPaused) {
      this.autoPausedNotice.set(false);
      this.pauseView.set('main');
    } else {
      this.autosaveCurrentRun();
    }
    this.syncScenePauseState();
  }

  openPauseSubview(view: PauseModalView): void {
    this.pauseView.set(view);
  }

  selectCodexTab(tab: CodexFilterTab): void {
    this.activeCodexTab.set(tab);
    const list = this.codexService.getEntriesByCategory(tab);
    if (list.length > 0 && !list.some((e) => e.id === this.selectedCodexId())) {
      this.selectedCodexId.set(list[0].id);
    }
  }

  selectCodexEntry(id: string): void {
    this.selectedCodexId.set(id);
  }

  setInputMode(mode: InputMode): void {
    this.settingsService.setInputMode(mode, true);
    if (this.game) {
      this.game.registry?.set('inputMode', mode);
      this.game.events?.emit('input-mode-changed', mode);
    }
  }

  useAutoDetectedInput(): void {
    this.settingsService.useAutoDetectedMode();
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

    this.autosaveCurrentRun();
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
    if (snapshot.runSeed !== undefined) {
      this.runSeed.set(snapshot.runSeed);
    }
    if (snapshot.playerX !== undefined) {
      this.playerX.set(snapshot.playerX);
    }
    if (snapshot.playerY !== undefined) {
      this.playerY.set(snapshot.playerY);
    }
    if (snapshot.elapsedSeconds !== undefined) {
      this.elapsedSeconds.set(snapshot.elapsedSeconds);
    }
    if (snapshot.playerSpeed !== undefined) {
      this.playerSpeed.set(snapshot.playerSpeed);
    }
    if (snapshot.magnetRadius !== undefined) {
      this.magnetRadius.set(snapshot.magnetRadius);
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
    if (snapshot.collectedResourceIds) {
      this.collectedResourceIds = snapshot.collectedResourceIds;
    }
    if (snapshot.collectedPickupIds) {
      this.collectedPickupIds = snapshot.collectedPickupIds;
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

    this.autosaveCurrentRun();
  }

  autosaveCurrentRun(): void {
    if (this.isAborted) {
      return;
    }
    this.menuState.saveActiveRunSession({
      isActive: true,
      operatorId: this.operator().id,
      zoneId: this.zone().id,
      runSeed: this.runSeed(),
      playerX: this.playerX(),
      playerY: this.playerY(),
      elapsedSeconds: this.elapsedSeconds(),
      level: this.level(),
      currentExp: this.currentExp(),
      expToNextLevel: this.expToNextLevel(),
      runBiomass: this.runBiomass(),
      runRpCoins: this.runRpCoins(),
      pendingLevelUps: this.isLevelUpModalOpen() ? 1 : 0,
      chosenSkills: this.chosenSkillRanks(),
      collectedResourceIds: this.collectedResourceIds,
      collectedPickupIds: this.collectedPickupIds
    });
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

  /**
   * Aborts the active mission: banks all collected in-run Biomass and RP Coins
   * into the persistent Meta-Economy, clears the saved active run, and returns to Home.
   */
  abortMission(): void {
    this.isAborted = true;
    this.menuState.completeOrAbortRun(this.runBiomass(), this.runRpCoins(), this.level());
    void this.router.navigate(['/']);
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

    // Check if we should resume an active saved session or start fresh at 0
    const savedSession = this.menuState.shouldResumeRun() ? this.menuState.activeSession() : null;
    if (savedSession && savedSession.isActive) {
      this.runSeed.set(savedSession.runSeed);
      this.playerX.set(savedSession.playerX ?? 256);
      this.playerY.set(savedSession.playerY ?? 256);
      this.elapsedSeconds.set(savedSession.elapsedSeconds ?? 0);
      this.level.set(savedSession.level);
      this.currentExp.set(savedSession.currentExp);
      this.expToNextLevel.set(savedSession.expToNextLevel);
      this.runBiomass.set(savedSession.runBiomass);
      this.runRpCoins.set(savedSession.runRpCoins);
      this.chosenSkillRanks.set(savedSession.chosenSkills ?? {});
      this.collectedResourceIds = savedSession.collectedResourceIds ?? [];
      this.collectedPickupIds = savedSession.collectedPickupIds ?? [];
    } else {
      this.runBiomass.set(0);
      this.runRpCoins.set(0);
      this.level.set(1);
      this.currentExp.set(0);
      this.expToNextLevel.set(100);
      this.chosenSkillRanks.set({});
      this.collectedResourceIds = [];
      this.collectedPickupIds = [];
    }

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
      this.game.registry.set('resumeSession', savedSession?.isActive ? savedSession : null);

      this.game.events.on('hud-update', (snapshot: GameHudSnapshot) => {
        this.ngZone.run(() => {
          this.handleHudSnapshot(snapshot);
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
    if (!this.isAborted) {
      this.autosaveCurrentRun();
    }
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
      this.game.events.off('codex-grant');
      this.game.destroy(true);
      this.game = null;
    }
  }
}
