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
import { pieData, barData } from './pieData';
import { User } from '../../interfaces/iuser.interface';
import { Goals, Interests } from '../../interfaces/ipanel.interface';
import { Activity } from '../../interfaces/iactivity.interface';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs'; // <-- Importar forkJoin

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FullCalendarModule, NgxChartsModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  constructor(
    private calendarEventsService: CalendarEventsService,
    private authService: AuthService,
    private userService: UserService,
    private panelService:PanelService
  ) {}

  username: string = '';
  objetivos: Goals[] = [];
  intereses: Interests[] = [];
  availability: Availability[] = [];
  actividades: Activity[] = [];
  userinfo: User | null = null;
 
  filtroTipo: string = '';
  // Este array siempre debe contener TODOS los eventos cargados inicialmente
  eventosOriginales: EventInput[] = [];

  /*--------- TS de Calendario ----------*/
  calendarOptions: any = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: esLocale,
    selectable: true,      // Permite seleccionar rangos de fechas
    editable: true,        // Permite arrastrar eventos
    dayMaxEvents: true,      
    eventDrop: (info: EventDropArg) => {
      const updatedEvent = {
        id: info.event.id,
        start: info.event.start,
        end: info.event.end
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
    eventMouseEnter: function(info : EventMountArg) { //Muestra un tooltip al pasar el ratón por encima de un evento
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
  }
  };

  /*--------- TS de Gráfico ----------*/
  single = pieData;
  legendPosition = LegendPosition.Below;

  chartType: 'pie' | 'bar' = 'pie';
  barChartData = [
    { name: 'Tareas Realizadas', value: 5 },
    { name: 'Tareas Pendientes', value: 15 }
  ];

  ngOnInit(): void {
    this.username = this.authService.getUserName();

    this.userService.getByUsername(this.username).subscribe({
      next: (user: User) => {
        const userId = (user as any).id;

        // Cargar objetivos e intereses (estos no afectan directamente el calendario)
        this.panelService.getGoals(userId).subscribe({
          next: (data: Goals[]) => { this.objetivos = data; },
          error: (error) => { console.log('Error al cargar objetivos:', error); }
        });

        this.panelService.getInterests(userId).subscribe({
          next: (data: Interests[]) => { this.intereses = data; },
          error: (error) => { console.log('Error al cargar intereses:', error); }
        });

        // Usar forkJoin para esperar que ambas llamadas de eventos se completen
        forkJoin({
          availability: this.panelService.getAvailability(userId),
          activities: this.calendarEventsService.getActivitiesByUserId(userId)
        }).subscribe({
          next: ({ availability, activities }) => {
            // Mapear eventos de disponibilidad
            const availabilityEvents: EventInput[] = availability.map(avail => ({
              title: 'Disponible',
              daysOfWeek: [avail.weekday],
              startTime: avail.start_time,
              endTime: avail.end_time,
              display: 'block',
              color: '#81c784',
              id: `disponibilidad-${avail.id}`
            }));

            // Mapear eventos de actividad
            const activityEvents: EventInput[] = activities.map(act => ({
              title: `${act.title}${act.description ? ' - ' + act.description : ''}`,
              daysOfWeek: [act.day_of_week],
              startTime: act.start_time,
              endTime: act.end_time,
              display: 'auto',
              color: '#64b5f6',
              id: `actividad-${act.id}`
            }));

            // Combinar todos los eventos
            const allEvents = [...availabilityEvents, ...activityEvents];

            // Asignar a eventosOriginales (la fuente de verdad)
            this.eventosOriginales = allEvents;

            // Asignar al calendario
            this.calendarOptions = {
              ...this.calendarOptions,
              events: allEvents // Inicializa el calendario con todos los eventos
            };
          },
          error: (error) => {
            console.log('Error al cargar eventos del calendario:', error);
          }
        });
      },
      error: (error) => {
        console.log('Error al obtener usuario por nombre:', error);
      }
    });
  }

  saveEvent(info: EventDropArg, updatedEvent: { id: string; start: Date | null; end: Date | null; }): void {
      if(info.event.id.startsWith('availability-')) {
        const updatedAvailability = {
          start_time: this.getDateOnTime(updatedEvent.start),
          end_time: this.getDateOnTime(updatedEvent.end),
          // El weekday debe ser el día de la semana del nuevo 'start' del evento.
          // FullCalendar devuelve 0 para domingo, 1 para lunes, etc.
          // Tu backend espera 0-6 (Domingo-Sábado) para weekday.
          weekday: updatedEvent.start ? updatedEvent.start.getDay() : undefined,
          user_id: this.authService.getDecodedToken()?.id
        };
        const id = Number(info.event.id.split('-')[1]?.trim()); 
        const userId = this.authService.getDecodedToken()?.id;

        if(userId === undefined || id === undefined || isNaN(id)) {
          console.error('No se pudo obtener ID de usuario o de evento para actualizar disponibilidad.');
          info.revert(); // Revierte el cambio visual en el calendario si los IDs no son válidos
          return;
        }

        this.panelService.updateAvailability(userId, id, updatedAvailability).subscribe({
          next: (response) => {
            console.log('Disponibilidad actualizada:', response);
            // Actualizar eventosOriginales después de un guardado exitoso
            this.updateEventInOriginals(info.event.id, updatedEvent.start, updatedEvent.end);
          },
          error: (error) => {
            console.error('Error al actualizar disponibilidad:', error);
            info.revert(); // Revierte el cambio visual si hubo un error en la API
          }
        });
      }
      else if(info.event.id.startsWith('activity-')) {
         /*          HACERRRR        */
            console.log("Actualización de actividad pendiente de implementar");
            info.revert(); // Revierte el cambio si aún no está implementado
      }
  }

  // Función auxiliar para actualizar el evento en `eventosOriginales`
  private updateEventInOriginals(eventId: string, newStart: Date | null, newEnd: Date | null): void {
    const index = this.eventosOriginales.findIndex(event => event.id === eventId);
    if (index > -1) {
      const updatedOriginalEvent = { ...this.eventosOriginales[index] };
      if (newStart) {
        updatedOriginalEvent.start = this.getDateOnTime(newStart);
        updatedOriginalEvent.date = [newStart.getDay()]; // Actualizar el día de la semana
      }
      if (newEnd) {
        updatedOriginalEvent.end = this.getDateOnTime(newEnd);
      }
      this.eventosOriginales[index] = updatedOriginalEvent;
    }
    // Después de actualizar eventosOriginales, si hay un filtro aplicado, re-aplicarlo
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
    // No se copia this.calendarOptions.events aquí. Siempre se filtra desde eventosOriginales.
    let filtrados = [...this.eventosOriginales]; // <-- ¡Importante! Siempre copia desde el original

    if (this.filtroTipo) {
      filtrados = filtrados.filter(ev =>
        this.filtroTipo === 'disponibilidad'
          ? ev.id?.toString().startsWith('disponibilidad-')
          : ev.id?.toString().startsWith('actividad-')
      );
    }

    this.calendarOptions.events = filtrados;
  }  

  limpiarFiltros() {
    this.filtroTipo = '';
    // Al limpiar, simplemente restaura todos los eventos originales
    this.calendarOptions.events = [...this.eventosOriginales];
  }
}