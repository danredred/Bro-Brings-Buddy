import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth-service';
import { Usercard } from "../shared/usercard/usercard";

@Component({
  selector: 'app-header',
  imports: [RouterLink, Usercard],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthService);
  isAuthenticated = computed(() =>
    !this.authService.userData() ? false : true
  );
  userName = computed(() => this.authService.userData()!.username);
  onLogOut() {
    this.authService.logout();
  }
}
