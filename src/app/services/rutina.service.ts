import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  GenerarRutinaResponse,
  Irutina,
} from '../interfaces/irutina.interface';
import { lastValueFrom, Observable } from 'rxjs';
import { RecommendedActivities } from '../interfaces/irecomendedActivity';
import { IRutinaPaginada } from '../interfaces/i-rutina-paginada.interface';

@Injectable({
  providedIn: 'root',
})
export class RutinaService {
  private http = inject(HttpClient);
  private baseURL: string = 'http://localhost:3000/api/rutinas';

  insertRutina(rutina: Irutina): Observable<Irutina> {
    return this.http.post<Irutina>(`${this.baseURL}`, rutina);
  }

  insertarRutinaGenerada(rutina: Irutina): Promise<GenerarRutinaResponse> {
    return lastValueFrom(
      this.http.post<GenerarRutinaResponse>(
        `${this.baseURL}/generate/add`,
        rutina
      )
    );
  }

  modificarRutina(rutina: Irutina): Observable<Irutina> {
    return this.http.put<Irutina>(`${this.baseURL}`, rutina);
  }

  // obtener rutinas por ID de usuario (requiere token)
  getRutinasByUser(userId: number, token: string): Observable<Irutina[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Irutina[]>(`${this.baseURL}/user/${userId}`, {
      headers,
    });
  }

  obtenerRutinas(id: number): Observable<Irutina[]> {
    return this.http.get<Irutina[]>(`${this.baseURL}/${id}`);
  }

  obtenerRutinaVersiones(
    id: number,
    page: number
  ): Observable<IRutinaPaginada> {
    console.log('la rutina es:', id);
    return this.http.get<IRutinaPaginada>(
      `${this.baseURL}/version/${id}/${page}`
    );
  }

  generarRutina(id: number): Observable<RecommendedActivities[]> {
    return this.http.get<RecommendedActivities[]>(
      `${this.baseURL}/generate/${id}`
    );
  }

  guardarActividadesSugeridas(
    actividades: RecommendedActivities[],
    routineId: number
  ): Promise<{
    success: boolean;
    inserts: number[];
  }> {
    const endpoint = `http://localhost:3000/api/activities/generated/add/${routineId}`;
    return lastValueFrom(
      this.http.post<{ success: boolean; inserts: number[] }>(
        endpoint,
        actividades
      )
    );
  }

  ponerVersionPorDefecto(
    rutina: number,
    idVersion: number
  ): Observable<number> {
    return this.http.put<number>(`${this.baseURL}/version/${rutina}`, {
      idVersion,
    });
  }

  descargarPdf(rutinaId: number) {
    return this.http.get(`${this.baseURL}/generatePdf/${rutinaId}`, {
      responseType: 'blob',
    });
  }

  compartirRutina(rutinaId: number, correo: string): Observable<any> {
    return this.http.post(`${this.baseURL}/sendMail/${rutinaId}`, {
      email: correo,
    });
  }
}
