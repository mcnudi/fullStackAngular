import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Activity } from '../../../interfaces/iactivity.interface';
import { Category } from '../../../interfaces/icategory.interface';

@Component({
  selector: 'app-form-info-activity',
  templateUrl: './form-info-activity.component.html',
  styleUrls: ['./form-info-activity.component.css']
})
export class FormInfoActivityComponent implements OnInit {
  @Input() actividad: Activity | undefined;
  @Output() cerrar = new EventEmitter<void>();
  @Input() categorias: Category[] | undefined;

  categoryName: string = '';

  ngOnInit(): void {
    if (this.actividad?.activity_categories_id && this.categorias) {
      const categoria = this.categorias.find(
        (cat) => cat.id === this.actividad!.activity_categories_id
      );
      this.categoryName = categoria?.category_name || '';
    }
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
