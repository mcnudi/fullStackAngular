import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserRegisterRequest } from '../../interfaces/iuser.interface';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  showPassword = false;
  router = inject(Router);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  passwordSecurity: 'Débil' | 'Media' | 'Fuerte' | '' = '';

  registerForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
    ]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'),
      Validators.minLength(6),
    ]),
  });

  ngOnInit(): void {
    this.registerForm
      .get('password')
      ?.valueChanges.subscribe((value: string) => {
        this.passwordSecurity = this.checkPasswordStrength(value);
      });
    console.log('prueba', this.passwordSecurity);
  }

  checkControl(controlName: string, errorName: string) {
    return (
      this.registerForm.get(controlName)?.hasError(errorName) &&
      this.registerForm.get(controlName)?.touched
    );
  }

  checkPasswordStrength(password: string): 'Débil' | 'Media' | 'Fuerte' | '' {
    if (!password) return '';

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    const lengthValid = password.length >= 8;

    const checks = [
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial,
      lengthValid,
    ].filter(Boolean).length;

    if (checks <= 2) return 'Débil';
    if (checks === 3 || checks === 4) return 'Media';
    if (checks === 5) return 'Fuerte';

    return '';
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    try {
      const registerData: UserRegisterRequest = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        username: this.registerForm.value.username,
        password: this.registerForm.value.password,
      };
      const response = await this.authService
        .register(registerData)
        .toPromise();

      if (response) {
        this.authService.saveToken(response.token);
        this.router.navigate(['app/dashboard']);
      }
    } catch (error: any) {
      console.error(error.error);
      if (error.status === 409) {
        this.toastService.showError('Ese correo/usuario ya está registrado');
      } else {
        this.toastService.showError('Hubo un error al registrar el usuario');
      }
    }
  }
}
