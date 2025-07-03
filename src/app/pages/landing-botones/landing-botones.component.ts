import { Component, inject, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button'; // Asegúrate de importar MatButtonModule

@Component({
  selector: 'app-landing-botones',
  standalone: true,
  imports: [MatButtonModule], // Añade MatButtonModule aquí
  templateUrl: './landing-botones.component.html',
  styleUrl: './landing-botones.component.css' // styleUrl para un solo archivo CSS
})
export class LandingBotonesComponent {
  router = inject(Router);
  renderer = inject(Renderer2); // Se mantiene si decides usarlo para animaciones de scroll

  irRegistrarse(){
    this.router.navigate(['/login']); // Ruta de registro/login
  }

  irAComoFunciona() {
    // Para "Ver cómo funciona", podríamos hacer un scroll suave a la sección de características o a la de la IA
    const targetSection = document.getElementById('ai-section') || document.getElementById('features'); // Prioriza la sección de IA, si no, las características
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Opcional: Navegar a una página separada si la sección no se encuentra o es un video
      // this.router.navigate(['/how-it-works-video']);
      console.warn("La sección 'cómo funciona' no se encontró o no tiene un ID de anclaje adecuado.");
    }
  }
}