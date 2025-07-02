import { Component, inject } from '@angular/core';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RutinaService } from '../../services/rutina.service';
import { AuthService } from '../../services/auth.service';
import { RecommendedActivities } from '../../interfaces/irecomendedActivity';
import { DialogService } from '../../services/dialog.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

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
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];
  rutinaService = inject(RutinaService);
  authService = inject(AuthService);
  dialogService = inject(DialogService);
  toastService = inject(ToastService);
  router = inject(Router);

  groupedActivities: { [dia: string]: RecommendedActivities[] } = {};
  diasGenerados: string[] = [];

  ngOnInit() {
    this.generarRutina();
  }

  getDiaSemana(numero: number): string {
    return this.dias[numero] || 'Desconocido';
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

    const ordenNumerico = [1, 2, 3, 4, 5, 6, 0];
    this.diasGenerados = ordenNumerico
      .map((num) => this.getDiaSemana(num))
      .filter((dia) => grupos[dia]);
  }

  generarRutina(): void {
    const userId = this.authService.getDecodedToken().id;

    this.rutinaService.generarRutina(userId).subscribe({
      next: (actividades) => {
        console.log('Actividades generadas:', actividades);
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
        this.toastService.showError(
          'Ha ocurrido un error al generar la rutina intentelo de nuevo mas tarde'
        );
        this.loading = false;
        this.router.navigate(['app', 'rutina']);
      },
    });
  }

  async guardarRutinaRecomendada() {
    const actividadesRecomendadas = this.actividades;
    const userId = this.authService.getDecodedToken().id;
    //crear una rutina
    const automatedRoutine = {
      name: this.generarNombreRutina(),
      description: 'Rutina generada automaticamente en base a tu perfil',
      defecto: true,
      usuario: userId,
      is_shared: false,
      is_frequent: false,
      is_default: true,
      id: 0,
      version_number: 1,
      idVersion: 1,
      created_at: new Date(),
    };
    const { idRutina } = await this.rutinaService.insertarRutinaGenerada(
      automatedRoutine
    );

    const { success } = await this.rutinaService.guardarActividadesSugeridas(
      actividadesRecomendadas,
      idRutina
    );

    if (success) {
      this.router.navigate(['app', 'rutina']);
      this.toastService.showSuccess(
        'Rutina generada correctamente y guardada en tu perfil'
      );
      return;
    }
    alert('Error cresting the recommended activity');
  }

  generarNombreRutina(): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let fragmento = '';

    for (let i = 0; i < 3; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      fragmento += caracteres[indiceAleatorio];
    }

    return `Rutina [${fragmento}] personalizada`;
  }
}
