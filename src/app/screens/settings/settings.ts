import { Component, inject } from '@angular/core';
import { PageHeader } from '../../shared/ui/page-header';
import { SettingsService, InputMode } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  imports: [PageHeader],
  template: `
    <div class="screen-shell">
      <app-page-header title="Settings" subtitle="Control & Tactical Interface">
        <span class="settings-tag">{{ inputMode() === 'pc' ? 'PC MODE' : 'MOBILE MODE' }}</span>
      </app-page-header>

      <main class="screen-scroll-body">
        <div class="screen-container settings-layout">
          <section class="settings-panel" aria-labelledby="input-mode-heading">
            <h3 id="input-mode-heading">Input Mode</h3>
            <p class="panel-desc">
              Select your active control hardware. Mobile mode activates the multi-touch virtual joystick and on-screen harvest trigger in both portrait and landscape orientations.
            </p>

            <div class="input-mode-toggle">
              <label class="radio-card" [class.active]="inputMode() === 'pc'">
                <input
                  type="radio"
                  name="inputMode"
                  value="pc"
                  [checked]="inputMode() === 'pc'"
                  (change)="setInputMode('pc')" />
                <span class="mode-icon" aria-hidden="true">⌨️</span>
                <div class="mode-text">
                  <strong>Keyboard (PC)</strong>
                  <span>WASD / Arrow directional movement + E key interaction</span>
                </div>
              </label>

              <label class="radio-card" [class.active]="inputMode() === 'mobile'">
                <input
                  type="radio"
                  name="inputMode"
                  value="mobile"
                  [checked]="inputMode() === 'mobile'"
                  (change)="setInputMode('mobile')" />
                <span class="mode-icon" aria-hidden="true">📱</span>
                <div class="mode-text">
                  <strong>Virtual Joystick (Mobile)</strong>
                  <span>360° analog thumbstick + touch interaction button</span>
                </div>
              </label>
            </div>
          </section>

          <section class="settings-panel" aria-labelledby="controls-heading">
            <h3 id="controls-heading">Controls</h3>
            @if (inputMode() === 'pc') {
              <ul class="controls-list">
                <li>
                  <span class="key-badge">W, A, S, D / Arrows</span>
                  <strong>Move Operator (8-Way Normalized)</strong>
                </li>
                <li>
                  <span class="key-badge">E</span>
                  <strong>Interact / Harvest Biomass Node</strong>
                </li>
                <li>
                  <span class="key-badge">ESC</span>
                  <strong>Pause Simulation Overlay</strong>
                </li>
              </ul>
            } @else {
              <ul class="controls-list">
                <li>
                  <span class="key-badge">Left Touch Zone</span>
                  <strong>Joystick: Move Operator (360° Smooth Vector)</strong>
                </li>
                <li>
                  <span class="key-badge">Right Action Button (E)</span>
                  <strong>On-Screen Button: Interact / Harvest Biomass</strong>
                </li>
                <li>
                  <span class="key-badge">Top-Right HUD</span>
                  <strong>Pause Simulation Overlay</strong>
                </li>
              </ul>
            }
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .settings-tag {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--color-info);
      background: var(--color-info-surface);
      border: 1px solid rgba(56, 189, 248, 0.35);
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-xs);
    }

    .settings-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
      align-items: start;
    }

    .settings-panel {
      background: var(--color-bg-panel);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
    }

    .settings-panel h3 {
      margin: 0 0 var(--spacing-sm) 0;
      font-family: var(--font-display);
      color: var(--color-accent-light);
      font-size: 1.15rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--spacing-xs);
    }

    .panel-desc {
      margin: 0 0 var(--spacing-md) 0;
      font-size: 0.86rem;
      line-height: 1.45;
      color: var(--color-text-secondary);
    }

    .input-mode-toggle {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .radio-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border-radius: var(--radius-sm);
      background: rgba(5, 7, 11, 0.55);
      border: 1px solid var(--color-border);
      cursor: pointer;
      transition:
        background-color var(--transition-fast),
        border-color var(--transition-fast);
    }

    .radio-card:hover {
      background: var(--color-bg-panel-hover);
      border-color: var(--color-border-strong);
    }

    .radio-card.active {
      background: var(--color-primary-surface);
      border-color: var(--color-primary-light);
      box-shadow: 0 0 18px rgba(34, 197, 94, 0.14);
    }

    .radio-card input[type='radio'] {
      accent-color: var(--color-primary-light);
      width: 18px;
      height: 18px;
      margin: 0;
      cursor: pointer;
    }

    .mode-icon {
      font-size: 1.5rem;
    }

    .mode-text {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .mode-text strong {
      font-size: 0.95rem;
      color: var(--color-text-primary);
    }

    .mode-text span {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }

    .controls-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .controls-list li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-sm);
      background: rgba(5, 7, 11, 0.5);
      border: 1px solid var(--color-border);
    }

    .key-badge {
      font-family: var(--font-mono);
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--color-primary-light);
      background: var(--color-primary-surface);
      border: 1px solid rgba(74, 222, 128, 0.35);
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-xs);
    }

    .controls-list strong {
      font-size: 0.86rem;
      color: var(--color-text-primary);
    }

    @media (min-width: 768px), ((orientation: landscape) and (min-width: 640px)) {
      .settings-layout {
        grid-template-columns: 1.15fr 1fr;
      }
    }
  `]
})
export class Settings {
  private readonly settingsService = inject(SettingsService);

  readonly inputMode = this.settingsService.inputMode;

  setInputMode(mode: InputMode): void {
    this.settingsService.setInputMode(mode);
  }
}

