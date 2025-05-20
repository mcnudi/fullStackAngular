import { Component } from '@angular/core';
import { NavegacionComponent } from './shared/navegacion/navegacion.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavegacionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'rutinas';
}
