import { AfterViewInit, Component } from '@angular/core';
import { LandingImgComponent } from '../landing-img/landing-img.component';


@Component({
  selector: 'app-landing',
  imports: [LandingImgComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements AfterViewInit {
  // {
  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    });

    const elements = document.querySelectorAll('.slide-up-section');
    elements.forEach(el => observer.observe(el));
  }
}
