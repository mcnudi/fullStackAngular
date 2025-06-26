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
  disponibilidadSemanal: Availability [];

  // Recepción de datos de la Disponibilidad actual desde el componente Objetivos del Panel
  constructor(@Inject(DIALOG_DATA) public data: { modo: 'añadir' | 'actualizar', elemento: Availability, arrayDisponibilidad: Availability []}) {
    this.modo = data?.modo || 'añadir';
    this.disponibilidadActual = data?.elemento;
    this.disponibilidadSemanal = data?.arrayDisponibilidad;
  };

  availabilityForm = new FormGroup({
    weekday: new FormControl('1', Validators.required),
    start_time: new FormControl('00:00', Validators.required),
    end_time: new FormControl('00:00', Validators.required)
  });

  ngOnInit() {
    this.cargarRangosHorarios(Number(this.availabilityForm.controls.weekday.value)) // CAMBIAR

    this.availabilityForm.controls.weekday.valueChanges.subscribe(value => {
      this.cargarRangosHorarios(Number(value));
    });

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

//--------------------------------------------------
// A PARTIR DE AQUÍ, EL CÓDIGO DEL SELECTOR DE HORAS


  hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  start_time: string | null = null;
  end_time: string | null = null;

  selectedRanges: { start: string; end: string }[] = [];


  cargarRangosHorarios(numDia: number) {
    // ENCONTRAR LOS RANGOS DEL DÍA RECIBIDO POR PARÁMETRO
    this.selectedRanges = [];

    let arrayDisponibilidadDia = this.disponibilidadSemanal.filter(item => item.weekday === numDia);
    for (const dia of arrayDisponibilidadDia) {
      this.selectedRanges.push({
        start: String(dia.start_time),
        end: String(dia.end_time)
      });
    }
  }

  toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  isTimeDisabled(time: string, isStart: boolean): boolean {
    const timeMin = this.toMinutes(time);
    for (const { start, end } of this.selectedRanges) {
      const startMin = this.toMinutes(start);
      const endMin = this.toMinutes(end);

      if (isStart && timeMin >= startMin && timeMin < endMin) return true;
      if (!isStart && timeMin > startMin && timeMin <= endMin) return true;
    }
    return false;
  }

  addRange() {

    this.start_time = this.availabilityForm.controls.start_time.value;
    this.end_time = this.availabilityForm.controls.end_time.value;

    console.log('Entra a guardar la franja horaria', this.start_time, this.end_time)
    if (!this.start_time || !this.end_time) {
      this.toastService.showError('Selecciona una hora de comienzo y otra de fin válidas.');
      return;
    } 

    const startMin = this.toMinutes(this.start_time);
    const endMin = this.toMinutes(this.end_time);

    if (startMin >= endMin) {
      this.toastService.showError('La hora de inicio debe ser menor que la de fin.');
      return;
    }

    for (const { start, end } of this.selectedRanges) {
      const existStart = this.toMinutes(start);
      const existEnd = this.toMinutes(end);

      if (startMin < existEnd && endMin > existStart) {
        this.toastService.showError('Esta franja se solapa con una ya seleccionada.');
        return;
      }
    }

    this.selectedRanges.push({ start: this.start_time, end: this.end_time });
    this.start_time = null;
    this.end_time = null;
    this.toastService.showSuccess('Rangos de disponibilidad actualizados.');
    console.log('Rangos actualizados. Pulse Añadir para guardar cambios.:', this.selectedRanges)
  }

  removeRange(index: number) {
    this.selectedRanges.splice(index, 1);
  }
}
