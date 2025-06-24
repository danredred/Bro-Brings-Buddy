import { Component, computed, DestroyRef, OnInit, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ApplicationService, applicationSorter } from '../application/application.service';
import { ApplicationData } from '../application/applicationData.model';
import { MatListModule } from '@angular/material/list';
import { Application } from '../application/application';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../shared/user/user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-home',
  imports: [
    MatListModule,
    Application,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    User,
    MatGridListModule,
    ScrollingModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  constructor(
    private authService: AuthService,
    private applicationService: ApplicationService,
    private destroyRef: DestroyRef,
    readonly snackbar: MatSnackBar
  ) {}
  private myApplictions = signal<ApplicationData[]>([]);
  applications = computed(()=>this.myApplictions().sort(applicationSorter))
  isAdmin = computed(() => this.authService.userData()?.isAdmin === true);
  isMember = computed(() => this.authService.userData()?.isMember === true);
  peasants = signal<string[]>([]);
  members = signal<string[]>([]);
  image = computed(() =>
    this.isAdmin() ? 'logo.png' : this.isMember() ? 'member.png' : 'peasant.png'
  );

  ngOnInit(): void {
    // get my applications
    const subscription = this.applicationService.getMyApplications().subscribe(
      (apps) => this.myApplictions.set(apps),
      (error) => this.errorMessage(error)
    );
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
    this.getUsers();
  }

  private getUsers() {
    if (
      this.authService.userData()?.isMember ||
      this.authService.userData()?.isAdmin
    ) {  // if Member or Admin update the peasants list
      this.applicationService.getUsers('PEASANT').subscribe(
        (users) => {
          this.peasants.set(users);
        },
        (error) => this.errorMessage(error)
      );
    } //if member update the members list
    if (this.authService.userData()?.isAdmin) {
      this.applicationService.getUsers('MEMBER').subscribe(
        (users) => this.members.set(users),
        (error) => this.errorMessage(error)
      );
    }
  }

  onSubmitUser(username: string) {
    this.applicationService.createApplication(username).subscribe(
      (app) =>
        this.myApplictions.update((a) => {
          this.getUsers();
          return [app, ...a];
        }),
      (error) => this.errorMessage(error)
    );
  }
  errorMessage(error: string) {
    this.snackbar.open(error, 'OK');
  }
  onCloseApp(id: number, index: number) {
    this.applicationService.closeApplication(id).subscribe(
      (app) =>{
        this.getUsers();
        this.myApplictions.update((a) => {
          a[index] = app;
          return [...a];
        })},
      (error) => this.errorMessage(error)
    );
  }
}
