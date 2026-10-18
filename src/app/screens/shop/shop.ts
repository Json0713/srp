import { Component, inject } from '@angular/core';
import { PageHeader } from '../../shared/ui/page-header';
import { MenuStateService } from '../../core/services/menu-state.service';

@Component({
  selector: 'app-shop',
  imports: [PageHeader],
  template: `
    <div class="screen-shell">
      <app-page-header title="Black Market" subtitle="Encrypted Supply Terminal">
        <span class="shop-status">OFFLINE</span>
      </app-page-header>

      <main class="screen-scroll-body">
        <div class="screen-container shop-layout">
          <div class="placeholder-message">
            <div class="icon" aria-hidden="true">🚧</div>
            <span class="terminal-code">ERR_NET_QUARANTINE // SECTOR_LOCK</span>
            <h2>Access Denied</h2>
            <p>
              The Black Market is currently unavailable. Encrypted relay connection to the outer containment network has not been established yet.
            </p>
          </div>

          <section class="preview-catalog" aria-label="Encrypted Supply Manifest">
            <h3 class="catalog-heading">Intercepted Upgrade Schematics (Locked)</h3>
            <div class="catalog-grid">
              @for (item of menuState.shopPreviews; track item.id) {
                <article class="catalog-card">
                  <div class="catalog-top">
                    <span class="catalog-category">{{ item.category }}</span>
                    <span class="catalog-cost">🪙 {{ item.cost }}</span>
                  </div>
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                  <span class="catalog-lock">🔒 AWAITING NETWORK LINK</span>
                </article>
              }
            </div>
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .shop-status {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--color-danger-light);
      background: var(--color-danger-surface);
      border: 1px solid rgba(239, 68, 68, 0.35);
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-xs);
    }

    .shop-layout {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .placeholder-message {
      text-align: center;
      max-width: 540px;
      margin: 0 auto;
      padding: var(--spacing-xl);
      background: var(--color-bg-panel);
      border: 1px solid rgba(239, 68, 68, 0.32);
      border-radius: var(--radius-md);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    }

    .icon {
      font-size: 2.75rem;
      margin-bottom: var(--spacing-xs);
    }

    .terminal-code {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      letter-spacing: 0.14em;
      color: var(--color-danger-light);
      margin-bottom: var(--spacing-xs);
    }

    .placeholder-message h2 {
      font-family: var(--font-display);
      font-size: 1.5rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .placeholder-message p {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.45;
      color: var(--color-text-secondary);
    }

    .catalog-heading {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-text-secondary);
      margin: 0 0 var(--spacing-md) 0;
    }

    .catalog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: var(--spacing-md);
    }

    .catalog-card {
      background: rgba(14, 20, 31, 0.6);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--spacing-md);
      opacity: 0.7;
    }

    .catalog-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xs);
      font-family: var(--font-mono);
      font-size: 0.7rem;
    }

    .catalog-category {
      color: var(--color-info);
    }

    .catalog-cost {
      color: var(--color-accent-light);
      font-weight: 700;
    }

    .catalog-card h4 {
      margin: 0 0 0.25rem 0;
      font-family: var(--font-display);
      font-size: 1.05rem;
      color: var(--color-text-primary);
    }

    .catalog-card p {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: 0.82rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    .catalog-lock {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 0.66rem;
      color: var(--color-text-muted);
    }
  `]
})
export class Shop {
  readonly menuState = inject(MenuStateService);
}

