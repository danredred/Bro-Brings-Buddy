import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User } from './user.model';

export interface AuthResponseData {
  token: string;
  expiresIn: number;
  username: string;
  permission: 'ADMIN' | 'MEMBER' | 'PEASANT';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user = signal<User | undefined>(undefined);
  public userData = this.user.asReadonly();
  private httpClient = inject(HttpClient);
  private tokenExpirationTimer: any;
  private router = inject(Router);

  signup(username: string, password: string) {
    return this.authenticate('signup', username, password);
  }
  login(username: string, password: string) {
    return this.authenticate('login', username, password);
  }

  private authenticate(
    mode: 'login' | 'signup',
    username: string,
    password: string
  ) {
    return this.httpClient
      .post<AuthResponseData>(`http://localhost:3000/users/${mode}`, {
        username: username,
        password,
      })
      .pipe(
        catchError(this.handleError),
        tap({
          next: (resData) => {
            console.log('🐶');
            const expirationDate = new Date(
              Date.now() + resData.expiresIn * 1000
            );
            const user = new User(
              resData.username,
              resData.token,
              expirationDate,
              resData.permission
            );
            this.user.set(user);
            this.autoLogout(resData.expiresIn * 1000);
          },
        })
      );
  }

  logout() {
    this.user.set(undefined);
    this.router.navigate(['/auth']);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }
  private autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown message occurred!';
    console.log(errorRes);
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }

    switch (errorRes.error.message) {
      case 'USERNAME_EXSITS':
        errorMessage = 'A user already 🐻s this name';
        break;
      case 'INVALID_USER_CREDENTIAL':
        errorMessage = 'Username or password incorect.🙂‍↔️';
    }
    return throwError(errorMessage);
  }

  headers = computed(() => {
    const token = this.userData()?.token;
    if (!token || token === null) {
      this.router.navigate(['/auth']);
      return;
    }
    return new HttpHeaders().set('token', token);
  });
}
