import { Component, Inject, OnInit, inject } from '@angular/core';

import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { Goals, Interests } from '../../../../interfaces/ipanel.interface';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastService } from '../../../../services/toast.service';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../../services/auth.service';
import { PanelService } from '../../../../services/panel.service';

@Component({
  selector: 'app-formulario-objetivos',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatIcon],
  templateUrl: './formulario-objetivos.component.html',
  styleUrls: ['./formulario-objetivos.component.css'],
})
export class FormularioObjetivosComponent implements OnInit {
  panelService = inject(PanelService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  dialogRef = inject(DialogRef, { optional: true});

  modo: 'añadir' | 'actualizar';
  objetivoActual: Goals;

  // Recepción de datos del Objetivo actual desde el componente Objetivos del Panel
  constructor(@Inject(DIALOG_DATA) public data: { modo: 'añadir' | 'actualizar', elemento: Goals }) {
    this.modo = data.modo || 'añadir';
    this.objetivoActual = data?.elemento!
  };

  arrayIntereses: Interests [] = [];

  goalsForm = new FormGroup({
    goals_name: new FormControl('', Validators.required),
    interest_id: new FormControl('', Validators.required),
    description: new FormControl('', ),
    hours_per_week: new FormControl('1', Validators.required)
  });

  ngOnInit() {
    // Carga previa de array de intereses para pintarlos en el desplegable de Interés Asociado
    this.panelService.getInterests(this.authService.getDecodedToken().id).subscribe( {
      next: (data: Interests[]) => {
        this.arrayIntereses = data;
        if (this.arrayIntereses.length > 0) {
          // Muestra como selección por defecto el primer Interés
          this.goalsForm.patchValue({
            interest_id: String(this.arrayIntereses[0].id)
          });
        }
      },
      error: (error) => {
        console.log(error);
      }
    })

    if (this.modo === 'actualizar' && this.objetivoActual) {
      const idInteres = 0 // del id de la lista desplegable de Intereses?
      this.goalsForm.patchValue({
        goals_name: this.objetivoActual.goals_name,
        interest_id: String(idInteres),
        description: this.objetivoActual.description,
        hours_per_week: String(this.objetivoActual.hours_per_week)
      });
    }
  }
  
  protected closeModal() {
    this.dialogRef?.close()
  }

  async saveGoals() {
    if (this.goalsForm.invalid) {
      console.log(this.goalsForm)
      this.toastService.showError('Por favor, completa todos los campos.');
      return;
    }

    const { goals_name, interest_id, description, hours_per_week } = this.goalsForm.value;

      // ---> Si es añadir...
    // !!! dia_semana tendrá que ser numérico !!!
    this.addGoal({ goals_name, interest_id, description, hours_per_week } as Goals);
      // ---> Si es actualizar...
    
  }

  addGoal(elemento: Goals) {
    this.panelService.addGoals(this.authService.getDecodedToken().id, elemento.interest_id!, elemento.goals_name!, elemento.description!, elemento.hours_per_week!).subscribe( {
      next: (data: Goals) => {
        this.toastService.showSuccess('Objetivo añadida correctamente.');
        this.dialogRef?.close(data);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
