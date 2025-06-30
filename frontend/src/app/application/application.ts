import { Component, computed, input, output, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { type ApplicationData } from './applicationData.model';
import { DatePipe } from '@angular/common';
import { UserProfile } from '../shared/user-profile/user-profile';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApplicationService } from './application.service';
import { User } from '../shared/user/user';
import { AuthService } from '../auth/auth.service';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-application',
  imports: [
    MatCardModule,
    DatePipe,
    UserProfile,
    MatListModule,
    MatDividerModule,
    MatExpansionModule,
    MatProgressBarModule,
    User,
    MatButton,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './application.html',
  styleUrl: './application.css',
})
export class Application {
  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {}
  app = input.required<ApplicationData>();
  allowVotes = input<boolean>(false);
  action = output<{ id: number; action: 'APROVE' | 'DEAPROVE' | 'CLOSE' }>();
  isAdmin = computed(() => this.authService.userData()?.isAdmin === true);
  isSubmitter = computed(
    () =>
      this.app().submitterUser.username === this.authService.userData()?.username
  );
  isAproving = computed(() => {
    const username = this.authService.userData()?.username;
    if (!username) return false;
    return this.app().approvingUsers.find((a)=>a.username===username)!==undefined;
  });
  approveCount = computed(() => this.app().approvingUsers.length);
  approvalNeeded = computed(() => {
    if (
      this.applicationService.adminCount < 2 ||
      this.app().type === 'TOMEMBER'
    ) {
      return 2;
    }
    return this.applicationService.adminCount;
  });
}
