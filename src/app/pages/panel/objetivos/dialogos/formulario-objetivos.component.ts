import { Component, OnInit, inject } from '@angular/core';

import { DialogRef } from '@angular/cdk/dialog'

@Component({
  selector: 'app-formulario-objetivos',
  standalone: true,
  imports: [],
  templateUrl: './formulario-objetivos.component.html',
  styleUrls: ['./formulario-objetivos.component.css'],
})
export class FormularioObjetivosComponent implements OnInit {
  
  ngOnInit() {

  }

  private dialogRef = inject(DialogRef, { optional: true});
  
  protected closeModal() {
    this.dialogRef?.close()
  }
}
