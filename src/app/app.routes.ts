import { Routes } from '@angular/router';
import { Game } from './game/game';
import { Home } from './screens/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'game', component: Game },
  {
    path: 'operators',
    loadComponent: () => import('./screens/operators/operators').then((m) => m.Operators)
  },
  {
    path: 'zones',
    loadComponent: () => import('./screens/zones/zones').then((m) => m.Zones)
  },
  {
    path: 'shop',
    loadComponent: () => import('./screens/shop/shop').then((m) => m.Shop)
  },
  {
    path: 'settings',
    loadComponent: () => import('./screens/settings/settings').then((m) => m.Settings)
  },
  { path: '**', redirectTo: '' }
];
