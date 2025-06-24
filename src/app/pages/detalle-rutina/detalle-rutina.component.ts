import { Component, inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RutinaService } from '../../services/rutina.service';
import { Irutina } from '../../interfaces/irutina.interface';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

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
  tablarutina: Irutina[] = [];
  descripcion: string = '';
  nombre: string = '';
  rutina: string | null = '';
  rutinaN: number = 0;
  // datePipe = new DatePipe('es-ES');

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

        //this.valor = this.tablarutina[0];
        // this.initForm();
      },
      error: (err) => console.error('Error al guardar rutina:', err),
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
}

