import { Availability } from './../../interfaces/ipanel.interface';
import { PanelService } from './../../services/panel.service';
import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { EventInput, EventMountArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
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
    private panelService:PanelService
  ) {}

  username: string = '';
  objetivos: Goals[] = [];
  intereses: Interests[] = [];
  availability: Availability[] = [];

  /*--------- TS de Calendario ----------*/
  calendarOptions: any = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridWeek',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay',
    },
    events: [
      { title: 'Estudiar Matemáticas', start: new Date() },
      { title: 'Estudiar Historia', start: '2025-05-27T12:00:00', end: '2025-05-27T13:00:00' }
    ] as EventInput[],
    eventDidMount: (info: EventMountArg) => {
      (info.el as HTMLElement).title = info.event.title;
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
    // 1. Recupera el username
    this.username = this.authService.getUserName();

    // 2. Obtén el objeto User completo para sacar su id y cargar informacion.
    this.userService.getByUsername(this.username).subscribe({
      next: (user: User) => {
        console.log('Usuario completo recibido:', user);
        // Extraemos el id (lo que aparece en consola como user.id)
        const userId = (user as any).id;
        console.log('ID extraído:', userId);

        // 3. Extraemos los objetivos.
        this.panelService.getGoals(userId).subscribe({
          next: (data: Goals[]) => {
            this.objetivos = data;
            console.log('Estos son mis goals', this.objetivos);
          },
          error: (error) => {
            console.log(error);
          }
        });

        // 4. Extraemos los intereses --> Han modificado el metodo, ahora tengo que ver como hacerlo.
        this.panelService.getInterests(userId).subscribe({
          next: (data: Interests[]) => {
            this.intereses = data;
            console.log('Estos son mis intereses', this.intereses);
          },
          error: (error) => {
            console.log(error);
          }
        });

        // 5. Extraemos la disponibilidad
        this.panelService.getAvailability(userId).subscribe({
          next: (data: Availability[]) => {
            this.availability = data;
            console.log('Esta es mi disponibilidad', this.availability);
            /* Los pinta, pero los pinta mal, hay que ver como extraer la descripcion y pegarla junto a la hora. */
            const availabilityEvents: EventInput[] = data.map(avail => ({
              title: 'Disponible',
              daysOfWeek: [avail.weekday], // 1 (lunes) al 7 (domingo)
              startTime: avail.start_time, // Ej. '09:00:00'
              endTime: avail.end_time,     // Ej. '17:00:00'
              display: 'auto',             // 'auto' para mostrar como evento normal
              color: '#81c784'             // Verde claro
            }));

            const eventosPrevios = this.calendarOptions.events || [];
            this.calendarOptions = {
              ...this.calendarOptions,
              events: [
                ...(eventosPrevios as EventInput[]),
                ...availabilityEvents
              ]
            };
          },
          error: (error) => {
            console.log(error);
          }
        });

        // 6. Extraemos las actividades
        this.calendarEventsService.getActivitiesByUserId(userId).subscribe({
          next: (activities: Activity[]) => {
            console.log('Actividades recibidas:', activities);

            const activityEvents: EventInput[] = activities.map(act => ({
              title: `${act.title}${act.description ? ' - ' + act.description : ''}`,
              daysOfWeek: [act.day_of_week], // 1 (lunes) al 7 (domingo)
              startTime: act.start_time,
              endTime: act.end_time,
              display: 'auto',
              color: '#64b5f6' // Azul
            }));

            const eventosPrevios = this.calendarOptions.events || [];
            this.calendarOptions = {
              ...this.calendarOptions,
              events: [
                ...(eventosPrevios as EventInput[]),
                ...activityEvents
              ]
            };
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

    /*
      // OTROS métodos de interacción con el gráfico y el calendario
      onSelect(data: any): void { ... }
      onActivate(data: any): void { ... }
      onDeactivate(data: any): void { ... }
    */
  }
}
