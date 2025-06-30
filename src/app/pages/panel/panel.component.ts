import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { InteresesComponent } from './intereses/intereses.component';
import { ObjetivosComponent } from './objetivos/objetivos.component';
import { DisponibilidadComponent } from './disponibilidad/disponibilidad.component';



@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [InteresesComponent, ObjetivosComponent, DisponibilidadComponent],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css'],
})
export class PanelComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit() {
    const userName = this.authService.getUserName();
    if (!userName) {
      console.error('User ID not found. Please log in.');
    }
  }
}
