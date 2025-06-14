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
  router = inject(Router);
  authService = inject(AuthService);

  passRecoveryForm: FormGroup = new FormGroup({
    usuario: new FormControl('', [Validators.required]),
  });

  async onLogin() {
    if (this.passRecoveryForm.invalid) {
      this.passRecoveryForm.markAllAsTouched();
      return;
    }

    try {
      const response = await this.authService
        .login(this.passRecoveryForm.value)
        .toPromise();
      if (response) {
        this.authService.saveToken(response.token);
        this.router.navigate(['app/dashboard']);
      }
    } catch (err) {
      console.error(err);
    }
  }

  checkControl(controlName: string, errorName: string) {
    return (
      this.passRecoveryForm.get(controlName)?.hasError(errorName) &&
      this.passRecoveryForm.get(controlName)?.touched
    );
  }
}
