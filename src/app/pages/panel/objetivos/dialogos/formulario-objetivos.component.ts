import { Component, Inject, OnInit, inject } from '@angular/core';

import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { Goals } from '../../../../interfaces/ipanel.interface';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-formulario-objetivos',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './formulario-objetivos.component.html',
  styleUrls: ['./formulario-objetivos.component.css'],
})
export class FormularioObjetivosComponent implements OnInit {
  modo: 'añadir' | 'actualizar';
  objetivoActual: Goals;

  // Recepción de datos del Objetivo actual desde el componente Objetivos del Panel
  constructor(@Inject(DIALOG_DATA) public data: { modo: 'añadir' | 'actualizar', elemento: Goals }) {
    console.log(data.elemento!);
    this.modo = data.modo || 'añadir';
    this.objetivoActual = data?.elemento!
  };
  
  toastService = inject(ToastService);
  
  goalsForm = new FormGroup({
    nombre_objetivo: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    horas_semana: new FormControl('', Validators.required)

  });
  
  ngOnInit() {
    if (this.modo === 'actualizar' && this.objetivoActual) {
      this.goalsForm.patchValue({
        nombre_objetivo: this.objetivoActual.goals_name,
        descripcion: this.objetivoActual.description,
        horas_semana: String(this.objetivoActual.hours_per_week)
      });
    }
  }

  private dialogRef = inject(DialogRef, { optional: true});
  
  protected closeModal() {
    this.dialogRef?.close()
  }

  saveGoals() {
    alert('Se va a guardar el objetivo...')
    if (this.goalsForm.invalid) {
      this.toastService.showError('Por favor, completa todos los campos.');
      return;
    }    
  }
}
