import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Subject, tap, throwError } from 'rxjs';
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
  user = new Subject<User>();
  constructor(private httpClient: HttpClient) {}

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
            const expirationDate = new Date(Date.now()+resData.expiresIn*1000)
            const user = new User(
              resData.username,
              resData.token,
              expirationDate,
              resData.permission
            );
            this.user.next(user);
          },
        })
      );
  }
}
