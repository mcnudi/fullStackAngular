import { Component, inject, Input } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Irutina } from '../../interfaces/irutina';
import { RutinaService } from '../../services/rutina.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  authService = inject(AuthService);

  irutina:Irutina | null=null;
  username:string='';

  rutinaForm!: FormGroup;
  valor: Irutina | null = null;
  title:string = "";
  url:string = '';

  constructor(){
    
    this.rutinaForm = new FormGroup({
    name: new FormControl(this.valor?.name||"", [Validators.required,this.textoValidator]),
    descripcion: new FormControl(this.valor?.description||"", [Validators.required,this.textoValidator]),
    defecto: new FormControl('false', )
    
  });
  }

  /*rutinaForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required,this.textoValidator]),
    descripcion: new FormControl('', [Validators.required,this.textoValidator]),
    defecto: new FormControl('false', )
    
  });*/

  async ngOnInit() {
    this.url = this.router.url;
    if (this.url.startsWith('/app/anadirRutina/tarea')){
      this.title = "Modificar Tarea";
       //const param = this.routerL.snapshot.paramMap.get('tarea');
       //this.rutina = param ? parseInt(param,10):0;
      //this.serviceRutina.obtenerVersionRutina(this.rutina).subscribe({
     // next: (res) => {
        //console.log("Respuesta del backend:", res);
        //this.tablarutina = res;
        //this.valor = this.tablarutina[0];
         //this.initForm();
      //},
      //error: (err) => console.error("Error al guardar rutina:", err)
    //});
    
    }
    else if (this.url.startsWith('/app/anadirRutina/usuario')){
      this.title = "Alta Tarea";
      //this.username = this.routerL.snapshot.paramMap.get('usuario') || '';
      
    }

   this.initForm();
  }

  async salvar(){

    this.irutina=this.rutinaForm.value;
    
    if (this.irutina){
      this.irutina.usuario=this.authService.getDecodedToken().id;
      //const userId=this.authService.getDecodedToken().id;
      //this.irutina.usuario=this.username;
      if (this.irutina.defecto){
        this.irutina.defecto=true;
      }
      else{
      this.irutina.defecto=false;
      }
      if (this.url.startsWith('/app/anadirRutina/usuario')){
      this.serviceRutina.insertRutina(this.irutina).subscribe({
        next: (res) => console.log("Respuesta del backend:", res),
        error: (err) => console.error("Error al guardar rutina:", err)
      });
      }
      else if (this.url.startsWith('/app/anadirRutina/tarea')){
        this.serviceRutina.modificarRutina(this.irutina).subscribe({
        next: (res) => console.log("Respuesta del backend:", res),
        error: (err) => console.error("Error al guardar rutina:", err)
      });
      }
      }else{
        console.error("Formulario inválido: rutina es null");
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
 irdetalle(){
  this.router.navigate(['/app/detalleRutina']);
} 
initForm(){
  //const valor:Irutina = this.tablarutina[0];
  this.rutinaForm = new FormGroup({
    name: new FormControl(this.valor?.name||"", [Validators.required,this.textoValidator]),
    descripcion: new FormControl(this.valor?.description||"", [Validators.required,this.textoValidator]),
    defecto: new FormControl('false', )
  });
}
}
