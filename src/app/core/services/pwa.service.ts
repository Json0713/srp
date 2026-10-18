import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly swUpdate = inject(SwUpdate, { optional: true });

  private deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

  readonly isOffline = signal(false);
  readonly canInstall = signal(false);
  readonly isStandalone = signal(false);
  readonly updateAvailable = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initBrowserListeners();
      this.initServiceWorkerUpdates();
    }
  }

  private initBrowserListeners(): void {
    this.isOffline.set(typeof navigator !== 'undefined' ? !navigator.onLine : false);
    this.isStandalone.set(this.detectStandaloneMode());

    window.addEventListener('online', () => this.isOffline.set(false));
    window.addEventListener('offline', () => this.isOffline.set(true));

    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredInstallPrompt = event as BeforeInstallPromptEvent;
      this.canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      this.canInstall.set(false);
      this.isStandalone.set(true);
    });
  }

  private initServiceWorkerUpdates(): void {
    if (!this.swUpdate || !this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        this.updateAvailable.set(true);
      });
  }

  private detectStandaloneMode(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    const mediaStandalone =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches;
    const iosStandalone =
      'standalone' in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    return mediaStandalone || iosStandalone;
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredInstallPrompt) {
      return false;
    }

    await this.deferredInstallPrompt.prompt();
    const choice = await this.deferredInstallPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      this.deferredInstallPrompt = null;
      this.canInstall.set(false);
      return true;
    }
    return false;
  }

  async activateUpdate(): Promise<void> {
    if (this.swUpdate && this.swUpdate.isEnabled) {
      await this.swUpdate.activateUpdate();
    }
    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }
}

