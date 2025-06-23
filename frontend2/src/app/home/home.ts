import { Component, computed, DestroyRef, OnInit, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ApplicationService } from '../application/application.service';
import { ApplicationData } from '../application/applicationData.model';
import { MatListModule } from '@angular/material/list';
import { Application } from '../application/application';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../shared/user/user';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-home',
  imports: [
    MatListModule,
    Application,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    User,
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
  myAppliction = signal<ApplicationData[]>([]);
  isAdmin = computed(() => this.authService.userData()?.isAdmin === true);
  isMember = computed(() => this.authService.userData()?.isMember === true);
  peasants = signal<string[]>([]);
  members = signal<string[]>([]);
  image = computed(() =>
    this.isAdmin() ? 'logo.png' : this.isMember() ? 'member.png' : 'peasant.png'
  );

  ngOnInit(): void {
    if (this.authService.userData()?.isAdmin === false) {
      // get my applications
      const subscription = this.applicationService
        .getMyApplications()
        .subscribe(
          (apps) => this.myAppliction.set(apps),
          (error) => this.errorMessage(error)
        );
      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }
    if (
      this.authService.userData()?.isMember ||
      this.authService.userData()?.isAdmin
    ) {
      this.applicationService.getUsers('PEASANT').subscribe(
        (users) => {
          console.log(users);
          this.peasants.set(users);
        },
        (error) => this.errorMessage(error)
      );
    }
    if (this.authService.userData()?.isAdmin) {
      this.applicationService.getUsers('MEMBER').subscribe(
        (users) => this.members.set(users),
        (error) => this.errorMessage(error)
      );
    }
  }
  onSubmitUser(username: string) {
    this.applicationService.createApplication(username).subscribe(
      (app) => console.log(app),
      (error) => this.errorMessage(error)
    );
  }
  errorMessage(error: string) {
    this.snackbar.open(error,'OK')
  }
}
