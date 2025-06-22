import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DestroyRef, Injectable, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApplicationData } from './applicationData.model';
import {MatIconModule} from '@angular/material/icon';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService implements OnInit {
  adminCount: number = 0;
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    const subscription = this.getUsers('ADMIN').subscribe(
      (admins) => (this.adminCount = admins.length)
    );
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  getMyApplications() {
    const headers = this.authService.headers();
    return this.httpClient.get<ApplicationData[]>(
      'http://localhost:3000/applictions/aboutMe',
      {
        headers: headers,
      }
    );
  }

  getUsers(permission?: 'ADMIN' | 'MEMBER' | 'PEASANT') {
    const headers = this.authService.headers();
    return this.httpClient.get<string[]>(
      'http://localhost:3000/users' +
        (permission ? `?permission=${permission}` : ''),
      {
        headers: headers,
      }
    );
  }
  getApplications() {
    const headers = this.authService.headers();
    return this.httpClient.get<ApplicationData[]>(
      'http://localhost:3000/applictions/',
      {
        headers: headers,
      }
    );
  }

  createApplication(username: string) {
    const headers = this.authService.headers();
    console.log(headers);
    return this.httpClient.post<ApplicationData[]>(
      `http://localhost:3000/applictions/${username}`,
      null,
      {
        headers: headers,
      }
    );
  }

  approveApplication(id: number) {
    const headers = this.authService.headers();
    console.log(headers);
    return this.httpClient.post(
      `http://localhost:3000/applictions/approve/${id}`,
      null,
      {
        headers: headers,
      }
    );
  }
  deapproveApplication(id: number) {
    const headers = this.authService.headers();
    console.log(headers);
    return this.httpClient.delete(
      `http://localhost:3000/applictions/approve/${id}`,
      {
        headers: headers,
      }
    );
  }
}
