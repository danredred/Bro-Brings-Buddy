import { Component, DestroyRef, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  MinLengthValidator,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService } from './auth-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  constructor(private authService: AuthService, private destroyRef: DestroyRef) {}

  isLoginMode = signal(true);
  form = new FormGroup({  // TODO: ADD INVALID ERROR MESSAGES
    username: new FormControl<string>('', {
      validators: [Validators.required, Validators.maxLength(16)],
    }),
    password: new FormControl('', {
      validators: [Validators.minLength(6), Validators.maxLength(16)],
    }),
  });

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

    let authObs: Observable<Object>;

    if (this.isLoginMode()) {
      authObs = this.authService.login(username, password);
    } else {
      authObs = this.authService.signup(username, password);
    }
    const subscription = authObs.subscribe() // TODO: IMPLEMENT AUTH HENDELING


    this.form.reset();
  }
}
