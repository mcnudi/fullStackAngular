import { Component, inject } from '@angular/core';
import { NavegacionComponent } from './shared/navegacion/navegacion.component';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavegacionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'rutinas';

  authService = inject(AuthService);
  router = inject(Router);

  mostrarHeader = true;

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.mostrarHeader = !event.urlAfterRedirects.startsWith('/app');
      });
  }
}
