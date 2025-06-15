import { Component, inject, OnInit } from '@angular/core';
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

  idUsuarioLogado: number = 10; // Cambiarlo por usuario logado con Token
  /*
    arrayObjetivos = [
      { id: 1, name: 'ARTE', dedicacion: 3},
      { id: 2, name: 'CIENCIA', dedicacion: 4},
      { id: 3, name: 'EDUCACIÓN', dedicacion: 20}
    ];
  */

  arrayObjetivos: Goals [] = [];

  protected openModal (){
    this.dialog.open(FormularioObjetivosComponent, { disableClose: true });
  }

  ngOnInit() {
      this.panelService.getGoals(this.idUsuarioLogado).subscribe({
        next: (data: Goals[]) => {
          this.arrayObjetivos = data;
        },
        error: (error) => {
          console.log(error);
        }
      })
  }
}
