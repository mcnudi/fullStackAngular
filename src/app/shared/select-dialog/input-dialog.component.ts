import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-input-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './input-dialog.component.html',
  styleUrl: './input-dialog.component.css',
})
export class InputDialogComponent {
  inputValue = '';

  constructor(
    private dialogRef: MatDialogRef<InputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {
    console.log('Datos recibidos por el diálogo:', this.data);
  }

  onSend(): void {
    this.dialogRef.close(this.inputValue);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
