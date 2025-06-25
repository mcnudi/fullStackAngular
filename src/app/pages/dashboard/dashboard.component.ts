import { Availability } from './../../interfaces/ipanel.interface';
import { PanelService } from './../../services/panel.service';
import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { EventInput, EventMountArg, EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarEventsService } from '../../services/dashboard-user.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import esLocale from '@fullcalendar/core/locales/es';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { User } from '../../interfaces/iuser.interface';
import { Interests } from '../../interfaces/ipanel.interface';
import { Activity } from '../../interfaces/iactivity.interface';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FormActivityComponent } from './form-activity-add/form-activity.component';
import { FormInfoActivityComponent } from './form-info-activity/form-info-activity.component'; // <-- Importar forkJoin
import { RutinaService } from '../../services/rutina.service';
import { Category } from '../../interfaces/icategory.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FullCalendarModule,
    NgxChartsModule,
    FormsModule,
    FormActivityComponent,
    FormInfoActivityComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  constructor(
    private calendarEventsService: CalendarEventsService,
    private authService: AuthService,
    private userService: UserService,
    private panelService: PanelService,
    private ruinaService: RutinaService
  ) {}
eventosFiltradosPorRutina: EventInput[] = [];

  username: string = '';
  intereses: Interests[] = [];
  availability: Availability[] = [];
  actividades: Activity[] = [];
  categorias: Category[] = [];
  rutinas: any[] = [];
  profileImage: string =
    'https://cdn-icons-png.flaticon.com/512/1144/1144760.png';
  mostrarFormularioActividad = false;

  objetoRutinaDefecto:any[]=[];



  actividadesPorRutina: any[] = [];

  rutinasConActividades: any[] = [];

  actividadSeleccionada: any = null;
  rutinaSeleccionada: any = null;
  rutinaSeleccionadaAnterior: any = null;

  mostrarVistaActividad = false;

  filtroTipo: string = ''; // Este array siempre debe contener TODOS los eventos cargados inicialmente
  filtroRutina: string = ''; // Este array siempre debe contener TODAS las rutinas cargadas inicialmente
  eventosOriginales: EventInput[] = [];

  /*--------- TS de Calendario ----------*/

  calendarOptions: any = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: esLocale,
    selectable: true, // Permite seleccionar rangos de fechas
    editable: false, // Permite arrastrar eventos
    dayMaxEvents: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    nowIndicator: true, // Muestra la línea actual
    eventDidMount: (info: EventMountArg) => {
      (info.el as HTMLElement).title = info.event.title;
    },
    eventMouseEnter: function (info: EventMountArg) {
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
  };

  ngOnInit(): void {

    /*Conseguimos la información del usuario*/
    this.username = this.authService.getUserName();

    this.userService.getByUsername(this.username).subscribe({
      next: (user: User) => {
        const userId = (user as any).id;
        const token = (user as any).token;

        if (user.image) {
          this.profileImage = `data:image/png;base64,${user.image}`;
        }

        /* Conseguimos rutinas por usuario */
        this.ruinaService.getRutinasByUser(userId, token).subscribe({
          next: (data: any[]) => {
            console.log('Rutinas recibidas: ', data);
            this.rutinas = data || [];
            for (let i = 0; i < this.rutinas.length; i++) {
              if (this.rutinas[i].is_default == 1) {
                this.rutinaSeleccionada = this.rutinas[i].id;
                this.objetoRutinaDefecto = this.rutinas[i];
 // Inicializa también aquí
              }
            }
          },
        });
          /*Sacar categorias.*/
        this.calendarEventsService
          .getAllCategories()
          .subscribe({
            next: (data: any[]) => {
              console.log(
                'Categorias:',
                data
              );
              this.categorias = data || [];
            },
            error: (error) => {
              console.log('Error al cargar categorias:', error);
            },
          });

        /*Conseguimos Actividades de la Rutina por defecto (is_selected=1)*/
        this.calendarEventsService
          .getActivitiesByRoutineByDefault(userId)
          .subscribe({
            next: (data: any[]) => {
              console.log(
                'Actividades recibidass de la Rutina por defecto:',
                data
              );
              this.actividades = data || [];
            },
            error: (error) => {
              console.log('Error al cargar actividades:', error);
            },
          });

        /*Conseguimos Disponibilidad del usuaroi*/
        this.panelService.getAvailability(userId).subscribe({
          next: (data: Availability[]) => {
            console.log('Disponibilidad recibidas:', data);
            this.availability = data || [];
          },
          error: (error) => {
            console.log('Error al cargar actividades:', error);
          },
        });


        /*Conseguimos intereses*/
        this.panelService.getInterests(userId).subscribe({
          next: (data: Interests[]) => {
            this.intereses = data || [];
          },
          error: (error) => {
            console.log('Error al cargar intereses para el calendario:', error);
          },
        });

        this.initializeCalendar(userId); // Cargar información del usuario
      },
      error: (error) => {
        console.log('Error al obtener usuario por nombre:', error);
      },
    });
  }
  /* Metodos para el formulario  */

  abrirFormularioActividad() {
    this.mostrarFormularioActividad = true;

            this.ruinaService.obtenerRutinas(this.rutinaSeleccionada).subscribe({
          next: (data: any[]) => {
            this.objetoRutinaDefecto = data || [];
          },
          error: (error) => {
            console.log('Error al cargar rutinas :', error);
          },

        });
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

  getDateOnTime(date: Date | null): string {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`; // Formato 'HH:mm:ss'
  }

 aplicarFiltros() {
  if (this.filtroTipo === 'actividad' || this.filtroTipo === '') {
    console.log('Filtro de Actividades aplicado o Todos seleccionado');

    if (
      this.rutinaSeleccionada !== this.rutinaSeleccionadaAnterior ||
      this.filtroTipo === 'actividad' ||
      this.filtroTipo === ''
    ) {
      this.rutinaSeleccionadaAnterior = this.rutinaSeleccionada;


      this.calendarEventsService
        .getActivitiesByRoutineId(this.rutinaSeleccionada)
        .subscribe({
          next: (data: any[]) => {
            console.log(
              'Actividades recibidas de la rutina :' +
                this.rutinaSeleccionada,
              data
            );
            this.actividades = data || [];

            const activityEvents: EventInput[] = this.actividades.map(
              (act) => ({
                title: `${act.title}${
                  act.description ? ' - ' + act.description : ''
                }`,
                daysOfWeek: [act.day_of_week],
                startTime: act.start_time,
                endTime: act.end_time,
                display: 'auto',
                color: '#64b5f6',
                id: `activity-${act.id}`,
              })
            );

            // Actualizamos la nueva variable sin tocar eventosOriginales
            this.eventosFiltradosPorRutina = activityEvents;

            let disponibilidadEvents: EventInput[] = [];
            if (this.filtroTipo !== 'actividad') {
              disponibilidadEvents = this.eventosOriginales.filter(
                (ev: EventInput) =>
                  ev.id && ev.id.toString().startsWith('disponibilidad-')
              );
            }

            this.calendarOptions.events = [
              ...disponibilidadEvents,
              ...activityEvents,
            ];
          },
          error: (error) => {
            console.log('Error al cargar actividades:', error);
          },
        });
    }
  } else if (this.filtroTipo === 'disponibilidad') {
    console.log('Filtro de Disponibilidad aplicado');
    this.calendarOptions.events = this.eventosOriginales.filter(
      (ev: EventInput) =>
        ev.id && ev.id.toString().startsWith('disponibilidad-')
    );
  }
}


  limpiarFiltros() {
    this.filtroTipo = '';
    // Restablecer la rutina seleccionada a la predeterminada (si es que la tienes guardada)
    // o al primer elemento de la lista si no hay una predeterminada.
    for (let i = 0; i < this.rutinas.length; i++) {
      if (this.rutinas[i].is_default == 1) {
        this.rutinaSeleccionada = this.rutinas[i].id;
        break; // Una vez encontrada, salimos del bucle
      }
    }

    this.aplicarFiltros(); // Llama a aplicarFiltros para que se restablezca el calendario con la rutina por defecto y todos los tipos.
  }

  initializeCalendar(userId: number) {
    forkJoin({
      availability: this.panelService.getAvailability(userId),
      activities:
        this.calendarEventsService.getActivitiesByRoutineByDefault(userId),
    }).subscribe({
      next: ({ availability, activities }) => {
        // Mapear eventos de disponibilidad
        const availabilityEvents: EventInput[] = availability.map((avail) => ({
          title: 'Disponible',
          daysOfWeek: [avail.weekday],
          startTime: avail.start_time,
          endTime: avail.end_time,
          display: 'block',
          color: '#81c784',
          id: `disponibilidad-${avail.id}`,
        }));

        // Mapear eventos de actividad
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
