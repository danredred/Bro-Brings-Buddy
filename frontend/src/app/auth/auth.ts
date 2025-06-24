import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthResponseData, AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardContent,
    MatCardActions,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  private readonly snackBar = inject(MatSnackBar);
  isLoginMode = signal(true);
  form = new FormGroup({
    // TODO: ADD INVALID ERROR MESSAGES
    username: new FormControl<string>('', {
      validators: [Validators.required, Validators.maxLength(16)],
    }),
    password: new FormControl('', {
      validators: [Validators.minLength(6), Validators.maxLength(16)],
    }),
  });

  constructor(
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private router: Router
  ) {}

  onSwitchMode() {
    this.isLoginMode.update((mode) => !mode);
    this.form.reset();
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    if (!this.form.value.username || !this.form.value.password) return;
    const username: string = this.form.value.username;
    const password: string = this.form.value.password;

    let authObs: Observable<AuthResponseData>;

    if (this.isLoginMode()) {
      authObs = this.authService.login(username, password);
    } else {
      authObs = this.authService.signup(username, password);
    }
    const subscription = authObs.subscribe({
      next: (value) => {
        this.router.navigate(['home']);
      },
      error: (error) => {
        this.snackBar.open(error,'Dismiss',{duration:5000})
      },
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
    this.form.reset();
  }
}
