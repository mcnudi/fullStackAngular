import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Availability, Goals, Interests } from '../interfaces/ipanel.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})

export class PanelService {

  authService = inject(AuthService);
  httpClient = inject(HttpClient);
  private API_URL: string = 'http://localhost:3000/api';

  // Intereses
  getInterests(idUsuario: number) : Observable<Interests[]> {
    return this.httpClient.get<Interests[]>(`${this.API_URL}/interests/${idUsuario}`)
  }
 
  removeInterests(idUsuario: number, interestName: string) : Observable<Interests> {
    return this.httpClient.delete<Interests>(
      `${this.API_URL}/interests/${idUsuario}/delete/${interestName}`
      );
  }


  // Objetivos
  getGoals(idUsuario: number) : Observable<Goals[]> {
    return this.httpClient.get<Goals[]>(`${this.API_URL}/goals/${idUsuario}`)
  }

  removeGoals(idUsuario: number, goalId: number) : Observable<Interests> {
    console.log(`${this.API_URL}/goals/${idUsuario}/delete/${goalId}`)
    return this.httpClient.delete<Interests>(
      `${this.API_URL}/goals/${idUsuario}/delete/${goalId}`
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

  updateAvailability(idUsuario: number, idAvailability: number, availabilityData: Partial<Availability>): Observable<Availability> {
    debugger;
    return this.httpClient.patch<Availability>(
      `${this.API_URL}/availability/${idUsuario}/${idAvailability}/update`,
      availabilityData
    );
  }


}
