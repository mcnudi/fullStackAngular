import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { PanelService } from '../../../services/panel.service';
import { AuthService } from '../../../services/auth.service';
import { Interests } from '../../../interfaces/ipanel.interface';

import { Dialog } from '@angular/cdk/dialog'
import { FormularioInteresesComponent } from './dialogos/formulario-intereses.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-intereses',
  standalone: true,
  imports: [MatExpansionModule, MatIcon],
  templateUrl: './intereses.component.html',
  styleUrls: ['./intereses.component.css'],
})
export class InteresesComponent implements OnInit {
  panelService = inject(PanelService)
  authService = inject(AuthService)
  dialog = inject(Dialog)
  changeDetectorRef = inject(ChangeDetectorRef)
  
  /*
    arrayIntereses = [
      { id: 1, interest_name: 'ARTE', color: 'FF00FF' },
      { id: 2, interest_name: 'CIENCIA' },
      { id: 3, interest_name: 'EDUCACIÓN' }
    ];
  */
 
  arrayIntereses: Interests [] = [];

  openModal (modo: 'añadir' | 'actualizar', elemento: Interests) {
    this.dialog.open(FormularioInteresesComponent, { data: { modo, elemento }, disableClose: true });
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

  deleteInterest(elemento: Interests) {
    this.panelService.removeInterests(this.authService.getDecodedToken().id, elemento.interest_name!).subscribe( {
      next: (data: Interests) => {
        const index = this.arrayIntereses.findIndex(i => i.interest_name === elemento.interest_name);
        if (index !== -1) {
          this.arrayIntereses.splice(index, 1);
          this.changeDetectorRef.markForCheck();
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}