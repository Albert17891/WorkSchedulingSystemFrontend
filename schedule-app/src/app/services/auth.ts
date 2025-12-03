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

   login(data: LoginRequest): Observable<any> {   
 
  return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
    
    tap(response => {    
      console.log(response)
      if (response && response.token) {
         console.log(response.token)
        localStorage.setItem(this.tokenKey, response.token);
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

  getUserRole():string|null{
    const token =this.getToken();

    if(!token) return null;

    try{
      const payload=JSON.parse(atob(token.split('.')[1]));

      const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

      return payload[roleClaim] || payload['role'] || null;
    }catch (e) {
      return null;
  }
 }
}
