import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Availability, Goals, Interests } from '../interfaces/ipanel.interface';

interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})

export class PanelService {

  private httpClient = inject(HttpClient)
  private API_URL: string = 'http://localhost:3000/api';

  getInterests(idUsuario: number) : Observable<Interests[]> {
    return this.httpClient.get<Interests[]>(`${this.API_URL}/interests/${idUsuario}`)
  }

  getGoals(idUsuario: number) : Observable<Goals[]> {
    return this.httpClient.get<Goals[]>(`${this.API_URL}/goals/${idUsuario}`)
  }

  getAvailability(idUsuario: number) : Observable<Availability[]> {
    return this.httpClient.get<Availability[]>(`${this.API_URL}/availability/${idUsuario}`)
  }
}
