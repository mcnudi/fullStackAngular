import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-form-info-activity',
  templateUrl: './form-info-activity.component.html',
  styleUrls: ['./form-info-activity.component.css']
})
export class FormInfoActivityComponent implements OnInit {
  @Input() actividad: any;
  @Output() cerrar = new EventEmitter<void>();



  ngOnInit(): void {

  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
