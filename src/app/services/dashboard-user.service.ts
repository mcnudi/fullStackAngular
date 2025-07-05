import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Category } from '../interfaces/icategory.interface';
import { Activity } from '../interfaces/iactivity.interface';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CalendarEventsService {
  private apiUrl = environment.backendURL + '/api/events';

  constructor(private http: HttpClient) {}

  getUserEvents(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`);
  }

  getActivitiesByRoutineByDefault(userId: number): Observable<any[]> {
    return this.http
      .get<any[]>(
        `${environment.backendURL}/api/activities/activitiesByRoutine/isDefault/${userId}`
      )
      .pipe(catchError(() => of([])));
  }

  getActivitiesByUserId(userId: number): Observable<any[]> {
    return this.http
      .get<any[]>(
        `${environment.backendURL}/api/activities/activitybyuser/${userId}`
      )
      .pipe(catchError(() => of([])));
  }

  getActivitiesByRoutineId(routineId: number): Observable<any[]> {
    return this.http
      .get<any[]>(
        `${environment.backendURL}/api/activities/selectActivitiesByRoutine/${routineId}`
      )
      .pipe(catchError(() => of([])));
  }

  getAllCategories(): Observable<Category[]> {
    return this.http
      .get<Category[]>(
        `${environment.backendURL}/api/categories/getAllCategories`
      )
      .pipe(catchError(() => of([])));
  }
  addNewActivity(actividad: {
    routines_versions_id: number;
    title: string | null;
    description: string;
    activity_categories_id: number;
    day_of_week: string;
    start_time: string | null;
    end_time: string | null;
  }): Observable<any> {
    return this.http.post(
      `${environment.backendURL}/api/activities/create`,
      actividad
    );
  }

  getIdVersionRoutine(routineId: number): Observable<any[]> {
    return this.http
      .get<any[]>(
        `${environment.backendURL}/api/activities/version/${routineId}`
      )
      .pipe(catchError(() => of([])));
  }
  deleteActivity(activity_id: number): Observable<Activity[]> {
    return this.http
      .delete<Activity[]>(
        `${environment.backendURL}/api/activities/delete/${activity_id}`
      )
      .pipe(catchError(() => of([])));
  }
}
