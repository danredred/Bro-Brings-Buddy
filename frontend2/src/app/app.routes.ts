import { Routes } from '@angular/router';
import { Auth } from './auth/auth';
import { Home } from './home/home';
import { AuthGuard, MiniGameAuthGuard } from './auth/auth.guard';
import { MiniGame } from './mini-game/mini-game';
import { PeasantGame } from './mini-game/peasant-game/peasant-game';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: Auth,
    title: 'Login🪵',
  },
  {
    path: 'home',
    component: Home,
    canActivate: [AuthGuard],
    title: 'Home🏠',
  },
  {
    path: 'minigame',
    component: MiniGame,
    canActivate: [MiniGameAuthGuard],
    title: 'Mini Game🎮',
  },
  {
    path: 'peasant-game',
    component: PeasantGame,
    canActivate: [AuthGuard],
    title: 'Mini Game🎮🙂‍↔️',
  },
];
