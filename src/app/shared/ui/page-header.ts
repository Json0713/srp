import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <!-- Left: Tactical Back Action & Screen Telemetry Meta (Matches Home top-bar scale) -->
      <div class="header-brand">
        <a
          [routerLink]="backLink()"
          class="back-action-btn"
          aria-label="Back to Command Hub"
          title="Back to Command Hub">
          <svg class="hud-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </a>

        <div class="header-meta">
          <h1 class="header-title">{{ title() }}</h1>
          @if (subtitle()) {
            <div class="header-telemetry">
              <span class="status-pulse" aria-hidden="true"></span>
              <span class="header-subtitle">{{ subtitle() }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Right: Sub-screen Action Badges, Telemetry or Currency Pills -->
      <div class="header-actions">
        <ng-content />
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 20;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.6rem;
      background: rgba(6, 9, 14, 0.94);
      backdrop-filter: blur(14px);
      padding: calc(0.45rem + var(--safe-top)) max(1rem, var(--safe-right)) 0.45rem max(1rem, var(--safe-left));
      border-bottom: 1px solid rgba(99, 125, 162, 0.22);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
      width: 100%;
      box-sizing: border-box;
    }

    .header-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      min-width: 0;
    }

    .back-action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      background: rgba(14, 20, 31, 0.85);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
      text-decoration: none;
      cursor: pointer;
      flex-shrink: 0;
      transition: all var(--transition-fast);
      -webkit-tap-highlight-color: transparent;
    }

    .back-action-btn:hover {
      background: var(--color-bg-panel-hover);
      border-color: var(--color-primary-light);
      color: var(--color-primary-light);
      transform: translateX(-2px);
    }

    .back-action-btn:active {
      transform: scale(0.95);
      background: var(--color-primary-surface);
    }

    .hud-svg {
      width: 15px;
      height: 15px;
      display: block;
    }

    .header-meta {
      display: flex;
      flex-direction: column;
      gap: 0.05rem;
      min-width: 0;
    }

    .header-title {
      margin: 0;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 0.76rem;
      line-height: 1.1;
      letter-spacing: 0.12em;
      color: var(--color-text-primary);
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-telemetry {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      line-height: 1;
    }

    .header-subtitle {
      font-family: var(--font-mono);
      font-size: 0.6rem;
      letter-spacing: 0.08em;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      flex-shrink: 0;
    }

    @media (max-width: 540px) and (orientation: portrait) {
      .header-subtitle {
        display: none;
      }
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .page-header {
        padding: calc(0.35rem + var(--safe-top)) max(0.85rem, var(--safe-right)) 0.35rem max(0.85rem, var(--safe-left));
      }
      .back-action-btn {
        width: 28px;
        height: 28px;
      }
      .header-title {
        font-size: 0.72rem;
      }
    }
  `]
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly backLink = input<string>('/');
}
