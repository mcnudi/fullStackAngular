import { Component, Inject, Input, OnInit, inject } from '@angular/core';

import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Interests } from '../../../../interfaces/ipanel.interface';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-formulario-intereses',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './formulario-intereses.component.html',
  styleUrls: ['./formulario-intereses.component.css'],
})
export class FormularioInteresesComponent implements OnInit {
  modo: 'añadir' | 'actualizar';
  interesActual: Interests;

  // Recepción de datos del Interés actual desde el componente Objetivos del Panel
  constructor(@Inject(DIALOG_DATA) public data: { modo: 'añadir' | 'actualizar', elemento: Interests }) {
    console.log(data.elemento!);
    this.modo = data?.modo || 'añadir';
    this.interesActual = data?.elemento
  };
  
  toastService = inject(ToastService);
  
  interestsForm = new FormGroup({
    interest_name: new FormControl('', Validators.required),
    color: new FormControl('', Validators.required)
  });

  ngOnInit() {
    if (this.modo === 'actualizar' && this.interesActual) {
      this.interestsForm.patchValue({
        interest_name: this.interesActual.interest_name,
        color: '#' + this.interesActual.color // Formato hexadecimal.... cuando inserte en BD tal vez ya lleve el #
      });
    }
  }

  dialogRef = inject(DialogRef, { optional: true});
  
  closeModal() {
    this.dialogRef?.close()
  }

  async saveInterests() {
    alert('Se va a guardar el interés...')
    if (this.interestsForm.invalid) {
      this.toastService.showError('Por favor, completa todos los campos.');
      return;
    }    
  }
}
