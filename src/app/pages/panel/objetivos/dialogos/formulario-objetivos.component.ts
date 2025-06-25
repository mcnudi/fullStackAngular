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
    users_interests_id: new FormControl('', Validators.required),
    description: new FormControl('', ),
    hours_per_week: new FormControl('1', Validators.required)
  });

  ngOnInit() {
    // Carga previa de array de UsersInterests para pintarlos en el desplegable de Interés Asociado
    this.panelService.getInterests(this.authService.getDecodedToken().id).subscribe( {
      next: (data: Interests[]) => {
        this.arrayIntereses = data;
        if (this.arrayIntereses.length > 0) {
          this.goalsForm.patchValue({
            users_interests_id: String(this.arrayIntereses[0].id) // Muestra como selección por defecto el primer Interés
          });
        }
      },
      error: (error) => {
        console.log(error);
      }
    })

    if (this.modo === 'actualizar' && this.objetivoActual) {
      this.goalsForm.patchValue({
        goals_name: this.objetivoActual.goals_name,
        users_interests_id: String(this.objetivoActual.users_interests_id),
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
      this.toastService.showError('Por favor, completa todos los campos.');
      return;
    }

    const { goals_name, users_interests_id, description, hours_per_week } = this.goalsForm.value;

    const goal: Goals = {
      goals_name: goals_name!,
      users_interests_id: Number(users_interests_id),
      description: description ?? '',
      hours_per_week: Number(hours_per_week)
    };

    if (this.modo === 'añadir') {
      this.addGoal(goal);
    } else { // 'actualizar'
      this.updateGoal({ id: this.objetivoActual.id, users_interests_id, goals_name, description, hours_per_week } as Goals);
    }  
  }

  addGoal(elemento: Goals) {
    this.panelService.addGoals(this.authService.getDecodedToken().id, elemento.users_interests_id!, elemento.goals_name!, elemento.description!, elemento.hours_per_week!).subscribe( {
      next: (data: Goals) => {
        this.toastService.showSuccess('Objetivo añadido correctamente.');
        this.dialogRef?.close(this.goalsForm.value);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  updateGoal(elementoActualizador: Goals) {
    this.panelService.updateGoals(
                                      this.authService.getDecodedToken().id,
                                      elementoActualizador.id!, 
                                      elementoActualizador.users_interests_id!,
                                      elementoActualizador.goals_name!,
                                      elementoActualizador.description!,
                                      elementoActualizador.hours_per_week!).subscribe( {
      next: (data: Interests) => {
        this.toastService.showSuccess('Interés Actualizado correctamente.');
        this.dialogRef?.close(this.goalsForm.value);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
