import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgForOf, NgIf, DatePipe } from '@angular/common';

@Component({
  selector: 'app-rutinas-list',
  standalone: true,
  imports: [NgForOf, NgIf, DatePipe],
  templateUrl: './rutinas-list.component.html',
  styleUrls: ['./rutinas-list.component.css']
})
export class RutinasListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  rutinas: any[] = [];

  ngOnInit(): void {
  console.log("🔥 ngOnInit ejecutado"); // 👈 pon este log arriba del todo

  const userId = Number(localStorage.getItem('userId'));
  const token = localStorage.getItem('token');

  if (!userId || !token) {
    console.warn('Faltan userId o token en localStorage');
    return;
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  console.log("✅ Lanzando GET a:", `http://localhost:3000/api/rutinas/user/${userId}`);

  this.http.get<any[]>(`http://localhost:3000/api/rutinas/user/${userId}`, { headers })
  .subscribe({
    next: data => {
      console.log("📦 Rutinas recibidas (detalle):", JSON.stringify(data, null, 2));
      this.rutinas = data;
    },
    error: err => console.error('❌ Error al obtener rutinas:', err)
  });
  }
}
