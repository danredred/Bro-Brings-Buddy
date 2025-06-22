import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DestroyRef, Injectable, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApplicationData } from './applicationData.model';

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
    const headers = this.authService.headers();
    const subscription = this.httpClient
      .get<string[]>('http//localhost:3000/users?permission=ADMIN', {
        headers: headers,
      })
      .subscribe((admins) => (this.adminCount = admins.length));
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  getMyApplications(){
    const headers = this.authService.headers();
    return this.httpClient.get<ApplicationData[]>(
      'http//localhost:3000/applictions/aboutMe',
      {
        headers: headers,
      }
    );
  }
}
