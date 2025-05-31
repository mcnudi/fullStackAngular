import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserAuthenticatedResponse, UserLoginRequest, UserRegisterRequest } from '../interfaces/iuser.interface';


interface AuthResponse {
  token: string;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_URL = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  register(data: UserRegisterRequest): Observable<UserAuthenticatedResponse> {
    return this.http.post<UserAuthenticatedResponse>(
      `${this.API_URL}/register`,
      data
    );
  }

  login(data: UserLoginRequest): Observable<UserAuthenticatedResponse> {
    return this.http.post<UserAuthenticatedResponse>(
      `${this.API_URL}/login`,
      data
    );
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) return null;

    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  getUserRole(): string | null {
    const decoded = this.getDecodedToken();
    const role = decoded?.role;

    return Array.isArray(role) ? role[0] : role;
  }

  getUserName(): any {
    const decoded = this.getDecodedToken();
    return decoded ? decoded.userName : null;
  }
}
