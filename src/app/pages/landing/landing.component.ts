import { AfterViewInit, Component, HostListener, ElementRef, ViewChild, inject } from '@angular/core';
import { LandingBotonesComponent } from '../landing-botones/landing-botones.component';
import { CommonModule } from '@angular/common'; 
import { MatButtonModule } from '@angular/material/button'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    LandingBotonesComponent,
    MatButtonModule
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements AfterViewInit {
  @ViewChild('features') featuresSection!: ElementRef; // Para el scroll a la sección de características
  router = inject(Router);

  ngAfterViewInit() {
    // Observer para animaciones al hacer scroll (Animate.css)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate__animated');
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

}