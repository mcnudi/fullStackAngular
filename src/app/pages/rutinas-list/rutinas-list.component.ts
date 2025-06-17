import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rutinas-list',
  imports: [RouterModule],
  templateUrl: './rutinas-list.component.html',
  styleUrl: './rutinas-list.component.css'
})
export class RutinasListComponent {
  routerL = inject(ActivatedRoute);
  username:string="";

  async ngOnInit() {
    this.username = this.routerL.snapshot.paramMap.get('usuario') || '';
    
  }
}

@Injectable({
  providedIn: 'root'
})
export class RutinaService {
  private baseUrl = 'http://localhost:3000/rutinas'; // Ajusta si tienes proxy

  constructor(private http: HttpClient) {}

  getRutinasByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/${userId}`);
  }
}