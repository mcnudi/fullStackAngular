import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detalle-rutina',
  imports: [],
  templateUrl: './detalle-rutina.component.html',
  styleUrl: './detalle-rutina.component.css'
})
export class DetalleRutinaComponent {
  router = inject(Router);
  volver(){
    this.router.navigate(['/app/rutina/']);
  }
  crearTarea(){
    this.router.navigate(['anadirRutina/']);
  }
  actualizarTarea(){
    this.router.navigate(['/app/detalleRutina']);
  }
}

