import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, UserUpdate } from '../interfaces/iuser.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_URL = 'http://localhost:3000/api/users';

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
}
