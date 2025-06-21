
import { Availability } from './../../interfaces/ipanel.interface';
import { PanelService } from './../../services/panel.service';
import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { EventInput, EventMountArg, EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarEventsService } from '../../services/dashboard-user.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import esLocale from '@fullcalendar/core/locales/es';
import { LegendPosition, NgxChartsModule } from '@swimlane/ngx-charts';
import { User } from '../../interfaces/iuser.interface';
import { Goals, Interests } from '../../interfaces/ipanel.interface';
import { Activity } from '../../interfaces/iactivity.interface';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FormActivityComponent } from "./form-activity-add/form-activity.component";
import { FormInfoActivityComponent } from "./form-info-activity/form-info-activity.component"; // <-- Importar forkJoin
import { RutinaService } from '../../services/rutina.service';
import { Irutina } from '../../interfaces/irutina.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FullCalendarModule, NgxChartsModule, FormsModule, FormActivityComponent, FormInfoActivityComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  constructor(
    private calendarEventsService: CalendarEventsService,
    private authService: AuthService,
    private userService: UserService,
    private panelService: PanelService,
    private ruinaService: RutinaService
  ) {}

  username: string = '';
  objetivos: Goals[] = [];
  intereses: Interests[] = [];
  availability: Availability[] = [];
  actividades: Activity[] = [];
  rutinas: any[] = [];
  userinfo: User | null = null;
  profileImage: string =
    'https://cdn-icons-png.flaticon.com/512/1144/1144760.png';
  mostrarFormularioActividad = false;

  rutinasConActividades: any[] = [];

  actividadSeleccionada: any = null;
  rutinaSeleccionada: any = null;
  mostrarVistaActividad = false;

  filtroTipo: string = ''; // Este array siempre debe contener TODOS los eventos cargados inicialmente
  eventosOriginales: EventInput[] = [];


    /*--------- TS de Calendario ----------*/

  calendarOptions: any = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: esLocale,
    selectable: true, // Permite seleccionar rangos de fechas
    editable: true, // Permite arrastrar eventos
    dayMaxEvents: true,
    eventDrop: (info: EventDropArg) => {
      const updatedEvent = {
        id: info.event.id,
        start: info.event.start,
        end: info.event.end,
      };
      this.saveEvent(info, updatedEvent);
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    nowIndicator: true, // Muestra la línea actual
    eventDidMount: (info: EventMountArg) => {
      (info.el as HTMLElement).title = info.event.title;
    },
    eventMouseEnter: function(info: EventMountArg) {
      // Elimina cualquier tooltip existente
      const oldTooltip = document.querySelector('.fc-tooltip');
      if (oldTooltip) {
        oldTooltip.remove();
      }

      const tooltip = document.createElement('div');
      tooltip.innerHTML = `
        <strong>${info.event.title}</strong><br>
        ${info.event.start?.toLocaleString()} - ${info.event.end?.toLocaleString()}
      `;
      tooltip.style.position = 'absolute';
      tooltip.style.background = '#fff';
      tooltip.style.border = '1px solid #ccc';
      tooltip.style.padding = '5px';
      tooltip.style.zIndex = '1000';
      tooltip.style.pointerEvents = 'none';
      tooltip.classList.add('fc-tooltip');
      document.body.appendChild(tooltip);

      info.el.addEventListener('mousemove', (e: MouseEvent) => {
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
      });

      info.el.addEventListener('mouseleave', () => {
        tooltip.remove();
      });
    },
  }; /*--------- TS de Gráfico ----------*/

  legendPosition = LegendPosition.Below;

  chartType: 'pie' | 'bar' = 'pie';
  pieChartData = [
    { name: 'Tiempo Libre (h)', value: 10 },
    { name: 'Tiempo usado (h)', value: 8 },
  ];
  barChartData = [
    { name: 'Tareas Realizadas', value: 5 },
    { name: 'Tareas Pendientes', value: 15 },
  ];

  ngOnInit(): void {
    this.username = this.authService.getUserName();

    this.userService.getByUsername(this.username).subscribe({
      next: (user: User) => {
        const userId = (user as any).id;
        const token = (user as any ).token;

        if (user.image) {
        this.profileImage = `data:image/png;base64,${user.image}`;
      }

           this.panelService.getInterests(userId).subscribe({
           next: (data: Interests[]) => { console.log('Intereses recibidos:', data); this.intereses = data || []; },
          error: (error) => { console.log('Error al cargar intereses:', error); }
           });

          this.calendarEventsService.getActivitiesByUserId(userId).subscribe({
          next: (data: Activity[]) => { console.log('Actividades recibidas:', data); this.actividades=data || [];}});

          this.panelService.getAvailability(userId).subscribe({
          next: (data: Availability[]) => { console.log('Disponibilidad recibidas:', data); this.availability = data || []; },
          error: (error) => { console.log('Error al cargar actividades:', error); }
          });

          this.panelService.getInterests(userId).subscribe({
          next: (data: Interests[]) => { this.intereses = data || [];},
          error: (error) => {console.log('Error al cargar intereses:', error);}, });

          this.ruinaService.getRutinasByUser(userId,token).subscribe({
          next: (data: any[]) => { console.log('Rutinas recibidos:', data); this.rutinas = data || []; },
          error: (error) => { console.log('Error al cargar intereses:', error); }
          });

          this.initializeCalendar(userId); // Cargar información del usuario

      },
      error: (error) => {
        console.log('Error al obtener usuario por nombre:', error);
      },
    });
  }



abrirFormularioActividad() {
    this.mostrarFormularioActividad = true;
  }

  cerrarFormularioActividad() {
    this.mostrarFormularioActividad = false;
  }

  verActividad(actividad: any) {
  this.actividadSeleccionada = actividad;
  this.mostrarVistaActividad = true;

}

