import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Availability } from '../../../interfaces/ipanel.interface';

@Component({
  selector: 'app-form-activity',
  templateUrl: './form-activity.component.html',
  styleUrls: ['./form-activity.component.css']
})
export class FormActivityComponent implements OnInit {

  @Output() cerrar = new EventEmitter<void>();
  @Input() rutinaSeleccionada: any[] = [];
  @Input() disponibilidad: Availability[] = [];
  @Input() actividades: any[] = [];

  horas: string[] = [];
  diasDisponibles: number[] = [];
  diaLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Otro'];

  diaSeleccionado: number | null = null;
  horaInicio: string | null = null;
  horaFinal: string | null = null;

  horasFiltradas: string[] = [];

  ngOnInit() {
    // Generar horas cada 30 minutos: 00:00, 00:30, ..., 23:30
    for (let h = 0; h < 24; h++) {
      this.horas.push(h.toString().padStart(2, '0') + ':00');
      this.horas.push(h.toString().padStart(2, '0') + ':30');
    }

    const diasDisponibilidad = this.disponibilidad
      .map(d => d.weekday)
      .filter((d): d is number => typeof d === 'number');

    const diasActividades = this.actividades
      .map(a => parseInt(a.day_of_week, 10))
      .filter(d => !isNaN(d));

    this.diasDisponibles = Array.from(new Set([...diasDisponibilidad, ...diasActividades])).sort();

    if (this.diasDisponibles.length > 0) {
      this.diaSeleccionado = this.diasDisponibles[0];
      this.actualizarHoras();
    }
  }

  onDiaChange() {
    this.actualizarHoras();
    this.horaInicio = null;
    this.horaFinal = null;
  }

  actualizarHoras() {
    if (this.diaSeleccionado === null) {
      this.horasFiltradas = [];
      return;
    }

    const bloques = this.disponibilidad.filter(d => d.weekday === this.diaSeleccionado);
    const actividadesDia = this.actividades.filter(a => parseInt(a.day_of_week, 10) === this.diaSeleccionado);

    const horasSet = new Set<string>();

    for (const bloque of bloques) {
      if (typeof bloque.start_time === 'string' && typeof bloque.end_time === 'string') {
        const inicio = bloque.start_time.slice(0, 5);
        const fin = bloque.end_time.slice(0, 5);

        for (const h of this.horas) {
          if (h >= inicio && h <= fin) {
            horasSet.add(h);
          }
        }
      }
    }

    for (const actividad of actividadesDia) {
      if (typeof actividad.start_time === 'string' && typeof actividad.end_time === 'string') {
        const inicioAct = actividad.start_time.slice(0, 5);
        const finAct = actividad.end_time.slice(0, 5);

        for (const h of this.horas) {
          if (h >= inicioAct && h <= finAct) {
            horasSet.delete(h);
          }
        }
      }
    }

    this.horasFiltradas = Array.from(horasSet).sort();
  }

  esValidoElRangoDeHoras(): boolean {
    if (!this.horaInicio || !this.horaFinal) return true;

    const [hiH, hiM] = this.horaInicio.split(':').map(Number);
    const [hfH, hfM] = this.horaFinal.split(':').map(Number);

    const inicioMin = hiH * 60 + hiM;
    const finMin = hfH * 60 + hfM;

    return finMin - inicioMin >= 30;
  }

  cerrarFormulario() {
    this.cerrar.emit();
  }
}
