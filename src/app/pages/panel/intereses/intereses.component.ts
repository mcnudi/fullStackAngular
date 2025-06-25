import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { PanelService } from '../../../services/panel.service';
import { AuthService } from '../../../services/auth.service';
import { Interests } from '../../../interfaces/ipanel.interface';

import { Dialog } from '@angular/cdk/dialog'
import { FormularioInteresesComponent } from './dialogos/formulario-intereses.component';
import { MatIcon } from '@angular/material/icon';
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
    arrayIntereses = [
      { id: 1, interest_name: 'ARTE', color: '#FF00FF' },
      { id: 2, interest_name: 'CIENCIA' },
      { id: 3, interest_name: 'EDUCACIÓN' }
    ];
  */
 
  arrayIntereses: Interests [] = [];

  openModal (modo: 'añadir' | 'actualizar', elemento: Interests) {
    const dialogRef = this.dialog.open<Interests>(FormularioInteresesComponent, { data: { modo, elemento }, disableClose: true });

    if (modo === 'añadir') {
      dialogRef.closed.subscribe((nuevoInteres: Interests | undefined) => {
        if (nuevoInteres) {
          this.arrayIntereses.push(nuevoInteres); // o llama a loadInterests()
          this.changeDetectorRef.markForCheck();
        }
      });
    }
    else {
      dialogRef.closed.subscribe((actualizadoInteres: Interests | undefined) => {
        if (actualizadoInteres) {
          const index = this.arrayIntereses.findIndex(i => i.id === elemento.id);
          if (index !== -1) {
            this.arrayIntereses[index].interest_name = actualizadoInteres.interest_name;
            this.arrayIntereses[index].color = actualizadoInteres.color;
          }
          this.changeDetectorRef.markForCheck();
        }
      });
    }
  }

  ngOnInit() {
    this.panelService.getInterests(this.authService.getDecodedToken().id).subscribe( {
      next: (data: Interests[]) => {
        this.arrayIntereses = data;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  async deleteInterest(elemento: Interests) {
    const confirmed = await this.dialogService.confirm(
      'Confirmar borrado',
      `¿Estás seguro de que quieres elimiarlo?
      ¡¡Si confirmas se borrarán automáticamente los OBJETIVOS asociados y todas las ACTIVIDADES asociadas a estos en las RUTINAS!!`
    );

    if (confirmed) {
      try {
            this.panelService.removeInterests(this.authService.getDecodedToken().id, elemento.interest_name!).subscribe( {
              next: (data: Interests) => {
                const index = this.arrayIntereses.findIndex(i => i.interest_name === elemento.interest_name);
                if (index !== -1) {
                  this.arrayIntereses.splice(index, 1);
                  this.changeDetectorRef.markForCheck();
                  this.panelService.notificarActualizacionObjetivos(); // Experimental
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
}