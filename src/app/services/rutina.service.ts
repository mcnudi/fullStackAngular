import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Irutina } from '../interfaces/irutina';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RutinaService {

  private http = inject(HttpClient)
  private baseURL: string = "http://localhost:3000/api/rutina"

  insertRutina(user:String,rutina:Irutina): Observable<Irutina> {
      //console.log('Updating user profile:', user);
      return this.http.post<Irutina>(
        `${this.baseURL}`,rutina);
    }

   
}
