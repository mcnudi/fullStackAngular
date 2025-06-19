import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-form-activity',
  templateUrl: './form-activity.component.html',
  styleUrls: ['./form-activity.component.css']
})
export class FormActivityComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
@Output() cerrar = new EventEmitter<void>();

cerrarFormulario() {
  this.cerrar.emit();
}
}
