import { Component, inject } from '@angular/core';
import { PageHeader } from '../../shared/ui/page-header';
import { SelectionCard } from '../../shared/ui/selection-card';
import { InfoPopover } from '../../shared/ui/info-popover';
import { FloatingNav } from '../../shared/ui/floating-nav';
import { MenuStateService } from '../../core/services/menu-state.service';

@Component({
  selector: 'app-operators',
  imports: [PageHeader, SelectionCard, InfoPopover, FloatingNav],
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
                <div class="dossier-title-block">
                  <span class="dossier-kicker">{{ current.code }} // EQUIPPED</span>
                  <div class="dossier-title-row">
                    <h2 class="dossier-title">{{ current.title }}</h2>
                    <app-info-popover
                      [title]="current.title"
                      [tag]="current.code"
                      [text]="current.description"
                      [hint]="current.passiveTrait" />
                  </div>
                  <span class="dossier-role">{{ current.role }}</span>
                </div>
              </div>

              <div class="dossier-section">
                <span class="section-label">ARMAMENT</span>
                <p class="section-value">{{ current.weapon }}</p>
              </div>

              <div class="dossier-section">
                <span class="section-label">PASSIVE PROTOCOL</span>
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

      <app-floating-nav />
    </div>
  `,
  styles: [`
    .roster-count {
      font-family: var(--font-mono); font-size: 0.68rem; color: var(--color-primary-light);
      background: var(--color-primary-surface); border: 1px solid rgba(74, 222, 128, 0.35);
      padding: 0.2rem 0.55rem; border-radius: var(--radius-xs);
    }
    .operators-layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: clamp(0.6rem, 1.6vw, 1rem); align-items: start; min-width: 0; }
    .selection-list, .dossier-stats { display: flex; flex-direction: column; gap: clamp(0.38rem, 1vw, 0.55rem); min-width: 0; }
    .dossier-panel {
      background: var(--color-bg-panel); border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-md); padding: clamp(0.65rem, 1.6vw, 1.1rem); min-width: 0;
    }
    .dossier-header {
      display: flex; align-items: center; gap: clamp(0.5rem, 1.2vw, 0.8rem);
      padding-bottom: clamp(0.45rem, 1.1vw, 0.75rem); margin-bottom: clamp(0.45rem, 1.1vw, 0.75rem);
      border-bottom: 1px solid var(--color-border); min-width: 0;
    }
    .dossier-title-block { flex: 1; min-width: 0; }
    .dossier-title-row, .stat-meta { display: flex; justify-content: space-between; align-items: center; gap: 0.35rem; min-width: 0; }
    .dossier-icon {
      display: flex; align-items: center; justify-content: center;
      width: clamp(38px, 4.5vw, 46px); height: clamp(38px, 4.5vw, 46px); flex-shrink: 0;
      font-size: clamp(1.25rem, 2.2vw, 1.55rem); border-radius: var(--radius-sm);
      background: var(--color-primary-surface); border: 1px solid rgba(74, 222, 128, 0.4);
    }
    .dossier-kicker, .section-label {
      display: block; font-family: var(--font-mono); font-size: 0.6rem;
      letter-spacing: 0.1em; color: var(--color-text-secondary);
    }
    .dossier-kicker { color: var(--color-primary-light); }
    .dossier-title { margin: 0.05rem 0; font-family: var(--font-display); font-size: clamp(1rem, 1.9vw, 1.25rem); }
    .dossier-role { font-family: var(--font-mono); font-size: 0.68rem; color: var(--color-text-secondary); }
    .dossier-section { margin-bottom: 0.4rem; }
    .section-value { margin: 0.08rem 0 0; font-size: clamp(0.76rem, 1.3vw, 0.84rem); color: var(--color-text-primary); }
    .section-value.highlight { color: var(--color-accent-light); }
    .dossier-stats { padding-top: 0.45rem; border-top: 1px solid var(--color-border); }
    .stat-meta { font-family: var(--font-mono); font-size: 0.66rem; color: var(--color-text-secondary); margin-bottom: 0.16rem; }
    .stat-meta strong { color: var(--color-text-primary); }
    .stat-track { height: 5px; border-radius: var(--radius-pill); background: rgba(255, 255, 255, 0.08); overflow: hidden; }
    .stat-fill { height: 100%; border-radius: var(--radius-pill); background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%); }
    @media (min-width: 768px), ((orientation: landscape) and (min-width: 560px)) {
      .operators-layout { grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.95fr); }
    }
  `]
})
export class Operators {
  readonly menuState = inject(MenuStateService);
  readonly activeOperator = this.menuState.selectedOperator;
}
