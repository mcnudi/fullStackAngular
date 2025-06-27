import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { Availability, Goals, Interests } from '../interfaces/ipanel.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})

export class PanelService {
  authService = inject(AuthService);
  httpClient = inject(HttpClient);
  
  private API_URL: string = 'http://localhost:3000/api';

  // Experimental
  private actualizarObjetivosSubject = new Subject<void>();
  actualizarObjetivos$ = this.actualizarObjetivosSubject.asObservable();

  notificarActualizacionObjetivos() {
    this.actualizarObjetivosSubject.next();
  }
  // FIN Experimental
  
  // Intereses
  getInterests(idUsuario: number) : Observable<Interests[]> {
    return this.httpClient.get<Interests[]>(`${this.API_URL}/interests/${idUsuario}`)
  }

  getInterest(idInteres: number) : Observable<Interests> {
    return this.httpClient.get<Interests>(`${this.API_URL}/interests/get/${idInteres}`)
  }
 
  removeInterests(idUsuario: number, interestName: string) : Observable<Interests> {
    return this.httpClient.delete<Interests>(
      `${this.API_URL}/interests/${idUsuario}/delete/${interestName}`
    );
  }

  addInterests(idUsuario: number, interestName: string, color: string) : Observable<Interests> {
    return this.httpClient.post<Interests>(
      `${this.API_URL}/interests/${idUsuario}/add`,
      {
        interestName: interestName,
        color: color
      }
    );
  }

  userHasInterests(idUsuario: number) : Observable<{hasInterests: boolean}> {
    console.log(`${this.API_URL}/interests/userHasInterests/${idUsuario}`)
    return this.httpClient.get<{ hasInterests: boolean }>(`${this.API_URL}/interests/userHasInterests/${idUsuario}`);
  }

  updateInterests(idUsuario: number, interestId: number, interestName: string, color: string) : Observable<Interests> {
    return this.httpClient.patch<Interests>(
      `${this.API_URL}/interests/${idUsuario}/update/${interestId}`,
      {
        interestName: interestName,
        color: color
      }
    );
  }

  // Objetivos
  getGoals(idUsuario: number) : Observable<Goals[]> {
    return this.httpClient.get<Goals[]>(`${this.API_URL}/goals/${idUsuario}`)
  }

  removeGoals(idUsuario: number, goalId: number) : Observable<Goals> {
    return this.httpClient.delete<Goals>(
      `${this.API_URL}/goals/${idUsuario}/delete/${goalId}`
    );
  }
  
  addGoals(idUsuario: number, interestId: number, goalName: string, goalDescription: string, hoursPerWeek: number ) : Observable<Goals> {
    return this.httpClient.post<Goals>(
      `${this.API_URL}/goals/${idUsuario}/add`,
      {
        interests_id: interestId,
        goals_name: goalName,
        goals_description: goalDescription,
        hours_per_week: hoursPerWeek
      }
    );
  }

  updateGoals(idUsuario: number, goalsId: number, usersInterestsId: number, goalsName: string, description: string, hoursPerWeek: number) : Observable<Goals> {
    return this.httpClient.patch<Goals>(
      `${this.API_URL}/goals/${idUsuario}/update/${goalsId}`,
      {
        users_interests_id: usersInterestsId,
        goals_name: goalsName,
        description: description,
        hours_per_week: hoursPerWeek
      }
    );
  }

  // Disponibilidad
  getAvailability(idUsuario: number) : Observable<Availability[]> {
    return this.httpClient.get<Availability[]>(`${this.API_URL}/availability/${idUsuario}`)
  }

  removeAvailability(idUsuario: number, idAvailability: number) : Observable<Availability> {
    return this.httpClient.delete<Availability>(
      `${this.API_URL}/availability/${idUsuario}/${idAvailability}/delete`
    );
  }

  addAvailability(idUsuario: number, dia_semana: number, hora_inicio: string, hora_fin: string) : Observable<Availability> {
    return this.httpClient.post<Availability>(
      `${this.API_URL}/availability/${idUsuario}/add`,
      {
        weekday: Number(dia_semana),
        start_time: hora_inicio + ":00",
        end_time: hora_fin + ":00"
      }
    );
  }

  updateAvailability(idUsuario: number, idAvailability: number, availabilityData: Partial<Availability>): Observable<Availability> {
    return this.httpClient.patch<Availability>(
      `${this.API_URL}/availability/${idUsuario}/${idAvailability}/update`,
      availabilityData
    );
  }
}
