import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ApplicationService } from '../application/application.service';
import { Application } from '../application/application';
import { ApplicationData } from '../application/applicationData.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-admin',
  imports: [Application, ScrollingModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  applications = signal<ApplicationData[]>([]);
  constructor(
    private authService: AuthService,
    private applicationService: ApplicationService,
    private readonly snackBar: MatSnackBar,
  ) {}
  ngOnInit(): void {
    this.applicationService.getApplications().subscribe(
      (apps) => {
        this.applications.set(apps.sort((a, b) => b.id - a.id));
      },
      (error) => this.snackBar.open(error, 'Dismiss', { duration: 5000 })
    );
  }
  onAction(
    data: { id: number; action: 'APROVE' | 'DEAPROVE' | 'CLOSE' },
    index: number
  ) {
    let requesting;
    switch (data.action) {
      case 'APROVE':
        requesting = this.applicationService.approveApplication(data.id);
        break;
      case 'DEAPROVE':
        requesting = this.applicationService.deapproveApplication(data.id);
        break;
      case 'CLOSE':
        requesting = this.applicationService.closeApplication(data.id);
        break;
    }
    requesting.subscribe(
      (app) => {  // updatet the applications
        this.applications.update((apps) => {
          apps[index] = app;
          return [...apps];
        });
      },
      (error) => this.snackBar.open(error, 'Dismiss', { duration: 5000 })
    );
  }
}
