import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule, MatButtonModule, MatIconModule, FormsModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent implements OnInit {
  inputValue: string = '';

  showInput: boolean = false;
  inputLabel: string = '';
  inputPlaceholder: string = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      icon?: string;
      inputLabel?: string;
      inputPlaceholder?: string;
    }
  ) {}

  ngOnInit() {
    if (this.data.inputLabel) {
      this.showInput = true;
      this.inputLabel = this.data.inputLabel;
      this.inputPlaceholder = this.data.inputPlaceholder || '';
    }
  }

  onConfirm(): void {
    if (this.showInput) {
      this.dialogRef.close({ confirmed: true, inputValue: this.inputValue });
    } else {
      this.dialogRef.close({ confirmed: true });
    }
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false });
  }
}
