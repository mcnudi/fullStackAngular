import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RutinaService } from '../../services/rutina.service';
import { Irutina } from '../../interfaces/irutina.interface';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { IRutinaPaginada } from '../../interfaces/i-rutina-paginada';
//import { MatButtonModule } from '@angular/material/button';
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
  tablarutina: Irutina[] = [];
  descripcion: string = '';
  nombre: string = '';
  rutina: string | null = '';
  rutinaN: number = 0;
  page: number = 1;
  pageTotales:number = 0;
  deshabilitarD:boolean=false;
  deshabilitarA:boolean=true;


  async ngOnInit() {
    this.rutina = this.route.snapshot.paramMap.get('id');
    this.rutinaN = Number(this.rutina);
    console.log('ID recibido:', this.rutina);

    this.serviceRutina.obtenerRutinaVersiones(this.rutinaN,this.page).subscribe({
        next: (res:IRutinaPaginada) => {
          this.tablarutina = res.data;
          this.pageTotales = res.totalPage;

          this.descripcion = this.tablarutina[0].description;
          this.nombre = this.tablarutina[0].name;
        },
        error: (err) => console.error('Error al obtener la rutina:', err),
      });
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
        this.toastService.showSuccess('Se ha cambiado la version por defecto');
      },
      error: (err) => console.error('Error al buscar la version:', err),
    });
  }
  avanzar() {
    if (this.page<this.pageTotales){
      this.deshabilitarA = false;
      this.deshabilitarD = false;
      this.page++;
      if (this.page===this.pageTotales){
        this.deshabilitarD = true;
        this.deshabilitarA = false;
      }
      this.serviceRutina.obtenerRutinaVersiones(this.rutinaN,this.page).subscribe({
        next: (res) => {
          console.log('Respuesta del backend:', res);
          this.tablarutina = res.data;
        },
        error: (err) => console.error('Error al obtener la rutina:', err),
      });
    }else{
      this.deshabilitarD = true;
    }
  }
  atras() {
    if (this.page>1){
      this.deshabilitarA = false;
      this.deshabilitarD = false;
      this.page--;
      if (this.page===1){
        this.deshabilitarA = true;
        this.deshabilitarD = false;
      }
    this.serviceRutina.obtenerRutinaVersiones(this.rutinaN,this.page).subscribe({
        next: (res) => {
          console.log('Respuesta del backend:', res);
          this.tablarutina = res.data;
        },
        error: (err) => console.error('Error al obtener la rutina:', err),
      });
    }
    else{
      this.deshabilitarA = true;
    }
  }
}
