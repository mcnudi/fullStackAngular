import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgForOf, NgIf, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-rutinas-list',
  standalone: true,
  imports: [NgForOf, NgIf, DatePipe, MatIcon, RouterLink],
  templateUrl: './rutinas-list.component.html',
  styleUrls: ['./rutinas-list.component.css'],
})
export class RutinasListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  username: string = '';
  rutinas: any[] = [];
  router = inject(Router);
  authService = inject(AuthService);

  ngOnInit(): void {
    console.log('🔥 ngOnInit ejecutado'); // 👈 pon este log arriba del todo

    //const userId = Number(localStorage.getItem('userId'));
    const userId = this.authService.getDecodedToken().id;
    const token = localStorage.getItem('token');
    this.username = this.authService.getUserName();

    if (!userId || !token) {
      console.warn('Faltan userId o token en localStorage');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log(
      '✅ Lanzando GET a:',
      `http://localhost:3000/api/rutinas/user/${userId}`
    );

    this.http
      .get<any[]>(`http://localhost:3000/api/rutinas/user/${userId}`, {
        headers,
      })
      .subscribe({
        next: (data) => {
          console.log(
            '📦 Rutinas recibidas (detalle):',
            JSON.stringify(data, null, 2)
          );
          this.rutinas = data;
        },
        error: (err) => console.error('❌ Error al obtener rutinas:', err),
      });
  }

  irAlta() {
    this.router.navigate(['/app/anadirRutina/usuario/']);
  }
  irDetalle(){
    this.router.navigate(['/app/detalles']);
  }
}
