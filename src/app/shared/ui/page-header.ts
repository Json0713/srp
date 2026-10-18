import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from './button';

@Component({
  selector: 'app-page-header',
  imports: [RouterLink, Button],
  template: `
    <header class="page-header">
      <div class="header-left">
        <app-button
          variant="icon"
          [routerLink]="backLink()"
          ariaLabel="Back to Command Hub"
          class="back-btn">
          <span aria-hidden="true">←</span>
        </app-button>
        <span class="back-hint">HUB</span>
      </div>

      <div class="header-center">
        @if (subtitle()) {
          <span class="page-kicker">{{ subtitle() }}</span>
        }
        <h1 class="page-title">{{ title() }}</h1>
      </div>

      <div class="header-right">
        <ng-content />
      </div>
    </header>
  `,
  styles: [`
    .page-header {
      position: sticky;
      top: 0;
      z-index: 20;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: var(--spacing-md);
      padding: calc(var(--spacing-sm) + var(--safe-top)) max(var(--spacing-lg), var(--safe-right)) var(--spacing-sm) max(var(--spacing-lg), var(--safe-left));
      background: rgba(8, 12, 18, 0.9);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--color-border);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .back-hint {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      color: var(--color-text-secondary);
      text-transform: uppercase;
    }

    .header-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .page-kicker {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.18em;
      color: var(--color-primary-light);
      text-transform: uppercase;
    }

    .page-title {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(1.1rem, 2.5vw, 1.4rem);
      font-weight: 700;
      color: var(--color-text-primary);
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }

    .header-right {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--spacing-sm);
    }

    @media (max-width: 520px) {
      .back-hint {
        display: none;
      }
    }

    @media (max-height: 540px) and (orientation: landscape) {
      .page-header {
        padding-top: max(0.35rem, var(--safe-top));
        padding-bottom: 0.35rem;
      }

      .page-kicker {
        display: none;
      }

      .page-title {
        font-size: 1.05rem;
      }
    }
  `]
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly backLink = input<string>('/');
}

