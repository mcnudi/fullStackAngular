import { Component, OnInit, inject } from '@angular/core';

import { DialogRef } from '@angular/cdk/dialog'

@Component({
  selector: 'app-formulario-intereses',
  standalone: true,
  imports: [],
  templateUrl: './formulario-intereses.component.html',
  styleUrls: ['./formulario-intereses.component.css'],
})
export class FormularioInteresesComponent implements OnInit {
  
  ngOnInit() {

  }

  private dialogRef = inject(DialogRef, { optional: true});
  
  protected closeModal() {
    this.dialogRef?.close()
  }
}
