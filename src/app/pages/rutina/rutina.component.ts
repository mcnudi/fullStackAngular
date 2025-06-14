import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Irutina } from '../../interfaces/irutina';
import { RutinaService } from '../../services/rutina.service';

@Component({
  selector: 'app-rutina',
  imports: [ReactiveFormsModule, MatIconModule,MatSlideToggleModule],
  templateUrl: './rutina.component.html',
  styleUrl: './rutina.component.css'
})
export class RutinaComponent {
  defect:boolean=false;
  serviceRutina = inject(RutinaService);
  user = "14"
  //irutina:Irutina | null=null;
  rutinaForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
    defecto: new FormControl('', [Validators.required]),
    
  });

  async salvar(){
    
  const response = await this.serviceRutina.insertRutina(this.user,this.rutinaForm.value);
  }
  
  esDefecto(event: MatSlideToggleChange){
    this.defect = event.checked;
  }
}
