import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-applayout',
  imports: [MatSidenavModule, RouterOutlet],
  templateUrl: './applayout.component.html',
  styleUrl: './applayout.component.css',
})
export class ApplayoutComponent {}
