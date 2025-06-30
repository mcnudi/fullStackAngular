import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { PanelService } from '../../../services/panel.service';
import { Goals, Interests } from '../../../interfaces/ipanel.interface';
import { AuthService } from '../../../services/auth.service';

import { Dialog } from '@angular/cdk/dialog'
import { FormularioObjetivosComponent } from './dialogos/formulario-objetivos.component';
import { MatIcon } from '@angular/material/icon';
import { DialogService } from '../../../services/dialog.service';
import { ToastService } from '../../../services/toast.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-objetivos',
  standalone: true,
  imports: [MatExpansionModule,MatIcon],
  templateUrl: './objetivos.component.html',
  styleUrls: ['./objetivos.component.css'],
})
export class ObjetivosComponent implements OnInit {
  panelService = inject(PanelService);
  authService = inject(AuthService);
  dialog = inject(Dialog);
  changeDetectorRef = inject(ChangeDetectorRef);
  toastService = inject(ToastService);
  dialogService = inject(DialogService);
  
  /*
    arrayObjetivos = [
      { id: 1, users_id: 10, users_interests_id: 1, goals_name: 'ARTE', description: '', hours_per_week: 3},
      { id: 2, users_id: 10, users_interests_id: 3, goals_name: 'CIENCIA', description: '', hours_per_week: 4},
      { id: 3, users_id: 10, users_interests_id: 4, goals_name: 'EDUCACIÓN', description: '', hours_per_week: 20}
    ];
  */

  arrayObjetivos: Goals [] = [];
  arrayIntereses: Interests [] = [];
  interesColorMap = new Map<number, string>();


  usuarioTieneIntereses(): Observable<boolean> {
    const userId = this.authService.getDecodedToken().id;
    return this.panelService.userHasInterests(userId).pipe(
      map(response => response.hasInterests), catchError(err => {
        console.error('⛔ Error al verificar intereses:', err);
        return of(false); // Devuelve false si hay error
      })
    );
  }

  openModal (modo: 'añadir' | 'actualizar', elemento: Goals) {
    // Si no hay Intereses creados, no puede crear Objetivos
    this.usuarioTieneIntereses().subscribe(async tiene => {
      if (tiene) {
        const dialogRef = this.dialog.open<Goals>(FormularioObjetivosComponent, { data: { modo, elemento }, disableClose: true });

        if (modo === 'añadir') {
          dialogRef.closed.subscribe((nuevoObjetivo: Goals | undefined) => {
            if (nuevoObjetivo) {
              this.arrayObjetivos.push(nuevoObjetivo); // o llama a loadInterests()
              this.changeDetectorRef.markForCheck();
            }
          });
        }
        else {
          dialogRef.closed.subscribe((actualizadoObjetivo: Goals | undefined) => {
            if (actualizadoObjetivo) {
              const index = this.arrayObjetivos.findIndex(i => i.id === elemento.id);
              if (index !== -1) {
                this.arrayObjetivos[index].users_interests_id = actualizadoObjetivo.users_interests_id;
                this.arrayObjetivos[index].goals_name = actualizadoObjetivo.goals_name;
                this.arrayObjetivos[index].description = actualizadoObjetivo.description;
                this.arrayObjetivos[index].hours_per_week = actualizadoObjetivo.hours_per_week;
              }
              this.changeDetectorRef.markForCheck();
            }
          });
        }
      } else {
        const confirmed = await this.dialogService.confirm(
          'Advertencia',
          `Antes de crear Objetivos debes crear Intereses`
        );
      }
    });
  }

  ngOnInit() {
    this.panelService.getInterests(this.authService.getDecodedToken().id).subscribe({
      next: (data: Interests[]) => {
        this.arrayIntereses = data;
        this.interesColorMap.clear();
        data.forEach(interes => {
          if (interes.id != null && interes.color != null) {
            this.interesColorMap.set(interes.id, interes.color);
          }
        });
      },
      error: (error) => {
        console.log(error);
      }
    });

    this.panelService.actualizarObjetivos$.subscribe(() => {
       // Método que recarga los objetivos cuando han sido insertados/actualizados
      this.cargarObjetivos();
    });
    this.cargarObjetivos();
  }

  cargarObjetivos() {
    this.panelService.getGoals(this.authService.getDecodedToken().id).subscribe({
      next: (data: Goals[]) => {
        this.arrayObjetivos = data;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  async deleteGoal(elemento: Goals) {
    const confirmed = await this.dialogService.confirm(
      'Confirmar borrado',
      `¿Estás seguro de que quieres eliminarlo?
      ¡¡Si confirmas, a continuación se borrarán también las ACTIVIDADES asociadas a estos OBJETIVOS que se hayan incluido en RUTINAS!!`
    );

    if (confirmed) {
      try {
        this.panelService.removeGoals(this.authService.getDecodedToken().id, elemento.id!).subscribe( {
          next: (data: Goals) => {
            const index = this.arrayObjetivos.findIndex(i => i.id === elemento.id);
            if (index !== -1) {
              this.arrayObjetivos.splice(index, 1);
              this.changeDetectorRef.markForCheck();
            }
          },
          error: (error) => {
            console.log(error);
          }
        });
      } catch (err) {
        this.toastService.showError('Error al borrar el Interés.');
      }
    }
  }

  getNombreInteres(id: number): string {
    const interes = this.arrayIntereses.find(i => Number(i.id) === Number(id));
    return interes ? interes.interest_name! : 'Interés no encontrado';
  }

  getColorInteres(id: number): string {
    return this.interesColorMap.get(Number(id)) || 'lightgray';
  }
}