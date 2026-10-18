import { Component, inject } from '@angular/core';
import { PageHeader } from '../../shared/ui/page-header';
import { Button } from '../../shared/ui/button';
import { InfoPopover } from '../../shared/ui/info-popover';
import { SettingsService, InputMode } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  imports: [PageHeader, Button, InfoPopover],
  template: `
    <div class="screen-shell">
      <app-page-header title="Settings" subtitle="Control & Tactical Interface">
        <span class="settings-tag">{{ inputMode() === 'pc' ? 'PC MODE' : 'MOBILE MODE' }}</span>
      </app-page-header>

      <main class="screen-scroll-body">
        <div class="screen-container settings-layout">
          <section class="settings-panel" aria-labelledby="input-mode-heading">
            <div class="panel-head-row">
              <h3 id="input-mode-heading">Input Mode</h3>
              <app-info-popover
                title="Hardware Input Auto-Detection"
                tag="CONTROLS"
                text="Project Parasite automatically detects whether you are on a PC keyboard or a Mobile touchscreen device. You can manually override or reset to auto-detected hardware anytime."
                [hint]="'Detected Hardware: ' + (detectedDevice() === 'pc' ? 'PC Keyboard' : 'Mobile Touch')" />
            </div>

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
                  <span>WASD / Arrows + E Harvest</span>
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
                  <span>360° Thumbstick + Touch Action</span>
                </div>
              </label>

              <app-button variant="secondary" [fullWidth]="true" class="full-width" (onClick)="useAutoDetect()">
                🔄 Auto-Detect Hardware ({{ detectedDevice() === 'pc' ? 'PC' : 'Mobile' }})
              </app-button>
            </div>
          </section>

          <section class="settings-panel" aria-labelledby="controls-heading">
            <div class="panel-head-row">
              <h3 id="controls-heading">Active Bindings</h3>
            </div>
            @if (inputMode() === 'pc') {
              <ul class="controls-list">
                <li><span class="key-badge">WASD / Arrows</span><strong>8-Way Move (Auto-Magnet)</strong></li>
                <li><span class="key-badge">E</span><strong>Harvest Biomass Spire</strong></li>
                <li><span class="key-badge">ESC</span><strong>Pause Overlay</strong></li>
              </ul>
            } @else {
              <ul class="controls-list">
                <li><span class="key-badge">Left Touch Zone</span><strong>360° Smooth Joystick</strong></li>
                <li><span class="key-badge">Right Button (E)</span><strong>Harvest Biomass Spire</strong></li>
                <li><span class="key-badge">Top-Right HUD</span><strong>Pause Overlay</strong></li>
              </ul>
            }
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .settings-tag { font-family: var(--font-mono); font-size: 0.66rem; color: var(--color-info); background: var(--color-info-surface); border: 1px solid rgba(56, 189, 248, 0.35); padding: 0.2rem 0.52rem; border-radius: var(--radius-xs); }
    .settings-layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: clamp(0.6rem, 1.6vw, 1rem); align-items: start; min-width: 0; }
    .settings-panel { background: var(--color-bg-panel); border: 1px solid var(--color-border-strong); border-radius: var(--radius-md); padding: clamp(0.65rem, 1.6vw, 1.1rem); min-width: 0; }
    .panel-head-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 0.35rem; margin-bottom: 0.45rem; min-width: 0; }
    .settings-panel h3 { margin: 0; font-family: var(--font-display); color: var(--color-accent-light); font-size: clamp(0.95rem, 1.8vw, 1.1rem); letter-spacing: 0.08em; text-transform: uppercase; }
    .input-mode-toggle, .controls-list { display: flex; flex-direction: column; gap: clamp(0.38rem, 1vw, 0.55rem); list-style: none; padding: 0; margin: 0; min-width: 0; }
    .radio-card { display: flex; align-items: center; gap: clamp(0.45rem, 1.2vw, 0.75rem); padding: clamp(0.42rem, 1vw, 0.6rem) clamp(0.5rem, 1.3vw, 0.75rem); border-radius: var(--radius-sm); background: rgba(5, 7, 11, 0.55); border: 1px solid var(--color-border); cursor: pointer; min-width: 0; }
    .radio-card.active { background: var(--color-primary-surface); border-color: var(--color-primary-light); }
    .radio-card input[type='radio'] { accent-color: var(--color-primary-light); width: 16px; height: 16px; margin: 0; cursor: pointer; flex-shrink: 0; }
    .mode-icon { font-size: 1.25rem; flex-shrink: 0; }
    .mode-text { display: flex; flex-direction: column; gap: 0.08rem; min-width: 0; }
    .mode-text strong { font-size: clamp(0.8rem, 1.4vw, 0.9rem); color: var(--color-text-primary); }
    .mode-text span { font-size: clamp(0.66rem, 1.2vw, 0.74rem); color: var(--color-text-secondary); }
    .controls-list li { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.35rem; padding: 0.42rem 0.6rem; border-radius: var(--radius-sm); background: rgba(5, 7, 11, 0.5); border: 1px solid var(--color-border); min-width: 0; }
    .key-badge { font-family: var(--font-mono); font-size: 0.66rem; font-weight: 700; color: var(--color-primary-light); background: var(--color-primary-surface); border: 1px solid rgba(74, 222, 128, 0.35); padding: 0.14rem 0.45rem; border-radius: var(--radius-xs); }
    .controls-list strong { font-size: clamp(0.74rem, 1.3vw, 0.82rem); color: var(--color-text-primary); }
    @media (min-width: 768px), ((orientation: landscape) and (min-width: 560px)) {
      .settings-layout { grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.95fr); }
    }
  `]
})
export class Settings {
  private readonly settingsService = inject(SettingsService);

  readonly inputMode = this.settingsService.inputMode;
  readonly detectedDevice = this.settingsService.detectedDeviceMode;

  setInputMode(mode: InputMode): void {
    this.settingsService.setInputMode(mode, true);
  }

  useAutoDetect(): void {
    this.settingsService.useAutoDetectedMode();
  }
}
