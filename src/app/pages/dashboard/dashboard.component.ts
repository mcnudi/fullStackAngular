import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { EventInput, EventMountArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarEventsService } from '../../services/calendarEvents.service';
import { AuthService } from '../../services/auth.service';
import esLocale from '@fullcalendar/core/locales/es';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
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
      { title: 'Estudiar Historia', start: '2025-05-27T12:00:00', end: '2025<-05-27T13:00:00' }
    ] as EventInput[],
    eventDidMount: function(info: EventMountArg) {
      (info.el as HTMLElement).title = info.event.title;
    }
  };

  constructor(
    private calendarEventsService: CalendarEventsService,
    private authService: AuthService
  ) {}



  ngOnInit() {
    const userName = this.authService.getUserName(); // O como obtengas el ID del usuario
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
  }
}
