import { Component, computed, DestroyRef, OnInit, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ApplicationService } from '../application/application.service';
import { ApplicationData } from '../application/applicationData.model';
import { MatListModule } from '@angular/material/list';
import { Application } from "../application/application";

@Component({
  selector: 'app-home',
  imports: [MatListModule, Application],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  constructor(
    private authService: AuthService,
    private applicationService: ApplicationService,
    private destroyRef: DestroyRef
  ) {}
  myAppliction = signal<ApplicationData[]>([]);
  isAdmin = computed(() => this.authService.userData()?.isAdmin === true);
  isMember = computed(() => this.authService.userData()?.isMember === true);

  ngOnInit(): void {
    if (this.authService.userData()?.isAdmin === false) {
      const subscription = this.applicationService
        .getMyApplications()
        .subscribe((apps) => this.myAppliction.set(apps));
      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }
  }
}
