import { HttpClient } from '@angular/common/http';
import {
  DestroyRef,
  effect,
  inject,
  Injectable,
  OnInit,
  signal,
} from '@angular/core';
import { catchError, Subject, tap, throwError } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';

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
      .post<AuthResponseData>(`http://localhost:3000/auth/${mode}`, {
        username: username,
        password,
      })
      .pipe(
        catchError((errorRes) => {
          let errorMassage = 'An unknown message occurred!';
          console.log(errorRes);
          return throwError(errorMassage);
          //switch (errorRes)
        }),
        tap({
          next: (resData) => {
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
    if (this.tokenExpirationTimer){
      clearTimeout(this.tokenExpirationTimer)
    }
    this.tokenExpirationTimer = null;
  }
  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
}
