import { Injectable, inject, signal } from '@angular/core';
import { InputMode, PersistedSettingsV1 } from '../models/game-data.model';
import { PersistenceService } from './persistence.service';

export type { InputMode } from '../models/game-data.model';

/**
 * Automatically detects whether the player is on a mobile/touch device or desktop PC.
 */
export function detectHardwareInputMode(): InputMode {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'pc';
  }

  const hasCoarsePointer =
    typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  const hasTouchPoints = (navigator.maxTouchPoints ?? 0) > 0;
  const isMobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent ?? '');

  if ((hasCoarsePointer && hasTouchPoints) || isMobileUserAgent) {
    return 'mobile';
  }

  return 'pc';
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly persistence = inject(PersistenceService);
  private readonly legacyStorageKey = 'srp_input_mode';

  readonly detectedDeviceMode = signal<InputMode>(detectHardwareInputMode());
  readonly hasManualOverride = signal<boolean>(false);
  readonly inputMode = signal<InputMode>(this.loadInitialModeSync());

  constructor() {
    void this.hydrateFromIndexedDb();
  }

  private loadInitialModeSync(): InputMode {
    const mirror = this.persistence.readMirrorSync<PersistedSettingsV1>('user_settings');
    if (mirror && (mirror.inputMode === 'pc' || mirror.inputMode === 'mobile')) {
      if (mirror.hasManualInputOverride) {
        return mirror.inputMode;
      }
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const legacy = window.localStorage.getItem(this.legacyStorageKey);
        if (legacy === 'pc' || legacy === 'mobile') {
          return legacy;
        }
      } catch {
        // Ignore restricted storage errors
      }
    }

    return detectHardwareInputMode();
  }

  private async hydrateFromIndexedDb(): Promise<void> {
    const stored = await this.persistence.loadSettings();
    if (stored && (stored.inputMode === 'pc' || stored.inputMode === 'mobile')) {
      this.hasManualOverride.set(Boolean(stored.hasManualInputOverride));
      if (stored.hasManualInputOverride) {
        this.inputMode.set(stored.inputMode);
        return;
      }
    }

    // If no manual override is locked in, use auto-detected hardware mode and save v1 record
    const autoMode = detectHardwareInputMode();
    this.detectedDeviceMode.set(autoMode);
    this.inputMode.set(autoMode);
    await this.persistence.saveSettings({
      inputMode: autoMode,
      hasManualInputOverride: false
    });
  }

  setInputMode(mode: InputMode, isManual = true): void {
    this.inputMode.set(mode);
    this.hasManualOverride.set(isManual);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(this.legacyStorageKey, mode);
      } catch {
        // Ignore quota errors
      }
    }

    void this.persistence.saveSettings({
      inputMode: mode,
      hasManualInputOverride: isManual
    });
  }

  useAutoDetectedMode(): void {
    const detected = detectHardwareInputMode();
    this.detectedDeviceMode.set(detected);
    this.setInputMode(detected, false);
  }

  toggleInputMode(): void {
    this.setInputMode(this.inputMode() === 'pc' ? 'mobile' : 'pc', true);
  }
}
