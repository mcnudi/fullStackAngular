import { Component, Inject, OnInit, inject } from '@angular/core';

import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { Availability, Interests } from '../../../../interfaces/ipanel.interface';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../../services/toast.service';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../../services/auth.service';
import { PanelService } from '../../../../services/panel.service';

@Component({
  selector: 'app-formulario-disponibilidad',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatIcon],
  templateUrl: './formulario-disponibilidad.component.html',
  styleUrls: ['./formulario-disponibilidad.component.css'],
})
export class FormularioDisponibilidadComponent implements OnInit {
  panelService = inject(PanelService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  dialogRef = inject(DialogRef, { optional: true});
  
  modo: 'añadir' | 'actualizar';
  disponibilidadActual: Availability;

  // Recepción de datos de la Disonibilidad actual desde el componente Objetivos del Panel
  constructor(@Inject(DIALOG_DATA) public data: { modo: 'añadir' | 'actualizar', elemento: Availability }) {
    this.modo = data?.modo || 'añadir';
    this.disponibilidadActual = data?.elemento
  };

  availabilityForm = new FormGroup({
    weekday: new FormControl('1', Validators.required),
    start_time: new FormControl('00:00', Validators.required),
    end_time: new FormControl('00:00', Validators.required)
  });

  ngOnInit() {
    if (this.modo === 'actualizar' && this.availabilityForm) {
      this.availabilityForm.patchValue({
        weekday: String(this.disponibilidadActual.weekday),
        start_time: this.disponibilidadActual.start_time,
        end_time: this.disponibilidadActual.start_time
      });
    }
  }
  
  protected closeModal() {
    this.dialogRef?.close()
  }

  async saveAvailability() {
    if (this.availabilityForm.invalid) {
      this.toastService.showError('Por favor, completa todos los campos.');
      return;
    }
    const { weekday, start_time, end_time } = this.availabilityForm.value;

      // Si es añadir...
    // !!! dia_semana tendrá que ser numérico !!!
    this.addAvailability({ weekday, start_time, end_time } as Availability);
      // Si es actualizar...
    
  }

  addAvailability(elemento: Availability) {
    this.panelService.addAvailability(this.authService.getDecodedToken().id, elemento.weekday!, elemento.start_time!, elemento.end_time!).subscribe( {
      next: (data: Availability) => {
        this.toastService.showSuccess('Disponibilidad añadida correctamente.');
        this.dialogRef?.close(data);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
