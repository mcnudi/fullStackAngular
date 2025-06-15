import { Component, inject, Input } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Irutina } from '../../interfaces/irutina';
import { RutinaService } from '../../services/rutina.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-rutina',
  imports: [ReactiveFormsModule, MatIconModule,MatSlideToggleModule],
  templateUrl: './rutina.component.html',
  styleUrl: './rutina.component.css'
})
export class RutinaComponent {
  defect:boolean=false;
  serviceRutina = inject(RutinaService);
  router = inject(Router);
  routerL = inject(ActivatedRoute);

  irutina:Irutina | null=null;
  username:string='';

  rutinaForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required,this.textoValidator]),
    descripcion: new FormControl('', [Validators.required,this.textoValidator]),
    defecto: new FormControl('false', )
    
  });

  async ngOnInit() {
    this.username = this.routerL.snapshot.paramMap.get('username') || '';
  }

  async salvar(){

    this.irutina=this.rutinaForm.value;
    
    if (this.irutina){
      this.irutina.usuario=this.username;
    if (this.irutina.defecto){
      this.irutina.defecto=true;
    }
    else{
      this.irutina.defecto=false;
    }

    this.serviceRutina.insertRutina(this.irutina).subscribe({
      next: (res) => console.log("Respuesta del backend:", res),
      error: (err) => console.error("Error al guardar rutina:", err)
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

   textoValidator(control: AbstractControl): any {
    return control.value.trim().length > 2
      ? null
      : { message: 'El texto debe tener más de 2 caracteres' };
  }

checkControl(controlName: string, errorName: string): boolean | undefined {
    return (
      this.rutinaForm.get(controlName)?.hasError(errorName) &&
      this.rutinaForm.get(controlName)?.touched
    );
  }
cancelar(){
  this.router.navigate(['/app/dashboard']);
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
