import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navegacion',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navegacion.component.html',
  styleUrl: './navegacion.component.css',
})
export class NavegacionComponent {
  authService = inject(AuthService);
  router = inject(Router);

  logout() {
    this.authService.removeToken();
    this.router.navigate(['/home']);
  }
}