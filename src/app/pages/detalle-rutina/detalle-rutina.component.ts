import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RutinaService } from '../../services/rutina.service';
import { Irutina } from '../../interfaces/irutina.interface';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { IRutinaPaginada } from '../../interfaces/i-rutina-paginada.interface';
import { InputDialogComponent } from '../../shared/select-dialog/input-dialog.component';
import { DialogService } from '../../services/dialog.service';
import { UserService } from '../../services/user.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-detalle-rutina',
  imports: [DatePipe,MatIconModule],
  templateUrl: './detalle-rutina.component.html',
  styleUrl: './detalle-rutina.component.css',
})
export class DetalleRutinaComponent {
  router = inject(Router);
  route = inject(ActivatedRoute);
  serviceRutina = inject(RutinaService);
  toastService = inject(ToastService);
  dialogService = inject(DialogService);
  userService = inject(UserService);

  tablarutina: Irutina[] = [];
  descripcion: string = '';
  nombre: string = '';
  rutina: string | null = '';
  rutinaN: number = 0;
  page: number = 1;
  pageTotales: number = 0;
  deshabilitarD: boolean = false;
  deshabilitarA: boolean = true;

  // datePipe = new DatePipe('es-ES');

  async ngOnInit() {
    this.rutina = this.route.snapshot.paramMap.get('id');
    this.rutinaN = Number(this.rutina);
    console.log('ID recibido:', this.rutina);
    this.cargarRutina();
    
  }

  volver() {
    this.router.navigate(['/app/rutina/']);
  }
  crearTarea() {
    this.router.navigate(['app/anadirRutina/usuario']);
  }
  actualizarTarea() {
    this.router.navigate(['/app/anadirRutina/tarea', this.rutina]);
  }

  elegir(id: number) {
    this.serviceRutina.ponerVersionPorDefecto(this.rutinaN, id).subscribe({
      next: (res) => {
        console.log('Respuesta del backend:', res);
        this.cargarRutina();
        this.toastService.showSuccess('Se ha cambiado la version por defecto');
        
      },
      error: (err) => console.error('Error al buscar la version:', err),
    });
  }
  avanzar() {
    if (this.page < this.pageTotales) {
      this.deshabilitarA = false;
      this.deshabilitarD = false;
      this.page++;
      if (this.page === this.pageTotales) {
        this.deshabilitarD = true;
        this.deshabilitarA = false;
      }
      this.serviceRutina
        .obtenerRutinaVersiones(this.rutinaN, this.page)
        .subscribe({
          next: (res) => {
            console.log('Respuesta del backend:', res);
            this.tablarutina = res.data;
          },
          error: (err) => console.error('Error al obtener la rutina:', err),
        });
    } else {
      this.deshabilitarD = true;
    }
  }
  atras() {
    if (this.page > 1) {
      this.deshabilitarA = false;
      this.deshabilitarD = false;
      this.page--;
      if (this.page === 1) {
        this.deshabilitarA = true;
        this.deshabilitarD = false;
      }
      this.serviceRutina
        .obtenerRutinaVersiones(this.rutinaN, this.page)
        .subscribe({
          next: (res) => {
            console.log('Respuesta del backend:', res);
            this.tablarutina = res.data;
          },
          error: (err) => console.error('Error al obtener la rutina:', err),
        });
    } else {
      this.deshabilitarA = true;
    }
  }
  
  descargarPdf(id: number) {
    console.log('Descargando PDF para la rutina con ID:', id);
    this.serviceRutina.descargarPdf(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rutina-${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar el PDF:', err);
      },
    });
  }

  async abrirDialogoCompartir(): Promise<void> {
    const correo = await this.dialogService.open(
      InputDialogComponent,
      {
        title: 'Compartir rutina',
        message: 'Introduce el correo del destinatario',
      }
    );
    

    if (correo) {
      this.serviceRutina.compartirRutina(this.rutinaN, correo).subscribe({
        next: () => this.toastService.showSuccess('Rutina enviada correctamente'),
        error: (err) => this.toastService.showError('Error al enviar la rutina')
      });
    }
  }
  async borrarRutina():Promise<void>{
      const borrar = await this.dialogService.confirm(
    'Confirmar borrado',
    `¿Estás seguro de que quieres eliminar esta rutina?
    ¡¡Esta acción no se puede deshacer!!`
  );
    if (borrar){
     this.serviceRutina.borrarRutina(this.rutinaN).subscribe({
        next: (res) => {
          this.toastService.showSuccess('Rutina borrada correctamente');
          this.router.navigate(['/app/rutina/']);
        },
        error: (err) => {
          const msg = err.error?.message || err.message ||'Error borrando rutina';
          this.toastService.showError(msg);
        }
      });
      }
    }
    cargarRutina(){
      this.serviceRutina
      .obtenerRutinaVersiones(this.rutinaN, this.page)
      .subscribe({
        next: (res: IRutinaPaginada) => {
          this.tablarutina = res.data;
          console.log(this.tablarutina);
          this.pageTotales = res.totalPage;

          this.descripcion = this.tablarutina[0].description;
          this.nombre = this.tablarutina[0].name;
          if (this.pageTotales===this.page){
            this.deshabilitarA = true;
            this.deshabilitarD = true;
          }
        },
        error: (err) => console.error('Error al obtener la rutina:', err),
      });
    }
  }