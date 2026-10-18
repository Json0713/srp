import { Injectable, signal } from '@angular/core';
import { InputMode } from '../models/game-data.model';

export type { InputMode } from '../models/game-data.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly storageKey = 'srp_input_mode';
  private readonly defaultMode: InputMode = 'pc';

  readonly inputMode = signal<InputMode>(this.loadMode());

  private loadMode(): InputMode {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(this.storageKey);
        if (stored === 'pc' || stored === 'mobile') {
          return stored;
        }
      } catch {
        // Ignore storage read errors in restricted environments
      }
    }
    return this.defaultMode;
  }

  setInputMode(mode: InputMode): void {
    this.inputMode.set(mode);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(this.storageKey, mode);
      } catch {
        // Ignore quota or security errors
      }
    }
  }

  toggleInputMode(): void {
    this.setInputMode(this.inputMode() === 'pc' ? 'mobile' : 'pc');
  }
}

