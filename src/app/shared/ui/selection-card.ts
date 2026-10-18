import { Component, input, output } from '@angular/core';
import { InfoPopover } from './info-popover';

@Component({
  selector: 'app-selection-card',
  imports: [InfoPopover],
  template: `
    <div
      role="button"
      class="selection-card"
      [class.selected]="selected()"
      [class.locked]="locked()"
      [attr.aria-disabled]="locked()"
      [attr.aria-pressed]="selected()"
      [attr.tabindex]="locked() ? -1 : 0"
      (click)="handleCardClick()"
      (keydown.enter)="handleCardClick()"
      (keydown.space)="handleSpace($event)">
      <div class="card-icon-wrap" aria-hidden="true">
        <span class="card-icon">{{ locked() ? '🔒' : icon() }}</span>
      </div>

      <div class="card-details">
        <div class="card-title-row">
          @if (code()) {
            <span class="card-code">{{ code() }}</span>
          }
          <h3>{{ title() }}</h3>
          @if (badge()) {
            <span class="card-badge" [class.badge-locked]="locked()">{{ badge() }}</span>
          }
          <app-info-popover
            [title]="title()"
            [tag]="code() || ''"
            [text]="description()"
            [hint]="locked() ? (unlockRequirement() || 'Locked — Classified Protocol') : (metaText() || '')" />
        </div>

        @if (locked()) {
          <p class="card-sub locked-sub">{{ unlockRequirement() || 'Classified Protocol' }}</p>
        } @else if (metaText()) {
          <div class="card-meta">{{ metaText() }}</div>
        } @else {
          <p class="card-sub">{{ description() }}</p>
        }
      </div>

      <div class="card-status">
        @if (locked()) {
          <span class="status-pill status-locked">LOCKED</span>
        } @else if (selected()) {
          <span class="status-pill status-selected">ACTIVE</span>
        } @else {
          <span class="status-pill status-ready">SELECT</span>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .selection-card {
      position: relative; display: flex; width: 100%; text-align: left;
      align-items: center; gap: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md);
      background: var(--color-bg-panel); border: 1px solid var(--color-border);
      border-radius: var(--radius-md); cursor: pointer;
      transition: background-color var(--transition-fast), border-color var(--transition-fast);
      color: var(--color-text-primary);
    }
    .selection-card:focus-visible { outline: 2px solid var(--color-primary-light); outline-offset: 2px; }
    .selection-card:not(.locked):hover { background: var(--color-bg-panel-hover); border-color: var(--color-border-strong); }
    .selection-card.selected {
      border-color: var(--color-primary-light);
      background: linear-gradient(90deg, rgba(34, 197, 94, 0.14) 0%, rgba(14, 20, 31, 0.92) 100%);
    }
    .selection-card.locked { opacity: 0.62; cursor: not-allowed; background: rgba(10, 14, 22, 0.65); }
    .card-icon-wrap {
      display: flex; align-items: center; justify-content: center;
      width: 46px; height: 46px; flex-shrink: 0; border-radius: var(--radius-sm);
      background: rgba(5, 7, 11, 0.65); border: 1px solid var(--color-border);
    }
    .selection-card.selected .card-icon-wrap { border-color: rgba(74, 222, 128, 0.45); background: rgba(34, 197, 94, 0.12); }
    .card-icon { font-size: 1.45rem; line-height: 1; }
    .card-details { flex: 1; min-width: 0; }
    .card-title-row { display: flex; align-items: center; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.15rem; }
    .card-code {
      font-family: var(--font-mono); font-size: 0.65rem; color: var(--color-text-secondary);
      padding: 0.08rem 0.35rem; border-radius: var(--radius-xs);
      background: rgba(255, 255, 255, 0.05); border: 1px solid var(--color-border);
    }
    .card-details h3 { margin: 0; font-family: var(--font-display); font-size: 1.05rem; letter-spacing: 0.04em; }
    .card-badge {
      font-family: var(--font-mono); font-size: 0.62rem; text-transform: uppercase;
      padding: 0.1rem 0.4rem; border-radius: var(--radius-xs);
      color: var(--color-accent-light); background: var(--color-accent-surface);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .card-badge.badge-locked { color: var(--color-text-secondary); background: rgba(255, 255, 255, 0.04); border-color: var(--color-border); }
    .card-sub {
      margin: 0; font-size: 0.78rem; color: var(--color-text-secondary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .locked-sub { color: var(--color-danger-light); font-family: var(--font-mono); font-size: 0.72rem; }
    .card-meta { font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-primary-light); }
    .card-status { flex-shrink: 0; }
    .status-pill {
      display: inline-block; font-family: var(--font-mono); font-size: 0.65rem;
      font-weight: 700; letter-spacing: 0.1em; padding: 0.2rem 0.55rem; border-radius: var(--radius-xs);
    }
    .status-selected { background: var(--color-primary-surface); color: var(--color-primary-light); border: 1px solid rgba(74, 222, 128, 0.45); }
    .status-ready { background: rgba(255, 255, 255, 0.04); color: var(--color-text-secondary); border: 1px solid var(--color-border); }
    .status-locked { background: rgba(239, 68, 68, 0.1); color: var(--color-danger-light); border: 1px solid rgba(239, 68, 68, 0.28); }
    @media (max-width: 520px) { .card-status { display: none; } }
  `]
})
export class SelectionCard {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input.required<string>();
  readonly code = input<string | undefined>(undefined);
  readonly badge = input<string | undefined>(undefined);
  readonly unlockRequirement = input<string | undefined>(undefined);
  readonly metaText = input<string | undefined>(undefined);
  readonly selected = input<boolean>(false);
  readonly locked = input<boolean>(false);
  readonly onClick = output<void>();

  handleCardClick(): void {
    if (!this.locked()) {
      this.onClick.emit();
    }
  }

  handleSpace(event: Event): void {
    event.preventDefault();
    this.handleCardClick();
  }
}
