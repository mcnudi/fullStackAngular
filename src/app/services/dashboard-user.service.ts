import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class CalendarEventsService {

   private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getUserEvents(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/events?userId=${userId}`);
  }





}
