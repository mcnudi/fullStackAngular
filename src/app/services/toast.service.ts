import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string, duration = 3000) {
    this.snackBar.open(message, '', {
      duration,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  showError(message: string, duration = 3000) {
    this.snackBar.open(message, '', {
      duration,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  showInfo(message: string, duration = 3000) {
    this.snackBar.open(message, '', {
      duration,
      panelClass: ['snackbar-info'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }


}
