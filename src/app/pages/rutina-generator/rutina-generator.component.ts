import { Component, inject } from '@angular/core';
import { LoadingComponent } from '../../shared/loading/loading.component';
import {
  MatProgressSpinnerModule,
} from '@angular/material/progress-spinner';
import { RutinaService } from '../../services/rutina.service';
import { AuthService } from '../../services/auth.service';
import { RecommendedActivities } from '../../interfaces/irecomendedActivity';
import { DialogService } from '../../services/dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rutina-generator',
  imports: [LoadingComponent, MatProgressSpinnerModule],
  templateUrl: './rutina-generator.component.html',
  styleUrl: './rutina-generator.component.css',
})
export class RutinaGeneratorComponent {
  loading = true;
  seleccionado = '';
  actividades: RecommendedActivities[] = [];

  mensajesDeCarga = [
    'Revisando intereses...',
    'Analizando tiempo libre...',
    'Generando rutina ideal...',
    'Casi terminado...',
  ];
  dias = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];
  rutinaService = inject(RutinaService);
  authService = inject(AuthService);
  dialogService = inject(DialogService);
  router = inject(Router);

  groupedActivities: { [dia: string]: RecommendedActivities[] } = {};
  diasGenerados: string[] = [];

  ngOnInit() {
    this.generarRutina();
  }

  getDiaSemana(numero: number): string {
    return this.dias[numero - 1] || 'Desconocido';
  }

  groupActivitiesByDay(actividades: RecommendedActivities[]): void {
    const grupos: { [dia: string]: RecommendedActivities[] } = {};
    for (const act of actividades) {
      const diaNombre = this.getDiaSemana(Number(act.day));
      if (!grupos[diaNombre]) {
        grupos[diaNombre] = [];
      }
      grupos[diaNombre].push(act);
    }

    for (const dia in grupos) {
      grupos[dia].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }

    this.groupedActivities = grupos;

    this.diasGenerados = this.dias.filter((dia) => grupos[dia]);
  }

  generarRutina(): void {
    const userId = this.authService.getDecodedToken().id;

    this.rutinaService.generarRutina(userId).subscribe({
      next: (actividades) => {
        if (!actividades || actividades.length === 0) {
          this.dialogService
            .confirm(
              'Error generando rutina',
              `Vaya... no hemos podido generar una rutina para ti. Asegúrate de haber registrado tus intereses, objetivos y disponibilidad horaria. ¿Quieres revisar tu perfil?`
            )
            .then((confirmed) => {
              if (confirmed) {
                this.router.navigate(['app/panel']);
              } else {
                this.router.navigate(['app/rutina']);
              }
            });
          return;
        }

        this.actividades = actividades;
        this.groupActivitiesByDay(actividades);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error generando rutina', err);
        this.loading = false;
      },
    });
  }
}
