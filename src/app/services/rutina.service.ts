import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Irutina } from '../interfaces/irutina.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RutinaService {

  private http = inject(HttpClient)
  private baseURL: string = "http://localhost:3000/api/rutinas"

  insertRutina(rutina: Irutina): Observable<Irutina> {
    return this.http.post<Irutina>(
      `${this.baseURL}`, rutina
    );
  }

  modificarRutina(rutina: Irutina): Observable<Irutina> {
    return this.http.put<Irutina>(`${this.baseURL}`, rutina);
  }

  // obtener rutinas por ID de usuario (requiere token)
  getRutinasByUser(userId: number, token: string): Observable<Irutina[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<Irutina[]>(`${this.baseURL}/user/${userId}`, { headers });
  }

  obtenerRutinas(id:number):Observable<Irutina[]>{
    return this.http.get<Irutina[]>(`${this.baseURL}/${id}`);
  }

  obtenerRutinaVersiones(id:number):Observable<Irutina[]>{
    return this.http.get<Irutina[]>(`${this.baseURL}/version/${id}`);
  }
}
