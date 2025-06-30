import { Component } from '@angular/core';
import { LandingComponent } from '../landing/landing.component';
import { NavegacionComponent } from '../../shared/navegacion/navegacion.component';

@Component({
  selector: 'app-home',
  imports: [LandingComponent, NavegacionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
