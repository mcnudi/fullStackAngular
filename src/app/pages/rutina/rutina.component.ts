import { Component, inject} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Irutina } from '../../interfaces/irutina.interface';
import { RutinaService } from '../../services/rutina.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

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
  toastService = inject(ToastService);

  irutina:Irutina | null=null;
  username:string='';

  rutinaForm!: FormGroup;
  valor: Irutina | null = null;
  title:string = "";
  url:string = '';
  tablarutina: Irutina[] = [];
  rutina1:number=0;

  constructor(){
    
    this.rutinaForm = new FormGroup({
    name: new FormControl(this.valor?.name||"", [Validators.required,this.textoValidator]),
    descripcion: new FormControl(this.valor?.description||"", [Validators.required,this.textoValidator]),
    defecto: new FormControl('false', )
    
  });
  }

  async ngOnInit() {
    this.url = this.router.url;
    if (this.url.startsWith('/app/anadirRutina/tarea')){
      const rutina = this.routerL.snapshot.paramMap.get('id');
      this.rutina1=Number(rutina);
      this.title = "Modificar Rutina";
      this.serviceRutina.obtenerRutinas(this.rutina1).subscribe({
      next: (res) => {
        console.log("Respuesta del backend:", res);
        this.tablarutina = res;
        this.valor = this.tablarutina[0];
         this.initForm();
      },
      error: (err) => {
        console.error("Error al obtener rutina:", err);
        this.toastService.showError('Error al obtener rutina');
      }
    });
    
    }
    else if (this.url.startsWith('/app/anadirRutina/usuario')){
      this.title = "Alta Rutina";
      
    }
  }

  async salvar(){

    this.irutina=this.rutinaForm.value;
    
    if (this.irutina){
      this.irutina.usuario=this.authService.getDecodedToken().id;
      const rutina = this.routerL.snapshot.paramMap.get('id');
      this.irutina.id = Number(rutina);
      if (this.irutina.defecto){
        this.irutina.defecto=true;
      }
      else{
      this.irutina.defecto=false;
      }
      if (this.url.startsWith('/app/anadirRutina/usuario')){//Alta
      this.serviceRutina.insertRutina(this.irutina).subscribe({//ver el id que devuelve
        next: (res) => {console.log("Respuesta del backend:", res),
                      this.toastService.showSuccess('Se ha dado de alta la rutina');//pòner el id
                      this.router.navigate(['/app/rutina/']);
                      
        },
        error: (err) => {console.error("Error al guardar rutina:", err),
                        this.toastService.showError('Se ha dado de alta la rutina');
        }

      });
      }
      else if (this.url.startsWith('/app/anadirRutina/tarea')){//Modificacion
        this.serviceRutina.modificarRutina(this.irutina).subscribe({
        next: (res) => {console.log("Respuesta del backend:", res),
                    this.toastService.showSuccess('Se ha modificado la rutina');//pòner el id
                    this.router.navigate(['/app/detalles',rutina]);
        },
        error: (err) => {console.error("Error al modificar la rutina:", err),
                        this.toastService.showError('Error al modificar la rutina');
        }
      });
      }
      
      }else{
        console.error("Formulario inválido");
        this.toastService.showError('Formulario inválido');
      }
  
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
  if (this.url.startsWith('/app/anadirRutina/tarea')){
    this.irdetalle();
  }else{
  this.router.navigate(['/app/rutina/']);
  }
}
 irdetalle(){
  this.router.navigate(['/app/detalles/',this.rutina1]);
} 
initForm(){
  this.rutinaForm = new FormGroup({
    name: new FormControl(this.valor?.name||"", [Validators.required,this.textoValidator]),
    descripcion: new FormControl(this.valor?.description||"", [Validators.required,this.textoValidator]),
    defecto: new FormControl('false', )
  });
}
}
