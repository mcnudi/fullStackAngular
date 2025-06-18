import { Component, Inject, OnInit, inject } from '@angular/core';

import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { Availability } from '../../../../interfaces/ipanel.interface';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-formulario-disponibilidad',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './formulario-disponibilidad.component.html',
  styleUrls: ['./formulario-disponibilidad.component.css'],
})
export class FormularioDisponibilidadComponent implements OnInit {
  modo: 'añadir' | 'actualizar';
  disponibilidadActual: Availability;

  // Recepción de datos de la Disonibilidad actual desde el componente Objetivos del Panel
  constructor(@Inject(DIALOG_DATA) public data: { modo: 'añadir' | 'actualizar', elemento: Availability }) {
    this.modo = data?.modo || 'añadir';
    this.disponibilidadActual = data?.elemento
  };
  
  toastService = inject(ToastService);
  
  availabilityForm = new FormGroup({
    dia_semana: new FormControl('', Validators.required),
    hora_inicio: new FormControl('', Validators.required),
    hora_fin: new FormControl('', Validators.required)
  });

  ngOnInit() {
    if (this.modo === 'actualizar' && this.availabilityForm) {
      this.availabilityForm.patchValue({
        dia_semana: String(this.disponibilidadActual.weekday),
        hora_inicio: this.disponibilidadActual.start_time,
        hora_fin: this.disponibilidadActual.start_time
      });
    }
  }

  private dialogRef = inject(DialogRef, { optional: true});
  
  protected closeModal() {
    this.dialogRef?.close()
  }

  saveAvailability() {
    alert('Se va a guardar la disponibilidad...')
    if (this.availabilityForm.invalid) {
      this.toastService.showError('Por favor, completa todos los campos.');
      return;
    }    
  }
}
