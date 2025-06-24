import { Component, computed, inject, signal, Signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { UserProfile } from '../shared/user-profile/user-profile';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

type NavigationItem = {
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
    RouterLink,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);
  dashBoardText = computed(() => {
    if (!this.app()) {
      return 'Stranger👽';
    } else if (this.app()!.isMember) {
      return 'Member🤠';
    } else if (this.app()!.isAdmin) {
      return 'Admin👑';
    } else {
      return 'Peasant🧑‍🌾';
    }
  });
  app = this.authService.userData;
  navigation = computed<NavigationItem[]>(() => {
    const nav = [
      { name: 'Home', href: 'home' },
      { name: 'Mini Game', href: 'minigame' },
    ];
    if(this.app()?.isAdmin===true){
      nav.push({name:'Admin',href:'Admin'})
    }
    return nav
  });

  onLogout() {
    this.authService.logout();
  }

  isActive(url: string) {
    return this.router.isActive(url, false);
  }
}
