import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { PanelService } from '../../../services/panel.service';
import { Goals } from '../../../interfaces/ipanel.interface';
import { AuthService } from '../../../services/auth.service';

import { Dialog } from '@angular/cdk/dialog'
import { FormularioObjetivosComponent } from './dialogos/formulario-objetivos.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-objetivos',
  standalone: true,
  imports: [MatExpansionModule,MatIcon],
  templateUrl: './objetivos.component.html',
  styleUrls: ['./objetivos.component.css'],
})
export class ObjetivosComponent implements OnInit {
  panelService = inject(PanelService)
  authService = inject(AuthService)
  dialog = inject(Dialog)
  changeDetectorRef = inject(ChangeDetectorRef)

  /*
    arrayObjetivos = [
      { id: 1, name: 'ARTE', dedicacion: 3},
      { id: 2, name: 'CIENCIA', dedicacion: 4},
      { id: 3, name: 'EDUCACIÓN', dedicacion: 20}
    ];
  */

  arrayObjetivos: Goals [] = [];

  openModal (modo: 'añadir' | 'actualizar', elemento: Goals) {
    this.dialog.open(FormularioObjetivosComponent, { data: { modo, elemento }, disableClose: true });
  }

  ngOnInit() {
    this.panelService.getGoals(this.authService.getDecodedToken().id).subscribe({
      next: (data: Goals[]) => {
        this.arrayObjetivos = data;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  deleteGoal(elemento: Goals) {
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
  }
}