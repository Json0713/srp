import {
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  effect,
  inject,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import type { Game as PhaserGame } from 'phaser';
import { SettingsService, InputMode } from '../core/services/settings.service';
import { MenuStateService } from '../core/services/menu-state.service';
import { GameHudSnapshot } from '../core/models/game-data.model';
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
  private readonly router = inject(Router);

  private isDestroyed = false;
  private isInitializing = false;

  readonly isPaused = signal(false);
  readonly inputMode = this.settingsService.inputMode;
  readonly operator = this.menuState.selectedOperator;
  readonly zone = this.menuState.selectedZone;

  readonly resourcesCollected = signal(0);
  readonly totalResources = signal(4);
  readonly nearbyInteractable = signal(false);

  constructor() {
    effect(() => {
      const mode = this.settingsService.inputMode();
      if (this.game?.registry) {
        this.game.registry.set('inputMode', mode);
      }
    });
  }

  @HostListener('window:keydown.Escape')
  handleEscape(): void {
    this.togglePause();
  }

  togglePause(): void {
    this.isPaused.set(!this.isPaused());
    if (this.game) {
      if (this.isPaused()) {
        this.game.scene.pause('MainScene');
      } else {
        this.game.scene.resume('MainScene');
      }
    }
  }

  setInputMode(mode: InputMode): void {
    this.settingsService.setInputMode(mode);
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
          this.resourcesCollected.set(snapshot.resourcesCollected);
          this.totalResources.set(snapshot.totalResources);
          this.nearbyInteractable.set(snapshot.nearbyInteractable);
        });
      });
    });

    this.isInitializing = false;
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.game) {
      this.game.events.off('hud-update');
      this.game.destroy(true);
      this.game = null;
    }
  }
}
