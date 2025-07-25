import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Activity } from '../../../interfaces/iactivity.interface';
import { Category } from '../../../interfaces/icategory.interface';

@Component({
  selector: 'app-form-info-activity',
  templateUrl: './form-info-activity.component.html',
  styleUrls: ['./form-info-activity.component.css']
})
export class FormInfoActivityComponent implements OnInit {
  actividad: Activity;
  categorias: Category[];
  categoryName: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { actividad: Activity; categorias: Category[] },
    private dialogRef: MatDialogRef<FormInfoActivityComponent>
  ) {
    this.actividad = data.actividad;
    this.categorias = data.categorias;
  }

  formatTime(time: string | null): string {
  return time ? time.substring(0, 5) : '';
}

  ngOnInit(): void {
    if (this.actividad.activity_categories_id && this.categorias) {
      const categoria = this.categorias.find(
        (cat) => cat.id === this.actividad!.activity_categories_id
      );
      this.categoryName = categoria?.category_name || '';
    }
  }

  cerrarModal() {
    this.dialogRef.close();
  }
}