cerrarVistaActividad() {
  this.mostrarVistaActividad = false;
  this.actividadSeleccionada = null;
}

  saveEvent(
    info: EventDropArg,
    updatedEvent: { id: string; start: Date | null; end: Date | null }
  ): void {
    if (info.event.id.startsWith('disponibilidad-')) {
      const id = Number(info.event.id.split('-')[1]?.trim());
      const userId = this.authService.getDecodedToken()?.id;

      if (userId === undefined || id === undefined || isNaN(id)) {
        console.error(
          'No se pudo obtener ID de usuario o de evento para actualizar disponibilidad.'
        );
        info.revert(); // Revierte el cambio visual en el calendario si los IDs no son válidos
        return;
      }

      // FullCalendar devuelve 0 para domingo, 1 para lunes, etc.
      // Asegúrate de que el backend espera este mismo formato para 'weekday'.
      const updatedAvailability = {
        start_time: this.getDateOnTime(updatedEvent.start),
        end_time: this.getDateOnTime(updatedEvent.end),
        weekday: updatedEvent.start ? updatedEvent.start.getDay() : undefined,
        user_id: userId,
      };
      this.panelService
        .updateAvailability(userId, id, updatedAvailability)
        .subscribe({
          next: (response) => {
            console.log('Disponibilidad actualizada:', response); // ¡Importante! Actualiza `eventosOriginales` después del éxito
            this.updateEventInOriginals(
              info.event.id,
              updatedEvent.start,
              updatedEvent.end
            );
            this.initializeCalendar(userId);
          },
          error: (error) => {
            console.error('Error al actualizar disponibilidad:', error);
            info.revert(); // Revierte el cambio visual si hubo un error en la API
          },
        });
    } else if (info.event.id.startsWith('actividad-')) {
      /*          HACERRRR        */
    }
  }

  // Función auxiliar para actualizar el evento en `eventosOriginales`
  private updateEventInOriginals(
    eventId: string,
    newStart: Date | null,
    newEnd: Date | null
  ): void {
    const index = this.eventosOriginales.findIndex(
      (event) => event.id === eventId
    );
    if (index > -1) {
      // ¡CRUCIAL! Crea un nuevo objeto de evento copiando el original
      const updatedOriginalEvent = { ...this.eventosOriginales[index] };
      if (newStart) {
        // Para eventos recurrentes, actualiza 'startTime' y 'daysOfWeek'
        updatedOriginalEvent.start = this.getDateOnTime(newStart); // 'getDay()' devuelve 0 para Domingo, 1 para Lunes, etc.
        updatedOriginalEvent.date = [newStart.getDay()];
      }
      if (newEnd) {
        // Para eventos recurrentes, actualiza 'endTime'
        updatedOriginalEvent.end = this.getDateOnTime(newEnd);
      } // Actualiza el array `eventosOriginales` de forma inmutable // Esto crea un nuevo array, lo que es detectado por Angular.
      this.eventosOriginales = this.eventosOriginales.map((event, i) =>
        i === index ? updatedOriginalEvent : event
      );
    } // Después de actualizar eventosOriginales, re-aplica el filtro para refrescar el calendario.
    this.aplicarFiltros();
  }

  getDateOnTime(date: Date | null): string {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`; // Formato 'HH:mm:ss'
  }

  aplicarFiltros() {
    let filtrados = [...this.eventosOriginales]; // Siempre copia desde el original

    if (this.filtroTipo) {
      filtrados = filtrados.filter((ev) =>
        this.filtroTipo === 'disponibilidad'
          ? ev.id?.toString().startsWith('disponibilidad-')
          : ev.id?.toString().startsWith('actividad-')
      );
    } // Asigna un nuevo array al `events` de `calendarOptions` para que FullCalendar // detecte el cambio y se re-renderice.

    this.calendarOptions = {
      ...this.calendarOptions,
      events: filtrados,
    };
  }
  limpiarFiltros() {
    this.filtroTipo = ''; // Al limpiar, simplemente restaura todos los eventos originales asignando una nueva referencia
    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...this.eventosOriginales],
    };
  }

  initializeCalendar(userId: number) {
            forkJoin({
          availability: this.panelService.getAvailability(userId),
          activities: this.calendarEventsService.getActivitiesByUserId(userId),
        }).subscribe({
          next: ({ availability, activities }) => {
            // Mapear eventos de disponibilidad
            const availabilityEvents: EventInput[] = availability.map(
              (avail) => ({
                title: 'Disponible',
                daysOfWeek: [avail.weekday],
                startTime: avail.start_time,
                endTime: avail.end_time,
                display: 'block',
                color: '#81c784',
                id: `disponibilidad-${avail.id}`,
              })
            ); // Mapear eventos de actividad

            const activityEvents: EventInput[] = activities.map((act) => ({
              title: `${act.title}${
                act.description ? ' - ' + act.description : ''
              }`,
              daysOfWeek: [act.day_of_week],
              startTime: act.start_time,
              endTime: act.end_time,
              display: 'auto',
              color: '#64b5f6',
              id: `actividad-${act.id}`,
            })); // Combinar todos los eventos

            const allEvents = [...availabilityEvents, ...activityEvents]; // Asignar a eventosOriginales (la fuente de verdad)

            this.eventosOriginales = allEvents; // Asignar al calendario

            this.calendarOptions = {
              ...this.calendarOptions,
              events: allEvents, // Inicializa el calendario con todos los eventos
            };
          },
          error: (error) => {
            console.log('Error al cargar eventos del calendario:', error);
          },
        });
  }
}
