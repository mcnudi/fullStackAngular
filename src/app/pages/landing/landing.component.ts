import { AfterViewInit, Component, HostListener, ElementRef, ViewChild, inject } from '@angular/core';
import { LandingBotonesComponent } from '../landing-botones/landing-botones.component';
import { CommonModule } from '@angular/common'; // Para ngIf, ngFor si se usan
import { MatButtonModule } from '@angular/material/button'; // Para los botones de Material Design
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, // Necesario para directivas estructurales
    LandingBotonesComponent,
    MatButtonModule // Para usar mat-flat-button en el HTML
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements AfterViewInit {
  @ViewChild('features') featuresSection!: ElementRef; // Para el scroll a la sección de características
  router = inject(Router);

  // Inyectar Router y Renderer2 si se necesitan en este componente.
  // En este diseño, los botones tienen su propia lógica de navegación.

  ngAfterViewInit() {
    // Observer para animaciones al hacer scroll (Animate.css)
    // Asegúrate de que los elementos tengan la clase 'animate__animated'
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Si el elemento tiene alguna animación de Animate.css, se activará
          entry.target.classList.add('animate__animated');
          // Dependiendo de cómo uses Animate.css, puede que necesites añadir la clase específica aquí
          // Por ejemplo: if (entry.target.classList.contains('my-custom-fade-in')) { ... }
          observer.unobserve(entry.target); // Detener la observación una vez que se activa
        }
      });
    }, { threshold: 0.1 }); // Ajusta el threshold para cuándo se dispara la animación

    // Observa todos los elementos con la clase 'animate__animated' para disparar sus animaciones
    const animatedElements = document.querySelectorAll('.animate__animated');
    animatedElements.forEach(el => observer.observe(el));
  }

  // Método para el botón "Descubre cómo la IA te impulsa"
  scrollToFeatures() {
    if (this.featuresSection) {
      this.featuresSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  irRegistrarse(){
    this.router.navigate(['/login']); // Ruta de registro/login
  }

  // Considera si necesitas el HostListener 'window:scroll' para animaciones complejas de scroll.
  // Para las animaciones de Animate.css con IntersectionObserver, quizás no sea necesario.
}