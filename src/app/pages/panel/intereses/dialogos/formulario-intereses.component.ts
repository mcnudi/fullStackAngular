import { Component, Inject, OnInit, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';

import { Interests, InterestsResponse } from '../../../../interfaces/ipanel.interface';
import { ToastService } from '../../../../services/toast.service';
import { PanelService } from '../../../../services/panel.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-formulario-intereses',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatIcon, MatError],
  templateUrl: './formulario-intereses.component.html',
  styleUrls: ['./formulario-intereses.component.css'],
})

export class FormularioInteresesComponent implements OnInit {
  panelService = inject(PanelService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  dialogRef = inject(DialogRef, { optional: true});

  modo: 'añadir' | 'actualizar';
  interesActual: Interests;

  userInterestsForm = new FormGroup({
    interest_name: new FormControl('', Validators.required),
    color: new FormControl('#00FF00', Validators.required)
  });

  originalFormValue: any; // Para controlar cambios en el contenido del formulario cuando 'actualizar'

  // Recepción de datos del Interés actual desde el componente Objetivos del Panel
  constructor(@Inject(DIALOG_DATA) public data: { modo: 'añadir' | 'actualizar', elemento: Interests }) {
    this.modo = data?.modo || 'añadir';
    this.interesActual = data?.elemento
  };

  ngOnInit() {
    if (this.modo === 'actualizar' && this.interesActual) {
      this.userInterestsForm.patchValue({
        interest_name: this.interesActual.interest_name,
        color: this.interesActual.color
      });
      this.originalFormValue = this.userInterestsForm.getRawValue();
      this.userInterestsForm.markAsUntouched();
      this.userInterestsForm.markAsPristine();
    }
  }
  
  closeModal() {
    this.dialogRef?.close()
  }

  async saveInterests() {
    if (this.userInterestsForm.invalid) {
      this.toastService.showError('Por favor, completa todos los campos.');
      return;
    }

    const { interest_name, color } = this.userInterestsForm.value;

    if (this.modo === 'añadir') {
      this.addInterest({ interest_name, color } as Interests);
    } else { // 'actualizar'
      this.updateInterest({ id: this.interesActual.id, interest_name, color } as Interests);
    }
  }

  addInterest(elemento: Interests) {
    this.panelService.addInterests(
      this.authService.getDecodedToken().id,
      elemento.interest_name!,
      elemento.color!
    ).subscribe({
      next: (data: InterestsResponse) => {
        this.toastService.showSuccess('Interés añadido correctamente.');

        // Construir el objetivo completo con ID retornado por el backend
        const interestConId: Interests = {
          ...elemento,
          id: data.interest?.id
        };

        this.panelService.notificarRepintadoObjetivos();
        // Cerrar el diálogo y devolver el nuevo objetivo completo (con ID)
        this.dialogRef?.close(interestConId);
      },
      error: (error) => {
        console.log(error);
        this.toastService.showError('Error al añadir el Interés.');
      }
    });
  }

  updateInterest(elementoActualizador: Interests) {
    this.panelService.updateInterests(
      this.authService.getDecodedToken().id,
      elementoActualizador.id!, 
      elementoActualizador.interest_name!,
      elementoActualizador.color!
    ).subscribe( {
      next: (data: Interests) => {
        this.toastService.showSuccess('Interés Actualizado correctamente.');
        this.panelService.notificarRepintadoObjetivos();
        this.dialogRef?.close(this.userInterestsForm.value);
      },
      error: (error) => {
        console.log(error);
        this.toastService.showError('Error al actualizar el Interés.');
      }
    });
  }

  checkControl(controlName: string, errorName: string) {
    return (
      this.userInterestsForm.get(controlName)?.hasError(errorName) &&
      this.userInterestsForm.get(controlName)?.touched
    );
  }

  formularioTieneCambios(): boolean {
    const currentValue = this.userInterestsForm.getRawValue();
    return JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue);
  }
}
