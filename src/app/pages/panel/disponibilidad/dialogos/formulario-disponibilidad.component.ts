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
  disponibilidadDiaActual: Availability;
  arrayDisponibilidadSemanal: Availability [];

  // Recepción de datos de la Disponibilidad actual desde el componente Disponibilidad del Panel
  constructor(@Inject(DIALOG_DATA) public dataInyectada: { modo: 'añadir' | 'actualizar', elemento: Availability, arrayDisponibilidad: Availability []}) {
    this.modo = dataInyectada?.modo || 'añadir';
    this.disponibilidadDiaActual = dataInyectada?.elemento;
    this.arrayDisponibilidadSemanal = dataInyectada?.arrayDisponibilidad;
  };

  availabilityForm = new FormGroup({
    weekday: new FormControl('1', Validators.required),
    start_time: new FormControl('00:00', Validators.required),
    end_time: new FormControl('00:00', Validators.required)
  });

  ngOnInit() {
    // Suscripción
    this.availabilityForm.controls.weekday.valueChanges.subscribe(value => {
      this.cargarRangosHorarios(Number(value));
    });

    if (this.modo === 'añadir') {
      // Carga inicial de las franjas horarias
      this.cargarRangosHorarios(Number(this.availabilityForm.controls.weekday.value))
    }
    else { // 'actualizar'
      if (this.modo === 'actualizar' && this.availabilityForm) {
        this.availabilityForm.patchValue({
          weekday: String(this.disponibilidadDiaActual.weekday),
          start_time: this.disponibilidadDiaActual.start_time!.slice(0, 5),
          end_time: this.disponibilidadDiaActual.end_time!.slice(0, 5)
        });
      }
    }
  }
  
  protected closeModal() {
    this.dialogRef?.close()
  }

  async saveAvailability() {
    if (this.modo === 'añadir') {
      if (this.availabilityForm.invalid) {
        this.toastService.showError('Por favor, completa todos los campos.');
        return;
      }

      // Solo añade los nuevos rangos (varios a la vez para un día). Los rangos antiguos no válidos se borran desde componente Disponibilidad
      const nuevosRangosAñadidos = this.selectedRanges.filter(rango => rango.esNuevo);
      for (const rango of nuevosRangosAñadidos) {
        const franjaDisponibilidad: Availability = {
          weekday: rango.weekday,
          start_time: rango.start,
          end_time: rango.end
        };
        this.addAvailability(franjaDisponibilidad);
      }
    } else { // 'actualizar'
        // No se contemplan las actualizaciones.
    }
  }

  addAvailability(elemento: Availability) {
    this.panelService.addAvailability(this.authService.getDecodedToken().id, elemento).subscribe( {
      next: (data: Availability) => {
        this.toastService.showSuccess(`Disponibilidad ${elemento.start_time} - ${elemento.end_time} añadida correctamente.`);
        this.dialogRef?.close(data);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

//--------------------------------------------------
// CÓDIGO DEL SELECTOR DE HORAS
//--------------------------------------------------

  // hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  hours = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2); // 0..23
    const minutes = i % 2 === 0 ? '00' : '30'; // alterna entre 00 y 30
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  });

  start_time: string | null = null;
  end_time: string | null = null;
  selectedRanges: { start: string; end: string; esNuevo: boolean; weekday: number }[] = [];

  cargarRangosHorarios(numDia: number) {
    const selectedRangesBackend = this.arrayDisponibilidadSemanal
      .filter(item => item.weekday === numDia)
      .map(dia => ({
        start: dia.start_time!,
        end: dia.end_time!,
        esNuevo: false,
        weekday: dia.weekday!
      }));
    this.selectedRanges = [...selectedRangesBackend];
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

  validateRange():boolean {
    this.start_time = this.availabilityForm.controls.start_time.value;
    this.end_time = this.availabilityForm.controls.end_time.value;
    if (!this.start_time || !this.end_time) {
      this.toastService.showError('Selecciona una hora de comienzo y de fin válidas.');
      return false;
    } 
    const startMin = this.toMinutes(this.start_time);
    const endMin = this.toMinutes(this.end_time);
    if (startMin >= endMin) {
      this.toastService.showError('La hora de inicio debe ser menor que la de fin.');
      return false;
    }
    for (const { start, end } of this.selectedRanges) {
      const existStart = this.toMinutes(start);
      const existEnd = this.toMinutes(end);
      if (startMin < existEnd && endMin > existStart) {
        this.toastService.showError('Esta franja se solapa con una ya configurada.');
        return false;
      }
    }
    return true;
  }

  addRanges() {
    if (this.validateRange()) {
      this.selectedRanges.push({
        start: this.start_time!,
        end: this.end_time!,
        esNuevo: true,
        weekday: Number(this.availabilityForm.controls.weekday.value)
      });
      this.start_time = null;
      this.end_time = null;
      this.toastService.showSuccess('Rangos de disponibilidad actualizados. Pulse Añadir para guardar cambios.');
    }
  }

  modifyRange() {
    if (this.validateRange()) {
      this.selectedRanges.push({
        start: this.start_time!,
        end: this.end_time!,
        esNuevo: true,
        weekday: Number(this.availabilityForm.controls.weekday.value)
      });
      this.start_time = null;
      this.end_time = null;
      this.toastService.showSuccess('Rangos de disponibilidad actualizados. Pulse Actualizar para guardar cambios.');
    }
  }

  removeRange(index: number) {
    this.selectedRanges.splice(index, 1);
  }

  formatearHoras(hora: string | undefined): string {
    if (!hora) return '--:--';
    const date = new Date(`1970-01-01T${hora}`);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
}
