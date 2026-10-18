import { Component, inject } from '@angular/core';
import { PageHeader } from '../../shared/ui/page-header';
import { SelectionCard } from '../../shared/ui/selection-card';
import { MenuStateService } from '../../core/services/menu-state.service';

@Component({
  selector: 'app-operators',
  imports: [PageHeader, SelectionCard],
  template: `
    <div class="screen-shell">
      <app-page-header title="Operators" subtitle="Containment Roster">
        <span class="roster-count">{{ menuState.operators.length }} UNITS</span>
      </app-page-header>

      <main class="screen-scroll-body">
        <div class="screen-container operators-layout">
          <section class="selection-list" aria-label="Available Operators">
            @for (op of menuState.operators; track op.id) {
              <app-selection-card
                [code]="op.code"
                [title]="op.title"
                [badge]="op.badge"
                [description]="op.description"
                [unlockRequirement]="op.unlockRequirement"
                [metaText]="op.role + ' • ' + op.weapon"
                [icon]="op.icon"
                [locked]="op.locked"
                [selected]="menuState.selectedOperatorId() === op.id"
                (onClick)="menuState.setOperator(op.id)" />
            }
          </section>

          @if (activeOperator(); as current) {
            <aside class="dossier-panel" aria-label="Selected Operator Telemetry">
              <div class="dossier-header">
                <span class="dossier-icon" aria-hidden="true">{{ current.icon }}</span>
                <div>
                  <span class="dossier-kicker">{{ current.code }} // EQUIPPED</span>
                  <h2 class="dossier-title">{{ current.title }}</h2>
                  <span class="dossier-role">{{ current.role }}</span>
                </div>
              </div>

              <div class="dossier-section">
                <span class="section-label">PRIMARY ARMAMENT</span>
                <p class="section-value">{{ current.weapon }}</p>
              </div>

              <div class="dossier-section">
                <span class="section-label">PASSIVE RIG PROTOCOL</span>
                <p class="section-value highlight">{{ current.passiveTrait }}</p>
              </div>

              <div class="dossier-stats">
                @for (stat of current.attributes; track stat.label) {
                  <div class="stat-row">
                    <div class="stat-meta">
                      <span>{{ stat.label }}</span>
                      <strong>{{ stat.value }}/{{ stat.max }}</strong>
                    </div>
                    <div class="stat-track">
                      <div class="stat-fill" [style.width.%]="(stat.value / stat.max) * 100"></div>
                    </div>
                  </div>
                }
              </div>
            </aside>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .roster-count {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--color-primary-light);
      background: var(--color-primary-surface);
      border: 1px solid rgba(74, 222, 128, 0.35);
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-xs);
    }

    .operators-layout {
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

    .dossier-panel {
      background: var(--color-bg-panel);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
    }

    .dossier-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding-bottom: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
    }

    .dossier-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      font-size: 1.85rem;
      border-radius: var(--radius-sm);
      background: var(--color-primary-surface);
      border: 1px solid rgba(74, 222, 128, 0.4);
    }

    .dossier-kicker {
      display: block;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.14em;
      color: var(--color-primary-light);
    }

    .dossier-title {
      margin: 0.1rem 0;
      font-family: var(--font-display);
      font-size: 1.4rem;
      letter-spacing: 0.06em;
    }

    .dossier-role {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .dossier-section {
      margin-bottom: var(--spacing-md);
    }

    .section-label {
      display: block;
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.14em;
      color: var(--color-text-secondary);
      margin-bottom: 0.2rem;
    }

    .section-value {
      margin: 0;
      font-size: 0.9rem;
      color: var(--color-text-primary);
    }

    .section-value.highlight {
      color: var(--color-accent-light);
    }

    .dossier-stats {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      padding-top: var(--spacing-sm);
      border-top: 1px solid var(--color-border);
    }

    .stat-meta {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: 0.74rem;
      color: var(--color-text-secondary);
      margin-bottom: 0.25rem;
    }

    .stat-meta strong {
      color: var(--color-text-primary);
    }

    .stat-track {
      height: 6px;
      border-radius: var(--radius-pill);
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }

    .stat-fill {
      height: 100%;
      border-radius: var(--radius-pill);
      background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    }

    @media (min-width: 768px), ((orientation: landscape) and (min-width: 640px)) {
      .operators-layout {
        grid-template-columns: 1.25fr 1fr;
      }
    }
  `]
})
export class Operators {
  readonly menuState = inject(MenuStateService);
  readonly activeOperator = this.menuState.selectedOperator;
}

