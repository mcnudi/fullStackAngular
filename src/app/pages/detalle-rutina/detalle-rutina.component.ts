import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RutinaService } from '../../services/rutina.service';
import { Irutina } from '../../interfaces/irutina.interface';

@Component({
  selector: 'app-detalle-rutina',
  imports: [],
  templateUrl: './detalle-rutina.component.html',
  styleUrl: './detalle-rutina.component.css'
})
export class DetalleRutinaComponent {
  router = inject(Router);
  serviceRutina=inject(RutinaService);
  tablarutina: Irutina[] = [];
  descripcion:string="";
  nombre:string="";

  async ngOnInit() {
    const rutina=10;
    this.serviceRutina.obtenerRutinaVersiones(rutina).subscribe({
      next: (res) => {
        console.log("Respuesta del backend:", res);
        this.tablarutina = res;
        this.descripcion = this.tablarutina[0].description;
        this.nombre = this.tablarutina[0].name;

        //this.valor = this.tablarutina[0];
        // this.initForm();
      },
      error: (err) => console.error("Error al guardar rutina:", err)
    });
  }
  volver(){
    this.router.navigate(['/app/rutina/']);
  }
  crearTarea(){
    this.router.navigate(['app/anadirRutina/usuario']);
  }
  actualizarTarea(){
    this.router.navigate(['/app/anadirRutina/tarea']);
  }
}

