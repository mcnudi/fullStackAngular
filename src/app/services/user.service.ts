import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, UserUpdate } from '../interfaces/iuser.interface';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_URL = environment.backendURL + '/api/users';

  constructor(private http: HttpClient) {}

  getByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/username/${username}`);
  }

  updateProfile(username: string, user: UserUpdate): Observable<User> {
    console.log('Updating user profile:', user);
    return this.http.put<User>(
      `${this.API_URL}/update/username/${username}`,
      user
    );
  }

  updateImage(username: string, image: File): Observable<User> {
    const formData = new FormData();
    formData.append('image', image);

    return this.http.put<User>(
      `${this.API_URL}/updateImage/username/${username}`,
      formData
    );
  }

  deleteProfile(username: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/delete/username/${username}`
    );
  }

  getEmailByUsername(username: string): Observable<{ email: string }> {
    return this.http.get<{ email: string }>(
      `${this.API_URL}/recoveryPassword/${username}`
    );
  }

  sendVerificationCode(email: string, code: string) {
    return this.http.post(`${this.API_URL}/recoveryPassword/sendCode`, {
      email,
      code,
    });
  }

  updatePassword(username: string, newPassword: string) {
    return this.http.put(
      `${this.API_URL}/recoveryPassword/updatePassword/${username}`,
      {
        newPassword,
      }
    );
  }
}
