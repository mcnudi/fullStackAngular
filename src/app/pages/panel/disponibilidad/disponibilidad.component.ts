import { Component, inject, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { Availability } from '../../../interfaces/ipanel.interface';
import { PanelService } from '../../../services/panel.service';
import { AuthService } from '../../../services/auth.service';

import { Dialog } from '@angular/cdk/dialog'
import { FormularioDisponibilidadComponent } from './dialogos/formulario-disponibilidad.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-disponibilidad',
  standalone: true,
  imports: [MatExpansionModule, MatIcon],
  templateUrl: './disponibilidad.component.html',
  styleUrls: ['./disponibilidad.component.css'],
})
export class DisponibilidadComponent implements OnInit {
  panelService = inject(PanelService)
  authService = inject(AuthService)
  dialog = inject(Dialog)

  idUsuarioLogado: number = 10; // Cambiarlo por usuario logado con Token
  /*
    arrayDisponibilidad = [
      { id: 1, dia: '0', nombre_dia: 'LUNES', hora_inicio: '10:00', hora_fin: '12:00'},
      { id: 2, dia: '0', nombre_dia: 'LUNES',  hora_inicio: '17:00', hora_fin: '18:30'},
      { id: 3, dia: '2', nombre_dia: 'MIÉRCOLES',  hora_inicio: '10:00', hora_fin: '12:00'},
      { id: 4, dia: '2', nombre_dia: 'MIÉRCOLES',  hora_inicio: '17:00', hora_fin: '18:30'},
      { id: 5, dia: '4', nombre_dia: 'VIERNES',  hora_inicio: '10:00', hora_fin: '12:00'}
    ];
  */
 
  arrayDisponibilidad: Availability [] = [];

  protected openModal (){
    this.dialog.open(FormularioDisponibilidadComponent, { disableClose: true });
  }

  ngOnInit() {
    this.panelService.getAvailability(this.idUsuarioLogado).subscribe({
      next: (data: Availability[]) => {
        this.arrayDisponibilidad = data;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
}
