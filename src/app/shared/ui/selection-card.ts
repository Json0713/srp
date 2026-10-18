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
    :host { display: block; min-width: 0; max-width: 100%; }
    .selection-card {
      position: relative; display: flex; width: 100%; min-width: 0; text-align: left;
      align-items: center; gap: clamp(0.45rem, 1.2vw, 0.75rem);
      padding: clamp(0.45rem, 1.1vw, 0.68rem) clamp(0.55rem, 1.4vw, 0.85rem);
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
    .selection-card.locked { opacity: 0.64; cursor: not-allowed; background: rgba(10, 14, 22, 0.65); }
    .card-icon-wrap {
      display: flex; align-items: center; justify-content: center;
      width: clamp(36px, 4.2vw, 42px); height: clamp(36px, 4.2vw, 42px);
      flex-shrink: 0; border-radius: var(--radius-sm);
      background: rgba(5, 7, 11, 0.65); border: 1px solid var(--color-border);
    }
    .selection-card.selected .card-icon-wrap { border-color: rgba(74, 222, 128, 0.45); background: rgba(34, 197, 94, 0.12); }
    .card-icon { font-size: clamp(1.1rem, 2vw, 1.35rem); line-height: 1; }
    .card-details { flex: 1; min-width: 0; overflow: hidden; }
    .card-title-row { display: flex; align-items: center; flex-wrap: wrap; gap: 0.32rem; margin-bottom: 0.1rem; min-width: 0; }
    .card-code {
      font-family: var(--font-mono); font-size: 0.6rem; color: var(--color-text-secondary);
      padding: 0.05rem 0.3rem; border-radius: var(--radius-xs);
      background: rgba(255, 255, 255, 0.05); border: 1px solid var(--color-border);
    }
    .card-details h3 { margin: 0; font-family: var(--font-display); font-size: clamp(0.88rem, 1.6vw, 1.02rem); letter-spacing: 0.03em; }
    .card-badge {
      font-family: var(--font-mono); font-size: 0.58rem; text-transform: uppercase;
      padding: 0.06rem 0.34rem; border-radius: var(--radius-xs);
      color: var(--color-accent-light); background: var(--color-accent-surface);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .card-badge.badge-locked { color: var(--color-text-secondary); background: rgba(255, 255, 255, 0.04); border-color: var(--color-border); }
    .card-sub, .card-meta {
      margin: 0; font-size: clamp(0.66rem, 1.2vw, 0.74rem); color: var(--color-text-secondary);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;
    }
    .locked-sub { color: var(--color-danger-light); font-family: var(--font-mono); font-size: clamp(0.62rem, 1.1vw, 0.68rem); }
    .card-meta { font-family: var(--font-mono); color: var(--color-primary-light); }
    .card-status { flex-shrink: 0; }
    .status-pill {
      display: inline-block; font-family: var(--font-mono); font-size: 0.58rem;
      font-weight: 700; letter-spacing: 0.08em; padding: 0.15rem 0.42rem; border-radius: var(--radius-xs);
    }
    .status-selected { background: var(--color-primary-surface); color: var(--color-primary-light); border: 1px solid rgba(74, 222, 128, 0.45); }
    .status-ready { background: rgba(255, 255, 255, 0.04); color: var(--color-text-secondary); border: 1px solid var(--color-border); }
    .status-locked { background: rgba(239, 68, 68, 0.1); color: var(--color-danger-light); border: 1px solid rgba(239, 68, 68, 0.28); }
    @media (max-width: 680px) { .card-status { display: none; } }
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
