import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { RouterOutlet, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-applayout',
  imports: [
    MatSidenavModule,
    RouterOutlet,
    MatDividerModule,
    MatListModule,
    RouterLink,
    RouterModule,
  ],
  templateUrl: './applayout.component.html',
  styleUrl: './applayout.component.css',
})
export class ApplayoutComponent {}
