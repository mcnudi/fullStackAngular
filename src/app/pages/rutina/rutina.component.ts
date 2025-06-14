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
  user:number = 14
  irutina:Irutina | null=null;
  rutinaForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
    defecto: new FormControl('', [Validators.required]),
    
  });

  async salvar(){
    this.irutina=this.rutinaForm.value;
    
    if (this.irutina){
    this.irutina.usuario=this.user;
    if (this.irutina.defecto){
      this.irutina.defecto=true;
    }
    else{
      this.irutina.defecto=false;
    }
    console.log("✅ irutinas tiene", this.irutina);
    this.serviceRutina.insertRutina(this.irutina).subscribe({
      next: (res) => console.log("✅ Respuesta del backend:", res),
      error: (err) => console.error("❌ Error al guardar rutina:", err)
    });
    }else{
      console.error("❌ Formulario inválido: rutina es null");
    }


  /*const response = await this.serviceRutina.insertRutina(this.user,this.rutinaForm.value);
  console.log(response);*/
  }
  
  esDefecto(event: MatSlideToggleChange){
    this.defect = event.checked;
  }


  /*this.userService.getByUsername(this.username).subscribe({
      next: (user) => {
        this.profile = user;
        this.profile.password = '*********';
        this.profileForm.patchValue(user);
      },
      error: (err) => {
        this.toastService.showError(
          'Error al obtener la información del usuario'
        );
        this.router.navigate(['app/dahsboard']);
      },
    });
  }*/
}
