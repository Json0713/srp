import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeader } from '../../shared/ui/page-header';
import { SelectionCard } from '../../shared/ui/selection-card';
import { Button } from '../../shared/ui/button';
import { InfoPopover } from '../../shared/ui/info-popover';
import { MenuStateService } from '../../core/services/menu-state.service';

@Component({
  selector: 'app-zones',
  imports: [PageHeader, SelectionCard, Button, InfoPopover],
  template: `
    <div class="screen-shell">
      <app-page-header title="Deployment Zones" subtitle="Outbreak Sectors">
        <span class="sector-tag">TARGET: {{ activeZone().code }}</span>
      </app-page-header>

      <main class="screen-scroll-body">
        <div class="screen-container zones-layout">
          <div class="selection-list">
            @for (zone of menuState.zones; track zone.id) {
              <app-selection-card
                [code]="zone.code"
                [title]="zone.title"
                [badge]="zone.badge"
                [description]="zone.description"
                [unlockRequirement]="zone.unlockRequirement"
                [metaText]="zone.environmentType + ' • ' + zone.infestationDensity"
                [icon]="zone.icon"
                [locked]="zone.locked"
                [selected]="menuState.selectedZoneId() === zone.id"
                (onClick)="menuState.setZone(zone.id)" />
            }
          </div>

          <aside class="mission-brief-card" aria-label="Deployment Confirmation">
            <div class="brief-header">
              <div class="brief-title-row">
                <div>
                  <span class="brief-kicker">DROP MANIFEST</span>
                  <h2 class="brief-title">{{ activeZone().title }}</h2>
                </div>
                <app-info-popover
                  [title]="activeZone().title"
                  [tag]="activeZone().code"
                  [text]="activeZone().description"
                  [hint]="activeZone().threatLevel" />
              </div>
              <span class="brief-threat">{{ activeZone().threatLevel }}</span>
            </div>

            <div class="brief-rows">
              <div class="brief-row">
                <span>Operator</span>
                <strong>{{ activeOperator().title }} ({{ activeOperator().code }})</strong>
              </div>
              <div class="brief-row">
                <span>Biome</span>
                <strong>{{ activeZone().environmentType }}</strong>
              </div>
              <div class="brief-row">
                <span>Spore Activity</span>
                <strong>{{ activeZone().infestationDensity }}</strong>
              </div>
            </div>

            <div class="action-footer">
              @if (menuState.hasActiveSession()) {
                <app-button variant="secondary" [fullWidth]="true" class="full-width" (onClick)="continueRun()">
                  <span>▶ CONTINUE SAVED RUN</span>
                </app-button>
              }
              <app-button variant="primary" [fullWidth]="true" class="full-width" (onClick)="deployNewRun()">
                <span>DEPLOY NEW RUN</span>
                <span aria-hidden="true">⚡</span>
              </app-button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .sector-tag {
      font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-danger-light);
      background: var(--color-danger-surface); border: 1px solid rgba(239, 68, 68, 0.35);
      padding: 0.25rem 0.6rem; border-radius: var(--radius-xs);
    }
    .zones-layout { display: grid; grid-template-columns: 1fr; gap: var(--spacing-lg); align-items: start; }
    .selection-list, .brief-rows, .action-footer { display: flex; flex-direction: column; gap: var(--spacing-sm); }
    .mission-brief-card {
      background: var(--color-bg-panel); border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-md); padding: var(--spacing-lg);
      display: flex; flex-direction: column; gap: var(--spacing-md);
    }
    .brief-header { padding-bottom: var(--spacing-sm); border-bottom: 1px solid var(--color-border); }
    .brief-title-row, .brief-row { display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-sm); }
    .brief-kicker { display: block; font-family: var(--font-mono); font-size: 0.68rem; color: var(--color-text-secondary); }
    .brief-title { margin: 0.1rem 0; font-family: var(--font-display); font-size: 1.4rem; }
    .brief-threat { font-family: var(--font-mono); font-size: 0.74rem; color: var(--color-accent-light); }
    .brief-row { font-size: 0.84rem; color: var(--color-text-secondary); }
    .brief-row strong { color: var(--color-text-primary); text-align: right; }
    @media (min-width: 768px), ((orientation: landscape) and (min-width: 640px)) {
      .zones-layout { grid-template-columns: 1.25fr 1fr; }
    }
  `]
})
export class Zones {
  readonly menuState = inject(MenuStateService);
  private readonly router = inject(Router);
  readonly activeZone = this.menuState.selectedZone;
  readonly activeOperator = this.menuState.selectedOperator;

  deployNewRun(): void {
    this.menuState.prepareNewRun();
    void this.router.navigate(['/game']);
  }

  continueRun(): void {
    this.menuState.prepareContinueRun();
    void this.router.navigate(['/game']);
  }
}
