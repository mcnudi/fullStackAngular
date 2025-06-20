import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Activity } from '../interfaces/iactivity.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RutinaGeneratorService {
  private API_URL = 'http://localhost:3000/api/rutinaGenerator/';

  constructor(private http: HttpClient) {}
  generarRutina(): Observable<Activity[]> {
    const actividadesSimuladas: Activity[] = [
      // LUNES
      {
        id: 1,
        routines_versions_id: 1,
        title: 'Correr',
        description: 'Correr al aire libre',
        activity_categories_id: 1,
        day_of_week: 1,
        start_time: '07:00',
        end_time: '07:30',
      },
      {
        id: 2,
        routines_versions_id: 1,
        title: 'Flexiones',
        description: 'Flexiones de pecho',
        activity_categories_id: 2,
        day_of_week: 1,
        start_time: '07:35',
        end_time: '07:45',
      },
      {
        id: 3,
        routines_versions_id: 1,
        title: 'Estiramientos',
        description: 'Estiramientos de piernas y espalda',
        activity_categories_id: 4,
        day_of_week: 1,
        start_time: '07:50',
        end_time: '08:00',
      },

      // MARTES
      {
        id: 4,
        routines_versions_id: 1,
        title: 'Yoga',
        description: 'Yoga de movilidad articular',
        activity_categories_id: 5,
        day_of_week: 2,
        start_time: '18:00',
        end_time: '18:45',
      },
      {
        id: 5,
        routines_versions_id: 1,
        title: 'Meditación',
        description: 'Relajación guiada post-yoga',
        activity_categories_id: 6,
        day_of_week: 2,
        start_time: '18:50',
        end_time: '19:10',
      },

      // MIÉRCOLES
      {
        id: 6,
        routines_versions_id: 1,
        title: 'Natación',
        description: 'Sesión en piscina de 30 minutos',
        activity_categories_id: 7,
        day_of_week: 3,
        start_time: '20:00',
        end_time: '20:30',
      },

      // JUEVES
      {
        id: 7,
        routines_versions_id: 1,
        title: 'HIIT',
        description: 'Entrenamiento por intervalos de alta intensidad',
        activity_categories_id: 8,
        day_of_week: 4,
        start_time: '07:00',
        end_time: '07:25',
      },
      {
        id: 8,
        routines_versions_id: 1,
        title: 'Enfriamiento',
        description: 'Respiración + estiramientos suaves',
        activity_categories_id: 4,
        day_of_week: 4,
        start_time: '07:30',
        end_time: '07:45',
      },

      // VIERNES
      {
        id: 9,
        routines_versions_id: 1,
        title: 'Caminata',
        description: 'Paseo largo en zona verde',
        activity_categories_id: 1,
        day_of_week: 5,
        start_time: '18:00',
        end_time: '18:40',
      },

      // DOMINGO
      {
        id: 10,
        routines_versions_id: 1,
        title: 'Pilates',
        description: 'Fortalecimiento de core',
        activity_categories_id: 9,
        day_of_week: 7,
        start_time: '10:00',
        end_time: '10:40',
      },
      {
        id: 11,
        routines_versions_id: 1,
        title: 'Lectura consciente',
        description: 'Leer en silencio como forma de mindfulness',
        activity_categories_id: 10,
        day_of_week: 7,
        start_time: '10:45',
        end_time: '11:00',
      },
    ];

    return new Observable<Activity[]>((observer) => {
      setTimeout(() => {
        observer.next(actividadesSimuladas);
        observer.complete();
      }, 1000);
    });

    // return this.http.get<Activity[]>(`${this.API_URL}generate`);
  }
}
