import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { catchError, map, Observable, of } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog'

import { PanelService } from '../../../services/panel.service';
import { DialogService } from '../../../services/dialog.service';
import { ToastService } from '../../../services/toast.service';
import { Goals, Interests } from '../../../interfaces/ipanel.interface';
import { FormularioObjetivosComponent } from './dialogos/formulario-objetivos.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-objetivos',
  standalone: true,
  imports: [MatExpansionModule, MatIcon],
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

  ngOnInit() {
    this.cargarObjetivos();
    this.cargarIntereses();

    // Si se recibe notificación de otro componente para que se actualice la vista de Objetivos
    this.panelService.repintarObjetivos$.subscribe({
      next: (data: any) => {
        this.cargarObjetivos();
        this.cargarIntereses();
      },
      error: (error) => {
        console.log(error);
        this.toastService.showError('Error al inicializar el componente objetivos.');
      }
    });
  }

  openModal (modo: 'añadir' | 'actualizar', elemento: Goals) {
    // Si no hay Intereses creados, no puede crear Objetivos
    this.usuarioTieneIntereses().subscribe(async tiene => {
      if (tiene) {
        const dialogRef = this.dialog.open<Goals>(FormularioObjetivosComponent, { data: { modo, elemento }, disableClose: true });

        if (modo === 'añadir') {
          dialogRef.closed.subscribe((nuevoObjetivo: Goals | undefined) => {
            if (nuevoObjetivo) {
              this.arrayObjetivos.push(nuevoObjetivo);
              this.changeDetectorRef.markForCheck();
            }
          });
        }
        else { // 'actualizar'
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
        const { confirmed } = await this.dialogService.confirm(
          'Advertencia',
          `Antes de crear Objetivos debes crear Intereses`
        );
      }
    });
  }

  usuarioTieneIntereses(): Observable<boolean> {
    const userId = this.authService.getDecodedToken().id;
    return this.panelService.userHasInterests(userId).pipe(
      map(response => response.hasInterests), catchError(err => {
        const mensaje = '⛔ Error al verificar intereses:' + err;
        console.error(mensaje);
        this.toastService.showError(mensaje);        
        return of(false); // Devuelve false si hay error
      })
    );
  }

  cargarIntereses() {
    this.panelService.getInterests(this.authService.getDecodedToken().id).subscribe({
      next: (data: Interests[]) => {
        this.arrayIntereses = data;
        // Se almacenan los colores en un Map para acelerar el repintado del componente con los colores asociados
        this.interesColorMap.clear();
        data.forEach(interes => {
          if (interes.id != null && interes.color != null) {
            this.interesColorMap.set(interes.id, interes.color);
          }
        });
      },
      error: (error) => {
        console.log(error);
        this.toastService.showError('Error al cargar los Intereses.');
      }
    });
  }
  
  cargarObjetivos() {
    this.panelService.getGoals(this.authService.getDecodedToken().id).subscribe({
      next: (data: Goals[]) => {
        this.arrayObjetivos = data;
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.log(error);
        this.toastService.showError('Error al cargar los Objetivos.');
      }
    })
  }

  async deleteGoal(elemento: Goals) {
    const { confirmed } = await this.dialogService.confirm(
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
            this.toastService.showError('Error al borrar el Objetivo.');
          }
        });
      } catch (err) {
        this.toastService.showError('Error durante el borrado del Objetivo.');
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