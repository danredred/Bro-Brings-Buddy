import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ApplicationService } from '../application/application.service';
import { Application } from '../application/application';
import { ApplicationData } from '../application/applicationData.model';

@Component({
  selector: 'app-admin',
  imports: [Application],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  applications = signal<ApplicationData[]>([]);
  constructor(
    private authService: AuthService,
    private applicationService: ApplicationService,
  ) {}
  ngOnInit(): void {
    this.applicationService.getApplications().subscribe((apps) => {
      this.applications.set(apps.sort((a, b) => +a.closed - +b.closed));
    });
  }
  onApprove(id: number, index: number) {
    this.applicationService.approveApplication(+id).subscribe(() => {
      this.applications.update((apps) => {
        apps[index].approvers.push(this.authService.userData()!.username);
        return apps;
      });
    });
  }
  onDeapprove(id: number, index: number) {
    this.applicationService.deapproveApplication(+id).subscribe(() => {
      this.applications.update((apps) => {
        return apps.splice(index, 1);
      });
    });
  }
}
