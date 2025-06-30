import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  Inject
} from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Availability } from '../../../interfaces/ipanel.interface';
import { Category } from '../../../interfaces/icategory.interface';
import { CalendarEventsService } from '../../../services/dashboard-user.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-form-activity',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-activity.component.html',
  styleUrls: ['./form-activity.component.css']
})


export class FormActivityComponent implements OnInit, OnChanges {
  objetoRutinaDefecto: any[] = [];
  disponibilidad: Availability[] = [];
  actividades: any[] = [];
  categorias: Category[] = [];

  private _rutinaSeleccionada: number | null = null;
  set rutinaSeleccionada(value: number | string | { id: number } | null | undefined) {
    if (value && typeof value === 'object' && 'id' in value) {
      this._rutinaSeleccionada = value.id;
    } else if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      this._rutinaSeleccionada = isNaN(parsed) ? null : parsed;
    } else if (typeof value === 'number') {
      this._rutinaSeleccionada = value;
    } else {
      this._rutinaSeleccionada = null;
    }
  }
  get rutinaSeleccionada(): number | null {
    return this._rutinaSeleccionada;
  }

  routines_versions_id: number = 0;
  private calendarEventsService = inject(CalendarEventsService);
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FormActivityComponent>);
  private toastService = inject(ToastService)

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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.objetoRutinaDefecto = data.objetoRutinaDefecto || [];
    this.disponibilidad = data.disponibilidad || [];
    this.actividades = data.actividades || [];
    this.categorias = data.categorias || [];
    this.rutinaSeleccionada = data.rutinaSeleccionada ?? null;

    // Ya no se suscribe aquí para 'dia', se hace en ngOnInit()
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.cargarVersion();

    // Ajustar 'categoria' si viene como string
    this.form.get('categoria')?.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.form.get('categoria')?.setValue(Number(value), { emitEvent: false });
      }
    });

    // Suscripción robusta para 'dia'
    this.form.get('dia')?.valueChanges.subscribe(valor => {
      // Convertir a número si es string
      const diaSeleccionado = typeof valor === 'string' ? parseInt(valor, 10) : valor;
      if (diaSeleccionado !== null && !isNaN(diaSeleccionado)) {
        this.inicializarFormulario(diaSeleccionado);
      }
    });

    this.inicializarFormulario(); // llamado inicial
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rutinaSeleccionada']) {
      this.cargarVersion();
    }
  }

  /** Método que se vincula en el HTML al evento (change) del select de día */
  convertirDia(event: Event) {
    const select = event.target as HTMLSelectElement;
    const numero = parseInt(select.value, 10);
    this.form.get('dia')?.setValue(numero);
  }

  private cargarVersion() {
    const id = this._rutinaSeleccionada;
    if (typeof id === 'number') {
      this.calendarEventsService.getIdVersionRoutine(id).subscribe({
        next: (data: any) => {
          const version = typeof data === 'number' ? data : data?.maxVersion ?? 0;
          this.routines_versions_id = version;
        },
        error: () => {
          this.routines_versions_id = 0;
        }
      });
    } else {
      console.warn('ID de rutina inválido:', id);
      this.routines_versions_id = 0;
    }
  }

  private inicializarFormulario(diaForzado?: number | null) {
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

    const diaSeleccionado = diaForzado ?? this.form.get('dia')?.value ?? unicos[0] ?? null;
    this.form.patchValue({ dia: diaSeleccionado }, { emitEvent: false });

    if (diaSeleccionado !== null) {
      this.actualizarHoras(diaSeleccionado);
    }

    // Reinicio explícito de horas
    const horaInicioControl = this.form.get('horaInicio');
    const horaFinalControl = this.form.get('horaFinal');

    horaInicioControl?.setValue(null, { emitEvent: false });
    horaInicioControl?.markAsPristine();
    horaInicioControl?.markAsUntouched();
    horaInicioControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    horaFinalControl?.setValue(null, { emitEvent: false });
    horaFinalControl?.markAsPristine();
    horaFinalControl?.markAsUntouched();
    horaFinalControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  actualizarHoras(diaSeleccionado: number | null) {
    console.log('Actualizando horas para día:', diaSeleccionado);

    if (diaSeleccionado === null) {
      this.horasFiltradas.set([]);
      return;
    }

    const bloques = this.disponibilidad.filter(d => d.weekday === diaSeleccionado);
    const actividadesDia = this.actividades.filter(
      a => typeof a?.day_of_week === 'string' && parseInt(a.day_of_week, 10) === diaSeleccionado
    );

    const horaAMinutos = (hora: string): number => {
      const [h, m] = hora.split(':').map(Number);
      return h * 60 + m;
    };

    let horasDisponibles: string[] = [];

    for (const bloque of bloques) {
      const inicio = typeof bloque.start_time === 'string' ? bloque.start_time.slice(0, 5) : '';
      const fin = typeof bloque.end_time === 'string' ? bloque.end_time.slice(0, 5) : '';
      if (!inicio || !fin) continue;

      const inicioMin = horaAMinutos(inicio);
      const finMin = horaAMinutos(fin);

      const horasBloque = this.horas.filter(h => {
        const hMin = horaAMinutos(h);
        return hMin >= inicioMin && hMin <= finMin;
      });

      horasDisponibles.push(...horasBloque);
    }

    for (const actividad of actividadesDia) {
      const inicio = actividad.start_time?.slice(0, 5);
      const fin = actividad.end_time?.slice(0, 5);
      if (!inicio || !fin) continue;

      const inicioMin = horaAMinutos(inicio);
      const finMin = horaAMinutos(fin);

      horasDisponibles = horasDisponibles.filter(h => {
        const hMin = horaAMinutos(h);
        return hMin < inicioMin || hMin > finMin;
      });
    }

    const horasFinales = Array.from(new Set(horasDisponibles)).sort();
    this.horasFiltradas.set([...horasFinales]);
    console.log('Horas finales disponibles:', horasFinales);
  }

  rangoValido(): boolean {
    const inicio = this.form.get('horaInicio')?.value;
    const fin = this.form.get('horaFinal')?.value;
    if (!inicio || !fin || !inicio.includes(':') || !fin.includes(':')) return true;
    const [hiH, hiM] = inicio.split(':').map(Number);
    const [hfH, hfM] = fin.split(':').map(Number);
    return (hfH * 60 + hfM) - (hiH * 60 + hiM) >= 30;
  }

estaDentroDeUnaSolaFranja(): boolean {
  const diaRaw = this.form.get('dia')?.value;
  const inicio = this.form.get('horaInicio')?.value;
  const fin = this.form.get('horaFinal')?.value;

  if (diaRaw === null || diaRaw === undefined || !inicio || !fin) return true;

  const dia = typeof diaRaw === 'string' ? parseInt(diaRaw, 10) : diaRaw;
  if (isNaN(dia)) return true;

  const bloques = this.disponibilidad.filter(d => d.weekday === dia);

  if (bloques.length === 0) {
    console.warn(`No se encontraron bloques de disponibilidad para el día ${dia}`);
    return false;
  }

  for (const bloque of bloques) {
    const inicioBloque = bloque.start_time?.slice(0, 5);
    const finBloque = bloque.end_time?.slice(0, 5);
    if (!inicioBloque || !finBloque) continue;

    if (inicio >= inicioBloque && fin <= finBloque) {
      return true;
    }
  }

  return false;
}


  hayConflictoConOtraActividad(dia: number, inicio: string, fin: string): boolean {
    const inicioMin = this.convertirHoraAMinutos(inicio);
    const finMin = this.convertirHoraAMinutos(fin);

    return this.actividades.some(a => {
      const diaActividad = parseInt(a.day_of_week, 10);
      if (diaActividad !== dia) return false;

      const inicioAct = this.convertirHoraAMinutos(a.start_time?.slice(0, 5));
      const finAct = this.convertirHoraAMinutos(a.end_time?.slice(0, 5));

      return !(finMin <= inicioAct || inicioMin >= finAct);
    });
  }

  convertirHoraAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.showError('Por favor complete todos los campos requeridos');
      return;
    }

    if (!this.rangoValido()) {
      this.toastService.showError('La hora final debe ser al menos 30 minutos después de la hora de inicio');
      return;
    }

    if (!this.estaDentroDeUnaSolaFranja()) {
      this.toastService.showError('La hora de inicio y fin deben estar dentro de la misma franja horaria de disponibilidad');
      return;
    }

    const dia = this.form.get('dia')?.value!;
    const inicio = this.form.get('horaInicio')?.value!;
    const fin = this.form.get('horaFinal')?.value!;

    if (this.hayConflictoConOtraActividad(dia, inicio, fin)) {
      alert('Ya existe una actividad que se solapa con este horario.');
      return;
    }

    const valoresForm = this.form.value;

    const nuevaActividad = {
      routines_versions_id: this.routines_versions_id,
      title: valoresForm.titulo ?? '',
      description: valoresForm.descripcion ?? '',
      activity_categories_id: valoresForm.categoria ?? 0,
      day_of_week: (valoresForm.dia ?? '').toString(),
      start_time: (valoresForm.horaInicio ?? '') + ':00',
      end_time: (valoresForm.horaFinal ?? '') + ':00'
    };

    this.calendarEventsService.addNewActivity(nuevaActividad).subscribe({
      next: () => {
        this.toastService.showError('Actividad creada correctamente');
        this.dialogRef.close(true);
      },
      error: () => {
        this.toastService.showError('Error creando actividad');
      }
    });
  }

  getHorasFinalesFiltradas(): string[] {
    const inicio = this.form.get('horaInicio')?.value;
    if (!inicio) return this.horasFiltradas();
    return this.horasFiltradas().filter(h => h > inicio);
  }

  cerrarDialogo() {
    this.dialogRef.close();
  }
}
