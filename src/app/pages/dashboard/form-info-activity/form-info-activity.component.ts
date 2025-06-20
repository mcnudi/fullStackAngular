import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-form-info-activity',
  templateUrl: './form-info-activity.component.html',
  styleUrls: ['./form-info-activity.component.css']
})
export class FormInfoActivityComponent implements OnInit {

  ngOnInit(): void {

  }

 @Input() actividad: any;
  @Output() cerrar = new EventEmitter<void>();


  cerrarModal() {
    this.cerrar.emit();
  }
}
