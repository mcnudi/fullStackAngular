import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { firstValueFrom } from 'rxjs';
import { ComponentType } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  async confirm(title: string, message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title, message },
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
    });

    return await firstValueFrom(dialogRef.afterClosed());
  }

  open<T, R = any>(
    component: ComponentType<T>,
    data?: any,
    width: string = '500px'
  ): Promise<R> {
    const dialogRef = this.dialog.open(component, {
      data,
      width,
      maxWidth: '90vw',
    });

    return firstValueFrom(dialogRef.afterClosed());
  }
}