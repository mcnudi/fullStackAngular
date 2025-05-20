import { Component } from '@angular/core';
import { NavegacionComponent } from './shared/navegacion/navegacion.component';

@Component({
  selector: 'app-root',
  imports: [NavegacionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'rutinas';
}
