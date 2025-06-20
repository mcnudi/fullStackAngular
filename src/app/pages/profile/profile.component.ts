import { Component, inject, } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../interfaces/iuser.interface';
import { ToastService } from '../../services/toast.service';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    RouterLink,
  ],
  providers: [DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  editView = false;
  username: string = '';

  authService = inject(AuthService);
  userService = inject(UserService);
  toastService = inject(ToastService);
  dialogService = inject(DialogService);
  router = inject(Router);

  profile: User = {
    user_id: 0,
    name: '',
    email: '',
    username: '',
    password: '',
    created_at: new Date(),
    image: '',
  };

  profileForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl(''),
  });

  ngOnInit(): void {
    this.username = this.authService.getUserName();

    this.userService.getByUsername(this.username).subscribe({
      next: (user) => {
        this.profile = user;
        this.profile.password = '*********';
        this.profileForm.patchValue(user);
      },
      error: (err) => {
        this.toastService.showError(
          'Error al obtener la información del usuario'
        );
        this.router.navigate(['app/dahsboard']);
      },
    });
  }

  toggleEdit() {
    this.editView = !this.editView;
    this.profileForm.patchValue({ password: '' });
  }

  async saveProfile() {
    if (this.profileForm.invalid) {
      this.toastService.showError('Por favor, completa todos los campos.');
      return;
    }

    const passworChanged = this.profileForm.value.password !== '';
    const usernameChanged =
      this.profileForm.value.username !== this.profile.username;

    const confirmed = await this.dialogService.confirm(
      'Confirmar Cambios',
      `¿Estás seguro de que quieres guardar los cambios?${
        !passworChanged && !usernameChanged
          ? '\nAVISO: Si no cambias la contraseña se mantendrá la actual.'
          : ''
      }${
        passworChanged || usernameChanged
          ? '\nAVISO: Si cambias la contraseña o el nombre de usuario tendrá que iniciar sesión de nuevo.'
          : ''
      }`
    );

    if (confirmed) {
      try {
        await this.userService
          .updateProfile(this.username, this.profileForm.value)
          .toPromise();

        if (usernameChanged || passworChanged) {
          this.authService.removeToken();
          this.router.navigate(['/home']);
          this.toastService.showSuccess('Perfil actualizado correctamente.');
          return;
        }
        const updatedUser = await this.userService
          .getByUsername(this.username)
          .toPromise();

        if (updatedUser) {
          this.profile = updatedUser;
          this.profile.password = '*********';
          this.profileForm.patchValue(updatedUser);
          this.editView = false;
          this.toastService.showSuccess('Perfil actualizado correctamente.');
        }
      } catch (err) {
        this.toastService.showError('Error al actualizar el perfil.');
      }
    }
  }

  get profileImageUrl(): string {
    return this.profile.image
      ? `data:image/png;base64,${this.profile.image}`
      : 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png';
  }
}
