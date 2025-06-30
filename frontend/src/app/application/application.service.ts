import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, map, of, tap } from 'rxjs';
import { ApplicationData, UserData } from './applicationData.model';
import { MatSnackBar } from '@angular/material/snack-bar';

export function applicationSorter(a: ApplicationData, b: ApplicationData) {
  const pend = +(b.status === 'PENDING') - +(a.status === 'PENDING');
  if (!pend) {
    // the sorting by Status is stronger!
    return b.id - a.id;
  }
  return pend;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  adminCount: number = 0;
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private snackBar: MatSnackBar
  ) {
    const subscription = this.getUsers('ADMIN').subscribe(
      (admins) => (this.adminCount = admins.length)
    );
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  getMyApplications() {
    const headers = this.authService.headers();
    return this.httpClient
      .get<ApplicationData[]>('http://localhost:3000/applictions/about-me', {
        headers: headers,
      })
      .pipe(
        catchError((err) => this.errorHandler(err)),
        tap((apps) => {console.log(apps);return apps.sort(applicationSorter)})
      );
  }

  getUsers(permission?: 'ADMIN' | 'MEMBER' | 'PEASANT') {
    const headers = this.authService.headers();
    return this.httpClient
      .get<UserData[]>(
        'http://localhost:3000/users' +
          (permission ? `?noapplication=true&permission=${permission}` : ''),
        {
          headers: headers,
        }
      )
      .pipe(
        catchError((err) => this.errorHandler(err))
      );
  }
  getApplications() {
    const headers = this.authService.headers();
    return this.httpClient
      .get<ApplicationData[]>('http://localhost:3000/applictions/', {
        headers: headers,
      })
      .pipe(
        catchError((err) => this.errorHandler(err)),
        tap((apps) => apps.sort(applicationSorter))
      );
  }

  createApplication(username: string) {
    const headers = this.authService.headers();
    return this.httpClient
      .post<ApplicationData>(
        `http://localhost:3000/applictions/${username}`,
        null,
        {
          headers: headers,
        }
      )
      .pipe(catchError((err) => this.errorHandler(err)));
  }

  approveApplication(id: number) {
    const headers = this.authService.headers();
    return this.httpClient
      .post<ApplicationData>(
        `http://localhost:3000/applictions/approve/${id}`,
        null,
        {
          headers: headers,
        }
      )
      .pipe(catchError((err) => this.errorHandler(err)));
  }

  deapproveApplication(id: number) {
    const headers = this.authService.headers();
    return this.httpClient
      .delete<ApplicationData>(
        `http://localhost:3000/applictions/approve/${id}`,
        {
          headers: headers,
        }
      )
      .pipe(catchError((err) => this.errorHandler(err)));
  }

  closeApplication(id: number) {
    const headers = this.authService.headers();
    return this.httpClient
      .delete<ApplicationData>(`http://localhost:3000/applictions/${id}`, {
        headers: headers,
      })
      .pipe(catchError((err) => this.errorHandler(err)));
  }

  errorHandler(errorRes: HttpErrorResponse) {
    let message = 'An unknown message occurred!';

    if (errorRes.error && errorRes.error.error) {
      switch (errorRes.error.error) {
        case 'Forbidden':
          // this.authService.logout();
          window.location.reload();
          message = 'Not Allowed';
          break;
        case 'Unknown Error':
          message = 'An unknown message occurred!';
          break;
        default:
          message = errorRes.error.message;
      }
    }

    this.snackbarError(message);
    return of();
  }

  private snackbarError(message: string) {
    this.snackBar.open(message, 'Dismiss', { duration: 5000 });
  }
}
