import { Component, inject, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { PanelService } from '../../../services/panel.service';
import { Goals } from '../../../interfaces/ipanel.interface';
import { AuthService } from '../../../services/auth.service';

import { Dialog } from '@angular/cdk/dialog'
import { FormularioObjetivosComponent } from './dialogos/formulario-objetivos.component';


@Component({
  selector: 'app-objetivos',
  standalone: true,
  imports: [MatExpansionModule],
  templateUrl: './objetivos.component.html',
  styleUrls: ['./objetivos.component.css'],
})
export class ObjetivosComponent implements OnInit {
  idUsuarioLogado: number = 17; // Cambiarlo por usuario logado con Token
  /*
    arrayObjetivos = [
      { id: 1, name: 'ARTE', dedicacion: 3},
      { id: 2, name: 'CIENCIA', dedicacion: 4},
      { id: 3, name: 'EDUCACIÓN', dedicacion: 20}
    ];
  */

  arrayObjetivos: Goals [] = [];

  constructor(
    private panelService: PanelService,
    private authService: AuthService)
    {}

  private dialog = inject(Dialog)

  protected openModal (){
    this.dialog.open(FormularioObjetivosComponent, { disableClose: true }); //Probar a abrir componentes modales
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
