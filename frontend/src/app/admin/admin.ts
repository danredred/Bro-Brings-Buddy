import { Component, computed, OnInit, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import {
  ApplicationService,
  applicationSorter,
} from '../application/application.service';
import { Application } from '../application/application';
import { ApplicationData } from '../application/applicationData.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormControl, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UserProfile } from '../shared/user-profile/user-profile';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-admin',
  imports: [
    Application,
    ScrollingModule,
    MatExpansionModule,
    MatFormFieldModule,
    FormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatInputModule,
    UserProfile,
    MatDatepickerModule,
  ],
  providers:[provideNativeDateAdapter()],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private applications = signal<ApplicationData[]>([]);
  filtersType = signal<'TOADMIN' | 'TOMEMBER' | undefined>(undefined);
  filtersStatus = signal<undefined | 'PENDING' | 'CLOSED' | 'APPROVED'>(
    undefined
  );
  filtersUser = signal<string>('');
  filterStart = signal<Date|undefined>(undefined)
  filterEnd = signal<Date|undefined>(undefined)

  submittingUsersOptions = computed(() => {
    return this.applications()
      .map((app) => app.submitter)
      .filter((user) =>
        user.toLowerCase().startsWith(this.filtersUser().toLowerCase())
      )
      .sort((a, b) => a.length - b.length);
  });

  applicationShower = computed(() =>
    this.applications()
      .sort(applicationSorter)
      .filter((app) => {
        if (this.filtersStatus() && this.filtersStatus() !== app.status)
          return false;

        if (this.filtersType() && this.filtersType() !== app.type) return false;

        if (!app.submitter.toLowerCase().startsWith(this.filtersUser().toLowerCase()))
          return false;
        if (this.filterStart()!==undefined && new Date( app.created)<this.filterStart()!) return false;
        if (this.filterEnd() && new Date(app.created) > this.filterEnd()!)
          return false;
        return true;
      })
  );
  constructor(
    private authService: AuthService,
    private applicationService: ApplicationService,
    private readonly snackBar: MatSnackBar
  ) {}
  ngOnInit(): void {
    this.applicationService.getApplications().subscribe(
      (apps) => {
        this.applications.set(apps);
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
      (app) => {
        // updatet the applications
        this.applications.update((apps) => {
          apps[index] = app;
          return [...apps];
        });
      },
      (error) => this.snackBar.open(error, 'Dismiss', { duration: 5000 })
    );
  }
}
