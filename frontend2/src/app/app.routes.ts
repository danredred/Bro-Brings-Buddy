import { Routes } from '@angular/router';
import { Auth } from './auth/auth';
import { Home } from './home/home';
import { AuthGuard } from './auth/auth.guard';

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
];
