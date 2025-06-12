import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserLoginRequest } from '../../interfaces/iuser.interface';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  showPassword = false;
  router = inject(Router);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    try {
      const loginData: UserLoginRequest = {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password,
      };

      const response = await this.authService.login(loginData).toPromise();
      if (response) {
        console.log(response);
        this.authService.saveToken(response.token);

        this.router.navigate(['/dashboard']);

      }
    } catch (err) {
      this.toastService.showError('Error al iniciar sesión. Verifica tus credenciales.');
      console.error(err);
    }
  }

  checkControl(controlName: string, errorName: string) {
    return (
      this.loginForm.get(controlName)?.hasError(errorName) &&
      this.loginForm.get(controlName)?.touched
    );
  }
}
