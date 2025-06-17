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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FullCalendarModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  constructor(
    private calendarEventsService: CalendarEventsService,
    private authService: AuthService,
    private userService: UserService,
    private panelService: PanelService
  ) {}

  username: string = '';
  objetivos: Goals[] = [];
  intereses: Interests[] = [];
  availability: Availability[] = [];
  actividades: Activity[] = [];
  userinfo: User | null = null;

  // Gráficos
  single = pieData;
  legendPosition = LegendPosition.Below;
  chartType: 'pie' | 'bar' = 'pie';
  barChartData = [
    { name: 'Tareas Realizadas', value: 5 },
    { name: 'Tareas Pendientes', value: 15 }
  ];

  // Opciones del calendario
  calendarOptions: any = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: esLocale,
    selectable: true,
    editable: true,
    dayMaxEvents: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    nowIndicator: true,
    events: [] as EventInput[],
    eventDrop: (info: EventDropArg) => {
      const updatedEvent = {
        id: info.event.id,
        start: info.event.start,
        end: info.event.end
      };
      this.saveEvent(info, updatedEvent);
    },
    eventDidMount: (info: EventMountArg) => {
      (info.el as HTMLElement).title = info.event.title;
    },
    eventMouseEnter: function (info: EventMountArg) {
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

  ngOnInit(): void {
    // 1. Recupera el username
    this.username = this.authService.getUserName();

    // 2. Obtén el objeto User completo para sacar su id y cargar información.
    this.userService.getByUsername(this.username).subscribe({
      next: (user: User) => {
        this.userinfo = user;
        const userId = (user as any).id;

        // 3. Extraemos los objetivos.
        this.panelService.getGoals(userId).subscribe({
          next: (data: Goals[]) => {
            this.objetivos = data;
          },
          error: (error) => {
            console.log(error);
          }
        });

        console.log('User ID:', userId);
        // 4. Extraemos la disponibilidad
        this.panelService.getAvailability(userId).subscribe({
          next: (data: Availability[]) => {
            this.availability = data;
            const availabilityEvents: EventInput[] = data.map(avail => ({
              title: `Disponible: ${avail.start_time} - ${avail.end_time}`,
              daysOfWeek: [avail.weekday], // 1 (lunes) al 7 (domingo)
              startTime: avail.start_time, // Ej. '09:00:00'
              endTime: avail.end_time,     // Ej. '17:00:00'
              display: 'block',
              color: '#81c784',
              id: `availability-${avail.id}`
            }));

            // 5. Extraemos las actividades
            this.calendarEventsService.getActivitiesByUserId(userId).subscribe({
              next: (activities: Activity[]) => {
                this.actividades = activities;
                const activityEvents: EventInput[] = activities.map(act => ({
                  title: `${act.title}${act.description ? ' - ' + act.description : ''}`,
                  daysOfWeek: [act.day_of_week], // 1 (lunes) al 7 (domingo)
                  startTime: act.start_time,
                  endTime: act.end_time,
                  display: 'auto',
                  color: '#64b5f6',
                  id: `activity-${act.id}`
                }));

                // Unimos ambos arrays y los asignamos a events
                this.calendarOptions.events = [...availabilityEvents, ...activityEvents];
              },
              error: (error) => {
                console.log(error);
              }
            });
          },
          error: (error) => {
            console.log(error);
          }
        });
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  saveEvent(info: EventDropArg, updatedEvent: { id: string; start: Date | null; end: Date | null; }): void {
    if (info.event.id.startsWith('availability-')) {
      // Actualizar disponibilidad
      const updatedAvailability = {
        start_time: this.getDateOnTime(updatedEvent.start),
        end_time: this.getDateOnTime(updatedEvent.end),
        weekday: updatedEvent.start ? updatedEvent.start.getDay() || 7 : 7,
        user_id: this.authService.getDecodedToken()?.id
      };
      const id = Number(info.event.id.split('-')[1]?.trim());
      const userId = this.authService.getDecodedToken()?.id;

      this.panelService.updateAvailability(userId, id, updatedAvailability).subscribe({
        next: (response) => {
          console.log('Disponibilidad actualizada:', response);
        },
        error: (error) => {
          console.error('Error al actualizar disponibilidad:', error);
          info.revert();
        }
      });
    } else if (info.event.id.startsWith('activity-')) {
      // Aquí puedes implementar la actualización de actividades
    }
    console.log('Evento guardado:', this.calendarOptions.events);
  }

  getDateOnTime(date: Date | null): string {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`; // Formato 'HH:mm:ss'
  }
}