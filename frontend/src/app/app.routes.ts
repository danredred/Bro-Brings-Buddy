import { Routes } from '@angular/router';
import { Auth } from './auth/auth';
import { Home } from './home/home';

export const routes: Routes = [
  {
    path:'',
    redirectTo:'/auth',
    pathMatch:'full'
  },
  {
    path:'auth',
    component:Auth,
    title:'Login🪵'
  },
  {
    path:'home',
    component:Home,
    title:'Home🏠'
  }
];
