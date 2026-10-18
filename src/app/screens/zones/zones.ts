import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/ui/page-header';
import { SelectionCard } from '../../shared/ui/selection-card';
import { Button } from '../../shared/ui/button';
import { MenuStateService } from '../../core/services/menu-state.service';

@Component({
  selector: 'app-zones',
  imports: [PageHeader, SelectionCard, Button, RouterLink],
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
              <span class="brief-kicker">DROP MANIFEST</span>
              <h2 class="brief-title">{{ activeZone().title }}</h2>
              <span class="brief-threat">{{ activeZone().threatLevel }}</span>
            </div>

            <div class="brief-rows">
              <div class="brief-row">
                <span>Assigned Operator</span>
                <strong>{{ activeOperator().title }} ({{ activeOperator().code }})</strong>
              </div>
              <div class="brief-row">
                <span>Biome Classification</span>
                <strong>{{ activeZone().environmentType }}</strong>
              </div>
              <div class="brief-row">
                <span>Spore Activity</span>
                <strong>{{ activeZone().infestationDensity }}</strong>
              </div>
            </div>

            <div class="action-footer">
              <app-button variant="primary" routerLink="/game" [fullWidth]="true" class="full-width">
                <span>DEPLOY</span>
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
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--color-danger-light);
      background: var(--color-danger-surface);
      border: 1px solid rgba(239, 68, 68, 0.35);
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-xs);
    }

    .zones-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
      align-items: start;
    }

    .selection-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .mission-brief-card {
      background: var(--color-bg-panel);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .brief-header {
      padding-bottom: var(--spacing-sm);
      border-bottom: 1px solid var(--color-border);
    }

    .brief-kicker {
      display: block;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.14em;
      color: var(--color-text-secondary);
    }

    .brief-title {
      margin: 0.15rem 0;
      font-family: var(--font-display);
      font-size: 1.4rem;
      letter-spacing: 0.06em;
    }

    .brief-threat {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--color-accent-light);
    }

    .brief-rows {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .brief-row {
      display: flex;
      justify-content: space-between;
      gap: var(--spacing-sm);
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }

    .brief-row strong {
      color: var(--color-text-primary);
      text-align: right;
    }

    .action-footer {
      padding-top: var(--spacing-xs);
    }

    @media (min-width: 768px), ((orientation: landscape) and (min-width: 640px)) {
      .zones-layout {
        grid-template-columns: 1.25fr 1fr;
      }
    }
  `]
})
export class Zones {
  readonly menuState = inject(MenuStateService);
  readonly activeZone = this.menuState.selectedZone;
  readonly activeOperator = this.menuState.selectedOperator;
}

