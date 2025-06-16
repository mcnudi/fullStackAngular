import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-rutinas-list',
  imports: [RouterModule],
  templateUrl: './rutinas-list.component.html',
  styleUrl: './rutinas-list.component.css'
})
export class RutinasListComponent {
  routerL = inject(ActivatedRoute);
  username:string="";

  async ngOnInit() {
    this.username = this.routerL.snapshot.paramMap.get('usuario') || '';
    
  }
}
