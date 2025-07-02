import { Component, Inject, OnInit, inject } from '@angular/core';

import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { Goals, GoalsResponse, Interests } from '../../../../interfaces/ipanel.interface';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastService } from '../../../../services/toast.service';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../../services/auth.service';
import { PanelService } from '../../../../services/panel.service';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-formulario-objetivos',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatIcon, MatError],
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
    hours_per_week: new FormControl('1.0', [
      Validators.required,
      Validators.pattern(/^\d+(\.\d{1,2})?$/)
    ])
  });

  originalFormValue: any; // Para controlar cambios en el contenido del formulario cuando 'actualizar'

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
        // SOLO marcar como touched si estamos añadiendo
        if (this.modo === 'añadir') {
          this.goalsForm.controls.hours_per_week.markAsTouched();
        }
        if (this.modo === 'actualizar' && this.objetivoActual) {
          this.originalFormValue = this.goalsForm.getRawValue();
          this.goalsForm.patchValue({
            goals_name: this.objetivoActual.goals_name,
            users_interests_id: String(this.objetivoActual.users_interests_id),
            description: this.objetivoActual.description,
            hours_per_week: String(this.objetivoActual.hours_per_week)
          });
          this.originalFormValue = this.goalsForm.getRawValue();
          this.goalsForm.markAsUntouched();
          this.goalsForm.markAsPristine();
        }
      },
      error: (error) => {
        console.log(error);
        const mensaje = 'Error al inicializar el componente formulario-objetivos.' +
          (error?.error?.message ? ' ' + error.error.message : '');
        this.toastService.showError(mensaje);
      }
    })
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
      hours_per_week: hours_per_week != null ? Number(hours_per_week) : undefined
    };

    if (this.modo === 'añadir') {
      this.addGoal(goal);
    } else { // 'actualizar'
      this.updateGoal({ id: this.objetivoActual.id, users_interests_id, goals_name, description, hours_per_week } as Goals);
    }  
  }

addGoal(elemento: Goals) {
  this.panelService.addGoals(
    this.authService.getDecodedToken().id,
    elemento.users_interests_id!,
    elemento.goals_name!,
    elemento.description!,
    elemento.hours_per_week!
  ).subscribe({
    next: (data: GoalsResponse) => {
      this.toastService.showSuccess('Objetivo añadido correctamente.');
      
      // Construir el objetivo completo con ID retornado por el backend
      const objetivoConId: Goals = {
        ...elemento,
        id: data.goal?.id
      };

      // Cerrar el diálogo y devolver el nuevo objetivo completo (con ID)
      this.dialogRef?.close(objetivoConId);
    },
    error: (error) => {
      console.log(error);
      const mensaje = 'Error al añadir el Objetivo.' +
        (error?.error?.message ? ' ' + error.error.message : '');
      this.toastService.showError(mensaje);
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
        this.toastService.showSuccess('Objetivo Actualizado correctamente.');
        this.dialogRef?.close(this.goalsForm.value);
      },
      error: (error) => {
        console.log(error);
        const mensaje = 'Error al actualizar el Objetivo.' +
          (error?.error?.message ? ' ' + error.error.message : '');
        this.toastService.showError(mensaje);
      }
    });
  }

  checkControl(controlName: string, errorName: string) {
    return (
      this.goalsForm.get(controlName)?.hasError(errorName) &&
      this.goalsForm.get(controlName)?.touched
    );
  }

  formularioTieneCambios(): boolean {
    const currentValue = this.goalsForm.getRawValue();
    return JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue);
  }

  onlyDigits(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;

    // Permitir teclas de navegación (opcional: backspace, delete, arrows, etc.)
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'].includes(char)) {
      return;
    }
    
    // Permitir solo dígitos del 0 al 9
    if (/^\d$/.test(char)) {
      return;
    }
    // Permitir un solo punto (,) y solo si aún no está en el valor
    if (char === '.' && !input.value.includes('.')) {
      return;
    }
    // Bloquear cualquier otro carácter
    event.preventDefault();
  }
}
