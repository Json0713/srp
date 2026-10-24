import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'icon';

@Component({
  selector: 'app-button',
  template: `
    <button
      type="button"
      [class]="'game-btn ' + variant() + (fullWidth() ? ' full-width' : '')"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      (click)="onClick.emit($event)">
      <ng-content />
    </button>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }

    :host(.full-width) {
      display: flex;
      width: 100%;
    }

    .game-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      font-family: var(--font-display);
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition:
        background-color var(--transition-fast),
        border-color var(--transition-fast),
        transform var(--transition-fast),
        box-shadow var(--transition-fast);
      border: 1px solid transparent;
      user-select: none;
      white-space: nowrap;
    }

    .game-btn.full-width {
      width: 100%;
    }

    .game-btn:focus-visible {
      outline: 2px solid var(--color-primary-light);
      outline-offset: 2px;
    }

    .game-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      filter: grayscale(100%);
    }

    /* Primary Bio-Hazard Tactical CTA */
    .primary {
      background: linear-gradient(180deg, #1ea34a 0%, #15803d 100%);
      color: #ffffff;
      padding: 0.85rem 2.25rem;
      font-size: 1.05rem;
      border: 1px solid rgba(74, 222, 128, 0.5);
      box-shadow:
        0 4px 20px rgba(22, 163, 74, 0.38),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .primary:not(:disabled):hover {
      background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
      border-color: var(--color-primary-light);
      box-shadow:
        0 6px 28px rgba(34, 197, 94, 0.55),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    .primary:not(:disabled):active {
      transform: translateY(0);
    }

    /* Secondary Tactical Slate Button */
    .secondary {
      background-color: var(--color-bg-panel-solid);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border-strong);
      padding: 0.65rem 1.35rem;
      font-size: 0.92rem;
    }

    .secondary:not(:disabled):hover {
      background-color: var(--color-bg-panel-hover);
      border-color: var(--color-primary-light);
      box-shadow: 0 0 14px rgba(34, 197, 94, 0.16);
    }

    /* Danger / Abort Variant */
    .danger {
      background-color: var(--color-danger-surface);
      color: var(--color-danger-light);
      border: 1px solid rgba(239, 68, 68, 0.4);
      padding: 0.65rem 1.35rem;
      font-size: 0.92rem;
    }

    .danger:not(:disabled):hover {
      background-color: rgba(239, 68, 68, 0.24);
      border-color: var(--color-danger-light);
      box-shadow: 0 0 16px rgba(239, 68, 68, 0.3);
    }

    /* Tactical Icon Button */
    .icon {
      background: rgba(14, 20, 31, 0.85);
      backdrop-filter: blur(10px);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      width: 36px;
      height: 36px;
      padding: 0;
      font-size: 1rem;
      border-radius: var(--radius-sm);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      transition:
        background-color var(--transition-fast),
        border-color var(--transition-fast),
        color var(--transition-fast),
        transform var(--transition-fast),
        box-shadow var(--transition-fast);
    }

    .icon:not(:disabled):hover {
      background-color: rgba(23, 33, 51, 0.95);
      border-color: var(--color-primary-light);
      color: #ffffff;
      box-shadow: 0 0 12px var(--color-primary-glow), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .icon:not(:disabled):active {
      transform: translateY(0) scale(0.95);
      background-color: var(--color-primary-surface);
    }

    .icon svg {
      width: 17px;
      height: 17px;
      display: block;
      transition: transform var(--transition-fast);
    }

    @media (max-height: 540px) and (orientation: landscape) {
      .primary {
        padding: 0.6rem 1.5rem;
        font-size: 0.95rem;
      }

      .secondary,
      .danger {
        padding: 0.5rem 1.1rem;
        font-size: 0.85rem;
      }

      .icon {
        width: 32px;
        height: 32px;
        font-size: 0.9rem;
      }

      .icon svg {
        width: 15px;
        height: 15px;
      }
    }
  `]
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly disabled = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly onClick = output<Event>();
}
