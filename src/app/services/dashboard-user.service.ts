import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Category } from '../interfaces/icategory.interface';






@Injectable({ providedIn: 'root' })
export class CalendarEventsService {
  private apiUrl = 'http://localhost:3000/api/events'; // AJUSTADO

  constructor(private http: HttpClient) {}

  getUserEvents(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`);
  }

  getActivitiesByRoutineByDefault(userId: number): Observable<any[]> {
    return this.http
      .get<any[]>(`http://localhost:3000/api/activities/activitiesByRoutine/isDefault/${userId}`)
      .pipe(
        catchError(() => of([]))
      );
  }

  getActivitiesByUserId(userId: number): Observable<any[]> {
    return this.http
      .get<any[]>(`http://localhost:3000/api/activities/activitybyuser/${userId}`)
      .pipe(
        catchError(() => of([]))
      );
  }

  getActivitiesByRoutineId(routineId: number): Observable<any[]> {
    return this.http
      .get<any[]>(`http://localhost:3000/api/activities/selectActivitiesByRoutine/${routineId}`)
      .pipe(
        catchError(() => of([]))
      );
  }

    getAllCategories(): Observable<Category[]> {
    return this.http
      .get<Category[]>(`http://localhost:3000/api/categories/getAllCategories`)
      .pipe(
        catchError(() => of([]))
      );
  }

}
