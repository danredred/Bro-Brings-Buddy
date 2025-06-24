import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, tap, throwError } from 'rxjs';
import { ApplicationData } from './applicationData.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService{
  adminCount: number = 0;
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private destroyRef: DestroyRef
  ) {
    console.log('🤠')
    const subscription = this.getUsers('ADMIN').subscribe(
      (admins) => (this.adminCount = admins.length)
    );
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  ngOnInit(): void {
    
  }

  getMyApplications() {
    const headers = this.authService.headers();
    return this.httpClient
      .get<ApplicationData[]>('http://localhost:3000/applictions/about-me', {
        headers: headers,
      })
      .pipe(
        catchError(this.errorHandler),
        tap((apps) => apps.sort((a, b) => b.id - a.id))
      );
  }

  getUsers(permission?: 'ADMIN' | 'MEMBER' | 'PEASANT') {
    const headers = this.authService.headers();
    return this.httpClient
      .get<string[]>(
        'http://localhost:3000/users' +
          (permission ? `?noapplication=true&permission=${permission}` : ''),
        {
          headers: headers,
        }
      )
      .pipe(catchError(this.errorHandler));
  }
  getApplications() {
    const headers = this.authService.headers();
    return this.httpClient
      .get<ApplicationData[]>('http://localhost:3000/applictions/', {
        headers: headers,
      })
      .pipe(
        catchError(this.errorHandler),
        tap((apps) => apps.sort((a, b) => b.id - a.id))
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
      .pipe(catchError(this.errorHandler));
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
      .pipe(catchError(this.errorHandler));
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
      .pipe(catchError(this.errorHandler));
  }
  
  closeApplication(id: number) {
    const headers = this.authService.headers();
    return this.httpClient
      .delete<ApplicationData>(`http://localhost:3000/applictions/${id}`, {
        headers: headers,
      })
      .pipe(catchError(this.errorHandler));
  }

  errorHandler(errorRes: HttpErrorResponse) {
    let message = 'An unknown message occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(message);
    }

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
    return throwError(message);
  }
}
