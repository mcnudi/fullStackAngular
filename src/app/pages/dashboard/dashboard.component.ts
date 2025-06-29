import { ToastService } from './../../services/toast.service';
import { Availability, Goals } from './../../interfaces/ipanel.interface';
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
import { User } from '../../interfaces/iuser.interface';
import { Interests } from '../../interfaces/ipanel.interface';
import { Activity } from '../../interfaces/iactivity.interface';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FormActivityComponent } from './form-activity-add/form-activity.component';
import { FormInfoActivityComponent } from './form-info-activity/form-info-activity.component'; // <-- Importar forkJoin
import { RutinaService } from '../../services/rutina.service';
import { Category } from '../../interfaces/icategory.interface';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    FullCalendarModule,
    FormsModule,
    RouterLink,
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
    private ruinaService: RutinaService,
    private dialogService: DialogService,
    private toastService :ToastService,
    private dialog: MatDialog
  ) {}

eventosFiltradosPorRutina: EventInput[] = [];

  username: string = '';
  intereses: Interests[] = [];
  availability: Availability[] = [];
  actividades: Activity[] = [];
  categorias: Category[] = [];
  categoriasUsuario: Category[] = [];
  objetivos: any[] = [];
  rutinas: any[] = [];
  profileImage: string =
    'https://cdn-icons-png.flaticon.com/512/1144/1144760.png';
  mostrarFormularioActividad = false;

  objetoRutinaDefecto:any[]=[];

  actividadSeleccionada: any = null;
  rutinaSeleccionada: any = null;
  rutinaSeleccionadaAnterior: any = null;

  mostrarVistaActividad = false;

  filtroTipo: string = ''; // Este array siempre debe contener TODOS los eventos cargados inicialmente
  filtroRutina: string = ''; // Este array siempre debe contener TODAS las rutinas cargadas inicialmente
  eventosOriginales: EventInput[] = [];

  filtroCategoria: string = '';

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
    eventMouseEnter: (info: EventMountArg) => {
      // Elimina cualquier tooltip existente
      const oldTooltip = document.querySelector('.fc-tooltip');
      if (oldTooltip) {
        oldTooltip.remove();
      }
      let categoria = "";
      if(info.event._def.publicId.startsWith('actividad-')) {
        const activityNum = Number(info.event._def.publicId.split('-')[1]?.trim());
        console.log("Activity Number:", activityNum);
        categoria = "Categoria: " + this.getCategoryNameByActivityId(activityNum);
      }

      const tooltip = document.createElement('div');
      tooltip.innerHTML = `
        <strong>${info.event.title}</strong><br>
        <strong>${categoria}</strong><br>
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
          /*OBJETIVOS */
                  this.panelService
          .getGoals(userId)
          .subscribe({
            next: (data: any[]) => {
              console.log(
                'Objetivos:',
                data
              );
              this.objetivos = data || [];
            },
            error: (error) => {
              console.log('Error al cargar objetivos:', error);
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
              this.categoriasUsuario = this.getCategoriesByActivities();
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
  this.ruinaService.obtenerRutinas(this.rutinaSeleccionada).subscribe({
    next: (data: any[]) => {
      this.objetoRutinaDefecto = data || [];

      const dialogRef = this.dialog.open(FormActivityComponent, {
        data: {
          objetoRutinaDefecto: this.objetoRutinaDefecto,
          rutinaSeleccionada: this.rutinaSeleccionada,
          disponibilidad: this.availability,
          actividades: this.actividades,
          categorias: this.categorias,
        },
      });

      dialogRef.afterClosed().subscribe(result => {
        this.aplicarFiltros();
      });
    },
    error: (error) => {
      console.log('Error al cargar rutinas:', error);
    },
  });
}


verActividad(actividad: any) {
  const dialogRef = this.dialog.open(FormInfoActivityComponent, {
    data: {
      actividad: actividad,
      categorias: this.categorias,
    },
  });

  dialogRef.afterClosed().subscribe(result => {

  });
}


async eliminarActividad(actividad: { id: number }) {
  const confirmed = await this.dialogService.confirm(
    'Confirmar borrado',
    `¿Estás seguro de que quieres eliminar esta actividad?
    ¡¡Esta acción no se puede deshacer!!`
  );

  if (confirmed) {
    try {
      this.calendarEventsService.deleteActivity(actividad.id).subscribe({
        next: (data: Activity[]) => {
          // Actualiza disponibilidad o el array de actividades si lo necesitas
          this.actividades = data || [];
          this.limpiarFiltros();
          // Si tienes un array de actividades local y quieres actualizarlo:
          const index = this.actividades.findIndex(a => a.id === actividad.id);
          if (index !== -1) {
            this.actividades.splice(index, 1);
          }
        },
        error: (error) => {
          console.error('Error al eliminar la actividad:', error);
          this.toastService.showError('Error al eliminar la actividad.');
        }
      });
    } catch (err) {
      console.error('Error inesperado al eliminar la actividad:', err);
      this.toastService.showError('Error inesperado al eliminar la actividad.');
    }
  }
}




  getDateOnTime(date: Date | null): string {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`; // Formato 'HH:mm:ss'
  }

  aplicarFiltros() {
    console.log('Aplicando filtros...');

    let eventosFiltrados: EventInput[] = [];

    // Lógica para filtrar por TIPO y RUTINA
    if (this.filtroTipo === 'actividad' || this.filtroTipo === '') {
      console.log('Filtro de Actividades aplicado o Todos seleccionado');

      if (this.rutinaSeleccionada !== this.rutinaSeleccionadaAnterior || this.filtroTipo === 'actividad' || this.filtroTipo === '') {

        if(this.rutinaSeleccionadaAnterior && this.rutinaSeleccionada !== this.rutinaSeleccionadaAnterior) {
            this.filtroCategoria = ''; // Reiniciar filtro de categoría al cambiar rutina
        }
        this.rutinaSeleccionadaAnterior = this.rutinaSeleccionada;

        this.calendarEventsService.getActivitiesByRoutineId(this.rutinaSeleccionada).subscribe({
          next: (data: any[]) => {
            console.log('Actividades recibidas de la rutina ' + this.rutinaSeleccionada, data);
            this.actividades = data || [];

            const activityEvents: EventInput[] = this.actividades.map((act) => ({
              title: `${act.title}${act.description ? ' - ' + act.description : ''}`,
              daysOfWeek: [act.day_of_week],
              startTime: act.start_time,
              endTime: act.end_time,
              display: 'block',
              color: '#64b5f6',
              id: `actividad-${act.id}`,
            }));

            this.categoriasUsuario = this.getCategoriesByActivities(); //Reinicio las categorías del usuario

            this.eventosFiltradosPorRutina = activityEvents;

            let disponibilidadEvents: EventInput[] = [];
            if (this.filtroTipo !== 'actividad') {
              disponibilidadEvents = this.eventosOriginales.filter(
                (ev: EventInput) => ev.id && ev.id.toString().startsWith('disponibilidad-')
              );
            }
            eventosFiltrados = [...disponibilidadEvents, ...activityEvents];

            // Aplicar filtro de categoría a los eventos ya filtrados por tipo/rutina
            if (this.filtroCategoria !== '') {
              const categoriaFiltradaNombre = this.getCategoryById(parseInt(this.filtroCategoria));
              eventosFiltrados = eventosFiltrados.filter(
                (ev: EventInput) =>
                  (ev.id && ev.id.toString().startsWith('actividad-') &&
                    this.getCategoryNameByActivityId(Number(ev.id.split('-')[1])) === categoriaFiltradaNombre) ||
                  (ev.id && ev.id.toString().startsWith('disponibilidad-') && this.filtroTipo !== 'actividad') // Incluir disponibilidad si no se filtra solo por actividad
              );

              this.actividades = this.actividades.filter(
                (act) =>
                  this.getCategoryNameByActivityId(act.id) === categoriaFiltradaNombre
              );
            }

            this.calendarOptions.events = eventosFiltrados;
            console.log('Eventos Calendario final (con rutina/tipo y categoría):', this.calendarOptions.events);

          },
          error: (error) => {
            console.log('Error al cargar actividades:', error);
          },
        });
      }
    } else if (this.filtroTipo === 'disponibilidad') {
      console.log('Filtro de Disponibilidad aplicado');
      eventosFiltrados = this.eventosOriginales.filter(
        (ev: EventInput) => ev.id && ev.id.toString().startsWith('disponibilidad-')
      );
      this.calendarOptions.events = eventosFiltrados;
      console.log('Eventos Calendario final (solo disponibilidad):', this.calendarOptions.events);
    } else {
      // Si no hay filtro de tipo, la base es eventosOriginales
      eventosFiltrados = [...this.eventosOriginales];

      // Aplicar filtro de categoría a los eventosOriginales si no hay filtro de tipo
      if (this.filtroCategoria !== '') {
        const categoriaFiltradaNombre = this.getCategoryById(parseInt(this.filtroCategoria));
        eventosFiltrados = eventosFiltrados.filter(
          (ev: EventInput) =>
            (ev.id && ev.id.toString().startsWith('actividad-') &&
              this.getCategoryNameByActivityId(Number(ev.id.split('-')[1])) === categoriaFiltradaNombre) ||
            (ev.id && ev.id.toString().startsWith('disponibilidad-')) // Incluir siempre disponibilidad si no hay filtro de tipo
        );
      }
      this.calendarOptions.events = eventosFiltrados;
      console.log('Eventos Calendario final (sin filtro de tipo, con/sin categoría):', this.calendarOptions.events);
    }

    // Si no hay filtro de tipo y tampoco filtro de categoría, se muestran todos los originales
    if (this.filtroTipo === '' && this.filtroCategoria === '') {
      console.log('No hay filtro de tipo ni categoría, se muestran todos los eventos originales.');
      this.calendarOptions.events = this.eventosOriginales;
    }
  }


  limpiarFiltros() {
    this.filtroTipo = '';
    this.filtroCategoria = ''; // <-- Limpiar también el filtro de categoría

    // Restablecer la rutina seleccionada a la predeterminada (is_default=1)
    const rutinaPorDefecto = this.rutinas.find((r) => r.is_default === 1);
    if (rutinaPorDefecto) {
      this.rutinaSeleccionada = rutinaPorDefecto.id;
    } else if (this.rutinas.length > 0) {
      // Si no hay una por defecto, seleccionar la primera de la lista
      this.rutinaSeleccionada = this.rutinas[0].id;
    }
    // No es necesario actualizar rutinaSeleccionadaAnterior aquí,
    // ya que applyFilters lo manejará.

    this.aplicarFiltros(); // Llama a aplicarFiltros para que se restablezca el calendario con la rutina por defecto y todos los tipos y categorías.
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
          display: 'block',
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

  getCategoryNameByActivityId(ativityId: number): string {
        const activity = this.actividades.find(
          (act) => act.id === ativityId
        );
        if (activity && activity.activity_categories_id) {
          const category = this.categorias.find(
                (cat) => cat.id === activity.activity_categories_id
          );
          return category ? category.category_name : 'Sin categoría';
        }
        return 'Sin categoría';
  }

  getCategoryById(categoryId: number): string {
        const category = this.categorias.find(
          (cat) => cat.id === categoryId
        );
        return category ? category.category_name : 'Sin categoría';
  }

  getCategoriesByActivities(): Category[] {
        const categories: Category[] = [];
        this.actividades.forEach((actividad) => {
            const category = this.categorias.find(
                    (cat) => cat.id === actividad.activity_categories_id
            );
            if (category && !categories.includes(category)) {
                    categories.push(category);
            }
        });
        return categories;
  }

}
