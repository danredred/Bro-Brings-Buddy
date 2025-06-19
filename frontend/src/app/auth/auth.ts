import { Component, DestroyRef, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  MinLengthValidator,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthResponseData, AuthService } from './auth-service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  isLoginMode = signal(true);
  error = signal<string | null>(null);
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
    this.error.set(null);
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
        console.log(value);
        this.router.navigate(['home']);
      },
      error: (error) => {
        this.error.set(error);
        console.log('Error!');
      },
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
    this.form.reset();
  }
}
