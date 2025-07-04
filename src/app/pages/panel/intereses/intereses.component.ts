import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { Dialog } from '@angular/cdk/dialog'

import { PanelService } from '../../../services/panel.service';
import { AuthService } from '../../../services/auth.service';
import { Interests } from '../../../interfaces/ipanel.interface';
import { FormularioInteresesComponent } from './dialogos/formulario-intereses.component';
import { DialogService } from '../../../services/dialog.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-intereses',
  standalone: true,
  imports: [MatExpansionModule, MatIcon],
  templateUrl: './intereses.component.html',
  styleUrls: ['./intereses.component.css'],
})

export class InteresesComponent implements OnInit {
  panelService = inject(PanelService);
  authService = inject(AuthService);
  dialog = inject(Dialog);
  changeDetectorRef = inject(ChangeDetectorRef);
  toastService = inject(ToastService);
  dialogService = inject(DialogService);
  
  /*
    arrayInteresesUsuario = [
      { id: 1, users_id: 10, interest_name: 'ARTE', color: '#FF00FF' },
      { id: 2, users_id: 10, interest_name: 'CIENCIA' },
      { id: 3, users_id: 10, interest_name: 'EDUCACIÓN' }
    ];
  */
 
  arrayInteresesUsuario: Interests [] = [];

  openModal (modo: 'añadir' | 'actualizar', elemento: Interests) {
    const dialogRef = this.dialog.open<Interests>(FormularioInteresesComponent, { data: { modo, elemento }, disableClose: true });
    if (modo === 'añadir') {
      dialogRef.closed.subscribe((nuevoInteres: Interests | undefined) => {
        if (nuevoInteres) {
          this.arrayInteresesUsuario.push(nuevoInteres);
          this.changeDetectorRef.markForCheck();
        }
      });
    } else { // actualizar
      dialogRef.closed.subscribe((actualizadoInteres: Interests | undefined) => {
        if (actualizadoInteres) {
          const index = this.arrayInteresesUsuario.findIndex(i => i.id === elemento.id);
          if (index !== -1) {
            this.arrayInteresesUsuario[index].interest_name = actualizadoInteres.interest_name;
            this.arrayInteresesUsuario[index].color = actualizadoInteres.color;
          }
          this.changeDetectorRef.markForCheck();
        }
      });
    }
    this.panelService.notificarRepintadoObjetivos();
  }

  ngOnInit() {
    this.panelService.getInterests(this.authService.getDecodedToken().id).subscribe( {
      next: (data: Interests[]) => {
        this.arrayInteresesUsuario = data;
      },
      error: (error) => {
        console.log(error);
        this.toastService.showError('Error al inicializar el componente intereses.');
      }
    })
  }

  async deleteInterest(elemento: Interests) {
    const { confirmed } = await this.dialogService.confirm(
      'Confirmar borrado',
      `¿Estás seguro de que quieres elimiarlo?
      ¡¡Si confirmas se borrarán automáticamente los OBJETIVOS asociados y todas las ACTIVIDADES asociadas a estos en las RUTINAS!!`
    );
    if (confirmed) {
      try {
            this.panelService.removeInterests(this.authService.getDecodedToken().id, elemento.interest_name!).subscribe( {
              next: (data: Interests) => {
                const index = this.arrayInteresesUsuario.findIndex(i => i.interest_name === elemento.interest_name);
                if (index !== -1) {
                  this.arrayInteresesUsuario.splice(index, 1);
                  this.changeDetectorRef.markForCheck();
                  this.panelService.notificarRepintadoObjetivos();
                }
              },
              error: (error) => {
                console.log(error);
                this.toastService.showError('Error al borrar el Interés.');
              }
            });
      } catch (err) {
        this.toastService.showError('Error durante el borrado del Interés.');
      }
    }
  }
}