import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Button } from '../../shared/ui/button';
import { MenuStateService } from '../../core/services/menu-state.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RouterLinkActive, Button],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  readonly menuState = inject(MenuStateService);
  readonly settingsService = inject(SettingsService);

  readonly currentPhase = this.menuState.currentPhase;
  readonly operator = this.menuState.selectedOperator;
  readonly zone = this.menuState.selectedZone;
  readonly srpCoins = this.menuState.srpCoins;
  readonly inputMode = this.settingsService.inputMode;
}


