import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Irutina } from '../interfaces/irutina';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RutinaService {

  private http = inject(HttpClient)
  private baseURL: string = "http://localhost:3000/api/rutinas"

  insertRutina(rutina:Irutina): Observable<Irutina> {
      return this.http.post<Irutina>(
        `${this.baseURL}`,rutina);
    }
  modificarRutina(rutina:Irutina): Observable<Irutina> {
      return this.http.put<Irutina>(
        `${this.baseURL}`,rutina);
    }
   
}
