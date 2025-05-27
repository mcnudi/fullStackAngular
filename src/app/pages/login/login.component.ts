import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule, 
    RouterLink,    
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  showPassword = false;
  router = inject(Router);
  authService = inject(AuthService);

  loginForm: FormGroup = new FormGroup({
    usuario: new FormControl('', [Validators.required]),
    contrasena: new FormControl('', [Validators.required]),
  });


  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    try {
      const response = await this.authService
        .login(this.loginForm.value)
        .toPromise();
      if (response) {
        this.authService.saveToken(response.token);
        this.router.navigate(['/dashboard']);
      }
    } catch (err) {
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
