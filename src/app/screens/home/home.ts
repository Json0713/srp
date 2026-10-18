import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Button } from '../../shared/ui/button';
import { InfoPopover } from '../../shared/ui/info-popover';
import { MenuStateService } from '../../core/services/menu-state.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RouterLinkActive, Button, InfoPopover],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  readonly menuState = inject(MenuStateService);
  readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);

  readonly currentPhase = this.menuState.currentPhase;
  readonly operator = this.menuState.selectedOperator;
  readonly zone = this.menuState.selectedZone;
  readonly rpCoins = this.menuState.rpCoins;
  readonly biomass = this.menuState.biomass;
  readonly inputMode = this.settingsService.inputMode;

  readonly activeSession = this.menuState.activeSession;
  readonly hasActiveSession = this.menuState.hasActiveSession;
  readonly lastExtraction = this.menuState.lastExtractionSummary;

  continueLastRun(): void {
    this.menuState.prepareContinueRun();
    void this.router.navigate(['/game']);
  }

  startNewRun(): void {
    this.menuState.prepareNewRun();
    void this.router.navigate(['/game']);
  }

  dismissExtraction(): void {
    this.menuState.clearExtractionSummary();
  }
}
