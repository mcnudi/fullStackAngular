import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-rutinas-list',
  standalone: true,
  imports: [DatePipe, FormsModule, MatIconModule, RouterLink],
  templateUrl: './rutinas-list.component.html',
  styleUrls: ['./rutinas-list.component.css'],
})
export class RutinasListComponent implements OnInit {
  private API_URL = environment.backendURL;
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  username: string = '';
  rutinas: any[] = [];
  router = inject(Router);
  authService = inject(AuthService);

  filtroBusqueda: string = '';
  currentPage: number = 1;
  pageSize: number = 5;

  ngOnInit(): void {
    const userId = this.authService.getDecodedToken().id;
    const token = localStorage.getItem('token');
    this.username = this.authService.getUserName();

    if (!userId || !token) {
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<any[]>(`${this.API_URL}/api/rutinas/user/${userId}`, {
        headers,
      })
      .subscribe({
        next: (data) => {
          this.rutinas = data;
        },
        error: () => {
          
        },
      });
  }

  irAlta() {
    this.router.navigate(['/app/anadirRutina/usuario/']);
  }

  verDetalle(id: string) {
    this.router.navigate(['/app/detalles', id]);
  }

  get rutinasFiltradas() {
    const filtro = this.filtroBusqueda.toLowerCase();
    return this.rutinas.filter((rutina) =>
      rutina.name?.toLowerCase().includes(filtro)
    );
  }

  get paginatedRutinas() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.rutinasFiltradas.slice(start, start + this.pageSize);
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.rutinasFiltradas.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
