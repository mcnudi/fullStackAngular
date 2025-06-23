import { Component, inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RutinaService } from '../../services/rutina.service';
import { Irutina } from '../../interfaces/irutina.interface';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-detalle-rutina',
  imports: [DatePipe, MatIcon],
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
 

  async ngOnInit() {
    this.rutina = this.route.snapshot.paramMap.get('id');
    this.rutinaN = Number(this.rutina);
    console.log('ID recibido:', this.rutina);

    this.serviceRutina.obtenerRutinaVersiones(this.rutinaN).subscribe({
      next: (res) => {
        console.log('Respuesta del backend:', res);
        this.tablarutina = res;
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

  elegir(id:number){
     this.serviceRutina.ponerVersionPorDefecto(this.rutinaN,id).subscribe({
      next: (res) => {
        console.log('Respuesta del backend:', res);
        this.toastService.showSuccess('Se ha cambiado la version por defecto');//pòner el id
        //this.tablarutina = res;
        //this.descripcion = this.tablarutina[0].description;
        //this.nombre = this.tablarutina[0].name;
      },
      error: (err) => console.error('Error al buscar la version:', err),
    });
   ;
  }

}

