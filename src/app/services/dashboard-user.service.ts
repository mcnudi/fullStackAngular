import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CalendarEventsService {
  private apiUrl = 'http://localhost:3000/api/events'; // AJUSTADO

  constructor(private http: HttpClient) {}

  getUserEvents(userId: string): Observable<any[]> {
    // Asegúrate de que esta ruta esté bien definida en tu backend
    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`);
  }
  getActivitiesByUserId(userId: number): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:3000/api/activities/activitybyuser/${userId}`);
}

}
