import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { PanelService } from '../../../services/panel.service';
import { AuthService } from '../../../services/auth.service';
import { Availability } from '../../../interfaces/ipanel.interface';

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
  panelService = inject(PanelService);
  authService = inject(AuthService);
  dialog = inject(Dialog)
  changeDetectorRef = inject(ChangeDetectorRef)

  /*
    arrayDisponibilidad = [
      { id: 1, dia: '0', hora_inicio: '10:00', hora_fin: '12:00'},  --> nombre_dia: 'DOMINGO'
      { id: 2, dia: '1', hora_inicio: '10:00', hora_fin: '12:00'},  --> nombre_dia: 'LUNES'
      { id: 3, dia: '1', hora_inicio: '17:00', hora_fin: '18:30'},  --> nombre_dia: 'LUNES'
      { id: 4, dia: '3', hora_inicio: '10:00', hora_fin: '12:00'},  --> nombre_dia: 'MIÉRCOLES'
      { id: 5, dia: '3', hora_inicio: '17:00', hora_fin: '18:30'},  --> nombre_dia: 'MIÉRCOLES'
      { id: 6, dia: '5', hora_inicio: '10:00', hora_fin: '12:00'}   --> nombre_dia: 'VIERNES'
    ];
  */

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  // Se acuerda que los días empiecen por 0 y el Domingo sea el primer día de la semana (FullCalendar así lo requiere).
  diasSemanaOrdenados = [
    { nombre: 'Lunes', valor: 1 },
    { nombre: 'Martes', valor: 2 },
    { nombre: 'Miércoles', valor: 3 },
    { nombre: 'Jueves', valor: 4 },
    { nombre: 'Viernes', valor: 5 },
    { nombre: 'Sábado', valor: 6 },
    { nombre: 'Domingo', valor: 0 },
  ];

  arrayDisponibilidad: Availability [] = [];

  openModal (modo: 'añadir' | 'actualizar', elemento: Availability, arrayDisponibilidad: Availability []) {
    const dialogRef = this.dialog.open<Availability>(FormularioDisponibilidadComponent, { data: { modo, elemento, arrayDisponibilidad }, disableClose: true });
  
    dialogRef.closed.subscribe((nuevaDisponibilidad: Availability | undefined) => {
      if (nuevaDisponibilidad) {
        // Recargo por completo la lista de disponibilidades porque backend solo devuelve el id del elemento creado, no el objeto Availability completo
        this.panelService.getAvailability(this.authService.getDecodedToken().id).subscribe({
          next: (data) => {
            this.arrayDisponibilidad = data;
            this.changeDetectorRef.markForCheck();
          }
        });
      }
    });
  }

  ngOnInit() {
    this.panelService.getAvailability(this.authService.getDecodedToken().id).subscribe({
      next: (data: Availability[]) => {
        this.arrayDisponibilidad = data;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  deleteAvailability(elemento: Availability) {
    this.panelService.removeAvailability(this.authService.getDecodedToken().id, elemento.id!).subscribe( {
      next: (data: Availability) => {
        const index = this.arrayDisponibilidad.findIndex(i => i.id === elemento.id);
        if (index !== -1) {
          this.arrayDisponibilidad.splice(index, 1);
          this.changeDetectorRef.markForCheck();
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  hasDisponibilidad(diaIndex: number): boolean {
    return this.arrayDisponibilidad.some(item => item.weekday === diaIndex);
  }

  formatearHoras(hora: string | undefined): string {
    if (!hora) return '--:--';
    const date = new Date(`1970-01-01T${hora}`);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
}