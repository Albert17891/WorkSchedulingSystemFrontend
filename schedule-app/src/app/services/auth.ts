import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginRequest, RegisterRequest } from '../models/auth-models';
import { Observable,tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
   private http=inject(HttpClient);

   private apiUrl='https://localhost:44312/api/user'
   private tokenKey = 'authToken';

   register(data:RegisterRequest):Observable<any>{
    return this.http.post(`${this.apiUrl}/register`,data);
   }

   login(data: LoginRequest): Observable<string> {
  return this.http.post(`${this.apiUrl}/login`, data, { 
    responseType: 'text'
  }).pipe(
    tap(response => {
      if (response) {
        localStorage.setItem(this.tokenKey, response);
      }
    })
  );
}

   logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
