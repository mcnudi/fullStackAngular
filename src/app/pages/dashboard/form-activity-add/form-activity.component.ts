import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
  effect
} from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Availability } from '../../../interfaces/ipanel.interface';
import { Category } from '../../../interfaces/icategory.interface';
import { CalendarEventsService } from '../../../services/dashboard-user.service';

@Component({
  selector: 'app-form-activity',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-activity.component.html',
  styleUrl: './form-activity.component.css'
})
export class FormActivityComponent {
  @Input({ required: true }) objetoRutinaDefecto: any[] = [];
  @Input() disponibilidad: Availability[] = [];
  @Input() actividades: any[] = [];
  @Input() categorias: Category[] = [];
  @Output() cerrar = new EventEmitter<void>();

  private calendarEventsService = inject(CalendarEventsService);
  private fb = inject(FormBuilder);

  diaLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Otro'];
  horas = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2).toString().padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return `${h}:${m}`;
  });

  diasDisponibles = signal<number[]>([]);
  horasFiltradas = signal<string[]>([]);

  form = this.fb.group({
    titulo: this.fb.control<string | null>(null, Validators.required),
    descripcion: this.fb.control<string | null>(null, Validators.required),
    dia: this.fb.control<number | null>(null, Validators.required),
    horaInicio: this.fb.control<string | null>(null, Validators.required),
    horaFinal: this.fb.control<string | null>(null, Validators.required),
    categoria: this.fb.control<number | null>(null, Validators.required)
  });

  constructor() {
effect(() => {
  const dia = this.form.get('dia')?.value;
  if (dia !== undefined) {
    this.actualizarHoras(dia);
  }
});

  }

  ngOnInit() {
    const diasDisponibilidad = this.disponibilidad
      .map(d => d.weekday)
      .filter((d): d is number => typeof d === 'number');

    const diasActividades = this.actividades
      .map(a => a?.day_of_week)
      .filter((d): d is string => typeof d === 'string')
      .map(d => parseInt(d, 10))
      .filter(n => !isNaN(n));

    const unicos = [...new Set([...diasDisponibilidad, ...diasActividades])].sort();
    this.diasDisponibles.set(unicos);

    if (unicos.length > 0) {
      this.form.patchValue({ dia: unicos[0] });
    }
  }

  actualizarHoras(diaSeleccionado: number | null) {
    if (diaSeleccionado === null) {
      this.horasFiltradas.set([]);
      return;
    }

    const bloques = this.disponibilidad.filter(d => d.weekday === diaSeleccionado);
    const actividadesDia = this.actividades.filter(
      a =>
        typeof a?.day_of_week === 'string' &&
        parseInt(a.day_of_week, 10) === diaSeleccionado
    );

    const disponibles = new Set<string>();
    for (const bloque of bloques) {
      const inicio = typeof bloque.start_time === 'string' ? bloque.start_time.slice(0, 5) : '';
      const fin = typeof bloque.end_time === 'string' ? bloque.end_time.slice(0, 5) : '';
      if (!inicio || !fin) continue;

      for (const h of this.horas) {
        if (h >= inicio && h <= fin) disponibles.add(h);
      }
    }

    for (const actividad of actividadesDia) {
      const inicio = typeof actividad.start_time === 'string' ? actividad.start_time.slice(0, 5) : '';
      const fin = typeof actividad.end_time === 'string' ? actividad.end_time.slice(0, 5) : '';
      if (!inicio || !fin) continue;

      for (const h of this.horas) {
        if (h >= inicio && h <= fin) disponibles.delete(h);
      }
    }

    this.horasFiltradas.set([...disponibles].sort());
  }

  rangoValido(): boolean {
    const inicio = this.form.get('horaInicio')?.value;
    const fin = this.form.get('horaFinal')?.value;

    if (!inicio || !fin || !inicio.includes(':') || !fin.includes(':')) return true;

    const [hiH, hiM] = inicio.split(':').map(Number);
    const [hfH, hfM] = fin.split(':').map(Number);

    return (hfH * 60 + hfM) - (hiH * 60 + hiM) >= 30;
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (!this.rangoValido()) {
      alert('La hora final debe ser al menos 30 minutos después de la hora de inicio');
      return;
    }
const valoresForm = this.form.value;

const nuevaActividad2 = {
  routines_versions_id: this.objetoRutinaDefecto[1]?.routines_versions_id ?? 0,
  title: valoresForm.titulo ?? '',
  description: valoresForm.descripcion ?? '', // ← aquí garantizas string, no null
  activity_categories_id: valoresForm.categoria ?? 0,
  day_of_week: (valoresForm.dia ?? '').toString(),
  start_time: (valoresForm.horaInicio ?? '') + ':00',
  end_time: (valoresForm.horaFinal ?? '') + ':00'
};

const nuevaActividad = {
  routines_versions_id: 13,
  title: 'Ejercicio de prueba',
  description: 'Actividad creada como prueba desde el componente',
  activity_categories_id: 1,
  day_of_week: '1',
  start_time: '09:00:00',
  end_time: '09:30:00'
};



    this.calendarEventsService.addNewActivity(nuevaActividad2).subscribe({
      next: () => {
        alert('Actividad creada correctamente');
        this.cerrar.emit();
      },
      error: () => {
        alert('Error creando actividad');
      }
    });
  }
}
