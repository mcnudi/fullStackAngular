import { Component, inject, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-botones',
  imports: [],
  templateUrl: './landing-botones.component.html',
  styleUrl: './landing-botones.component.css'
})
export class LandingBotonesComponent {
  router = inject(Router);
  renderer =inject(Renderer2);

  irRegistrarse(){
    this.router.navigate(['/login']);
  }

  irAComoFunciona() {
    const comoFunciona = document.getElementById('como-funciona');
    if (comoFunciona) {
      this.renderer.removeClass(comoFunciona, 'translate-down');
      this.renderer.addClass(comoFunciona, 'translate-up');
    }
  }
}
