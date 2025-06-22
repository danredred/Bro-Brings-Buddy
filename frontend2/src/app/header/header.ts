import { Component, inject, signal, Signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule }from '@angular/material/toolbar'
import { MatMenuModule }from '@angular/material/menu'
import { UserProfile } from "../shared/user-profile/user-profile";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

type NavigationItem = {
  name: string;
  href: string;
  current: boolean;
};

type UserNavigationItem = {
  name: string;
  href: string;
};

@Component({
  selector: 'app-header',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    UserProfile,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);
  app = this.authService.userData
  navigation = signal<NavigationItem[]>([
    { name: 'Home', href: 'home', current: true },
    { name: 'Mini Game', href: 'minigame', current: false },
  ]);
  
  onLogout(){
    this.authService.logout()
  }

  isActive(url:string){
    return this.router.isActive(url, false);
  }
}
