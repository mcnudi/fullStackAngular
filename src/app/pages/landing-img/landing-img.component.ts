import { Component, Input } from '@angular/core';
import { LandingBotonesComponent } from '../landing-botones/landing-botones.component';

@Component({
  selector: 'app-landing-img',
  imports: [LandingBotonesComponent],
  templateUrl: './landing-img.component.html',
  styleUrl: './landing-img.component.css'
})
export class LandingImgComponent {
  @Input() imagen:String="";
}