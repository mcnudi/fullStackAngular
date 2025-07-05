import { Component, inject, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-landing-botones',
  standalone: true,
  imports: [MatButtonModule], 
  templateUrl: './landing-botones.component.html',
  styleUrl: './landing-botones.component.css' 
})
export class LandingBotonesComponent {
  router = inject(Router);
  renderer = inject(Renderer2); 

  irRegistrarse(){
    this.router.navigate(['/login']); // Ruta de registro/login
  }

  irAComoFunciona() {
    const targetSection = document.getElementById('ai-section') || document.getElementById('features');
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.warn("La sección 'cómo funciona' no se encontró o no tiene un ID de anclaje adecuado.");
    }
  }
}