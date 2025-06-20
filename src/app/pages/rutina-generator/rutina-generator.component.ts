import { Component, inject } from '@angular/core';
import { LoadingComponent } from '../../shared/loading/loading.component';
import {
  MatProgressSpinnerModule,
} from '@angular/material/progress-spinner';
import { RutinaGeneratorService } from '../../services/rutina-generator.service';
import { Activity } from '../../interfaces/iactivity.interface';
import { interval } from 'rxjs';

@Component({
  selector: 'app-rutina-generator',
  imports: [LoadingComponent, MatProgressSpinnerModule],
  templateUrl: './rutina-generator.component.html',
  styleUrl: './rutina-generator.component.css',
})
export class RutinaGeneratorComponent {
  loading = true;
  seleccionado = '';
  actividades: Activity[] = [];

  mensajesDeCarga = [
    'Revisando intereses...',
    'Analizando tiempo libre...',
    'Generando rutina ideal...',
    'Casi terminado...',
  ];

  rutinaGeneratorService = inject(RutinaGeneratorService);

  groupedActivities: { [dia: string]: Activity[] } = {};
  diasGenerados: string[] = [];

  ngOnInit() {

    interval(4000).subscribe((index) => {
      this.rutinaGeneratorService.generarRutina().subscribe({
        next: (actividades) => {
          this.actividades = actividades;
          this.groupActivitiesByDay(actividades);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error generando rutina', err);
          this.loading = false;
        },
      });
    });

  }

  getDiaSemana(numero: number): string {
    const dias = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];
    return dias[numero - 1] || 'Desconocido';
  }

  groupActivitiesByDay(actividades: Activity[]): void {
    const grupos: { [dia: string]: Activity[] } = {};
    for (const act of actividades) {
      const diaNombre = this.getDiaSemana(act.day_of_week);
      if (!grupos[diaNombre]) {
        grupos[diaNombre] = [];
      }
      grupos[diaNombre].push(act);
    }

    // Ordena actividades por hora de inicio
    for (const dia in grupos) {
      grupos[dia].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }

    this.groupedActivities = grupos;
    this.diasGenerados = Object.keys(grupos); // 👈 Aquí extraes los días
  }
}
