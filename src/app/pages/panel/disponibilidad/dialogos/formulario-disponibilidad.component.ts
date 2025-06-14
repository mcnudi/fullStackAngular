import { Component, OnInit, inject } from '@angular/core';

import { DialogRef } from '@angular/cdk/dialog'

@Component({
  selector: 'app-formulario-disponibilidad',
  standalone: true,
  imports: [],
  templateUrl: './formulario-disponibilidad.component.html',
  styleUrls: ['./formulario-disponibilidad.component.css'],
})
export class FormularioDisponibilidadComponent implements OnInit {
  
  ngOnInit() {

  }

  private dialogRef = inject(DialogRef, { optional: true});
  
  protected closeModal() {
    this.dialogRef?.close()
  }

}
