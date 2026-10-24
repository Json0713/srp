import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-floating-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="floating-nav-dock" aria-label="Primary Navigation Dock">
      <a
        routerLink="/"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        class="nav-tab center-tab">
        <span class="tab-icon" aria-hidden="true">🚀</span>
        <span class="tab-label">Deploy</span>
      </a>
      <a
        routerLink="/operators"
        routerLinkActive="active"
        class="nav-tab left-tab">
        <span class="tab-icon" aria-hidden="true">👤</span>
        <span class="tab-label">Operators</span>
      </a>
      <a
        routerLink="/codex"
        routerLinkActive="active"
        class="nav-tab codex-tab">
        <span class="tab-icon" aria-hidden="true">📘</span>
        <span class="tab-label">Codex</span>
      </a>
      <a
        routerLink="/research"
        routerLinkActive="active"
        class="nav-tab right-tab">
        <span class="tab-icon" aria-hidden="true">🧬</span>
        <span class="tab-label">Research</span>
      </a>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      flex-shrink: 0;
      z-index: 30;
      position: sticky;
      bottom: 0;
    }

    .floating-nav-dock {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: clamp(0.35rem, 1.2vw, 0.75rem);
      padding: clamp(0.35rem, 1vw, 0.5rem) 1rem calc(clamp(0.4rem, 1vw, 0.55rem) + var(--safe-bottom));
      background: rgba(8, 12, 18, 0.96);
      backdrop-filter: blur(14px);
      border-top: 1px solid var(--color-border);
      width: 100%;
      box-sizing: border-box;
    }

    .nav-tab {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      text-decoration: none;
      color: var(--color-text-secondary);
      background: rgba(14, 20, 31, 0.75);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 0.36rem clamp(0.6rem, 1.6vw, 0.95rem);
      min-width: clamp(72px, 12vw, 110px);
      font-family: var(--font-display);
      font-weight: 700;
      font-size: clamp(0.7rem, 1.2vw, 0.78rem);
      text-transform: uppercase;
      transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
      white-space: nowrap;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      outline: none;
    }

    .nav-tab:hover {
      background: var(--color-bg-panel-hover);
      color: var(--color-text-primary);
    }

    .nav-tab:focus-visible {
      outline: 2px solid var(--color-primary-light);
      outline-offset: 2px;
    }

    .nav-tab:active {
      transform: scale(0.97);
      background: rgba(34, 197, 94, 0.16);
    }

    .nav-tab.active {
      border-color: var(--color-primary-light);
      background: var(--color-primary-surface);
      color: var(--color-primary-light);
    }

    .tab-icon {
      font-size: clamp(0.85rem, 1.4vw, 1rem);
    }

    @media (max-width: 560px) and (orientation: portrait) {
      .nav-tab {
        flex: 1;
        min-width: 0;
        padding: 0.35rem 0.45rem;
        font-size: 0.68rem;
      }
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .floating-nav-dock {
        padding: 0.25rem 0.75rem calc(0.28rem + var(--safe-bottom));
        gap: 0.35rem;
      }
      .nav-tab {
        padding: 0.24rem 0.55rem;
        font-size: 0.66rem;
        min-width: 68px;
      }
    }
  `]
})
export class FloatingNav {}

