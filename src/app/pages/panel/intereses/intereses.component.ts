import { Component, OnInit, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { PanelService } from '../../../services/panel.service';
import { AuthService } from '../../../services/auth.service';
import { Interests } from '../../../interfaces/ipanel.interface';

import { Dialog } from '@angular/cdk/dialog'
import { FormularioInteresesComponent } from './dialogos/formulario-intereses.component';

@Component({
  selector: 'app-intereses',
  standalone: true,
  imports: [MatExpansionModule],
  templateUrl: './intereses.component.html',
  styleUrls: ['./intereses.component.css'],
})
export class InteresesComponent implements OnInit {
  idUsuarioLogado: number = 17; // Cambiarlo por usuario logado con Token
  /*
    arrayIntereses = [
      { id: 1, interest_name: 'ARTE' },
      { id: 2, interest_name: 'CIENCIA' },
      { id: 3, interest_name: 'EDUCACIÓN' }
    ];
  */

  arrayIntereses: Interests [] = [];
  
  constructor(
    private panelService: PanelService,
    private authService: AuthService)
    {}

  private dialog = inject(Dialog)

  protected openModal (){
    this.dialog.open(FormularioInteresesComponent, { disableClose: true });
  }

  ngOnInit() {
    this.panelService.getInterests(this.idUsuarioLogado).subscribe({
      next: (data: Interests[]) => {
        this.arrayIntereses = data;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
}
