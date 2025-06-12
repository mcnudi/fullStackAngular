import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { EventInput, EventMountArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarEventsService } from '../../services/dashboard-user.service';
import { AuthService } from '../../services/auth.service';
import esLocale from '@fullcalendar/core/locales/es';
import { LegendPosition, NgxChartsModule } from '@swimlane/ngx-charts';
import { pieData, barData } from './pieData';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FullCalendarModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

userName: string = ''; // --> Esto tendra que ser un array, para poder jugar con la información.
objetivos = [];
intereses = [];
categorias = [];

  ngOnInit():void {
    const userName = this.authService.getUserName();

 if (this.authService.isAuthenticated()) {
    this.userName = this.authService.getUserName();
    console.log('Nombre del usuario:', this.userName);
  } else {
    console.warn('Usuario no autenticado');
  }

  /* De momento sacar información del usuario
    if (!userName) {
      console.error('User ID not found. Please log in.');
    } else {
      this.calendarEventsService
        .getUserEvents(userName)
        ?.subscribe((events) => {
          this.calendarOptions = {
            ...this.calendarOptions,
            events: events,
          };
        });
      console.log('Calendar initialized with user ID:', userName);
      console.log('Calendar events:', this.calendarOptions.events);

    }
      */
  }
/*--------- TS de Calendario ----------*/
              // Opciones del calendario
              calendarOptions = {
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
                eventDidMount: function(info: EventMountArg) {
                  (info.el as HTMLElement).title = info.event.title;
                }
              };
    /*--------- TS de Grafico ----------*/
      // Datos para el gráfico circular
      single = pieData;
      legendPosition = LegendPosition.Below;

      constructor(
        private calendarEventsService: CalendarEventsService,
        private authService: AuthService,
      ) {}
  /*-------------------------------OTROS -------------------*/
  // Métodos para interacción con el gráfico
  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }



  chartType: 'pie' | 'bar' = 'pie';

  barChartData = [
    { name: 'Tareas Realizadas', value: 5 },
    { name: 'Tareas Pendientes', value: 15 }
  ];

}
