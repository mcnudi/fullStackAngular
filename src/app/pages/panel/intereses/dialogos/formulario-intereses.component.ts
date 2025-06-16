import { Component, OnInit, inject } from '@angular/core';

import { DialogRef } from '@angular/cdk/dialog'
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Interests } from '../../../../interfaces/ipanel.interface';
import { ToastService } from '../../../../services/toast.service';
import { PanelService } from '../../../../services/panel.service';

@Component({
  selector: 'app-formulario-intereses',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './formulario-intereses.component.html',
  styleUrls: ['./formulario-intereses.component.css'],
})
export class FormularioInteresesComponent implements OnInit {

  toastService = inject(ToastService);
  userService = inject(PanelService);
  

  interest: Interests = {
    id: 0,
    interest_name: '',
    color: ''
  };

  interestsForm: FormGroup = new FormGroup({
    interest_name: new FormControl('', [Validators.required]),
    color: new FormControl('', [Validators.required])
  });
  
  ngOnInit() {

  }

  private dialogRef = inject(DialogRef, { optional: true});
  
  protected closeModal() {
    this.dialogRef?.close()
  }

  async saveInterests() {
    alert('Se va a guardar el interés...')
    if (this.interestsForm.invalid) {
      this.toastService.showError('Por favor, completa todos los campos.');
      return;
    }

    
  }
}
