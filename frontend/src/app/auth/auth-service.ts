import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface AuthResponseData{
  token: string;
  createdDate: Date;
  experationDate: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient: HttpClient) {}

  signup(username:string,password:string){
    return this.httpClient.post('localhost:3000/auth/signin',{email: username,password})
  } 
  login(username:string,password:string){
    return this.httpClient.post('localhost:3000/auth/login',{email: username,password})
  } 
}
