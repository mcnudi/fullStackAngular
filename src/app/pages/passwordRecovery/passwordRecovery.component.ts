import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user.service';
import { InputDialogComponent } from '../../shared/select-dialog/input-dialog.component';
import { DialogService } from '../../services/dialog.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-password-recovery',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './passwordRecovery.component.html',
  styleUrl: './passwordRecovery.component.css',
})
export class PasswordRecoveryComponent {
  showPassword = false;
  codigoVerificado = false;
  emailDestino: string = '';
  codigoGenerado: string = '';

  router = inject(Router);
  authService = inject(AuthService);
  userService = inject(UserService);
  dialogService = inject(DialogService);
  toastService = inject(ToastService);

  passRecoveryForm: FormGroup = new FormGroup({
    usuario: new FormControl('', [Validators.required]),
  });

  newPasswordForm: FormGroup = new FormGroup({
    nuevaPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    confirmarPassword: new FormControl('', [Validators.required]),
  });

  sendRecoveryEmail() {
    const username = this.passRecoveryForm.get('usuario')?.value;

    this.userService.getEmailByUsername(username).subscribe({
      next: async (res) => {
        const email = res.email;
        this.emailDestino = email;

        const correoOculto = this.formatearCorreoOculto(email);

        this.codigoGenerado = this.generarCodigoVerificacion();

        this.userService
          .sendVerificationCode(email, this.codigoGenerado)
          .subscribe({
            next: async () => {
              const introducido = await this.dialogService.open(
                InputDialogComponent,
                {
                  title: 'Autenticación',
                  message: `Introduce el código que se ha enviado a tu correo electrónico: ${correoOculto}`,
                }
              );

              if (introducido === this.codigoGenerado) {
                this.codigoVerificado = true;
              } else {
                this.toastService.showError('Código incorrecto');
              }
            },
            error: () => {
              this.toastService.showError('Error enviando el código');
            },
          });
      },
      error: () => {
        this.toastService.showError('El usuario indicado no existe en la aplicación');
      },
    });
  }

  confirmarNuevaPassword() {
    const nueva = this.newPasswordForm.get('nuevaPassword')?.value;
    const confirmar = this.newPasswordForm.get('confirmarPassword')?.value;

    if (nueva !== confirmar) {
      this.toastService.showError('Las contraseñas no coinciden');
      return;
    }

    this.userService
      .updatePassword(this.passRecoveryForm.get('usuario')?.value, nueva)
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Contraseña actualizada correctamente');
          this.router.navigate(['/login']);
        },
        error: () => {
          this.toastService.showError('Error al actualizar la contraseña');
        },
      });
  }

  checkControl(controlName: string, errorName: string) {
    return (
      this.passRecoveryForm.get(controlName)?.hasError(errorName) &&
      this.passRecoveryForm.get(controlName)?.touched
    );
  }

  private formatearCorreoOculto(email: string): string {
    const [localPart, domain] = email.split('@');
    const visible = localPart.slice(0, 5);
    return `${visible}****@${domain}`;
  }

  private generarCodigoVerificacion(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
