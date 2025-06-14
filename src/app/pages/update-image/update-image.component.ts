import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-image',
  imports: [CommonModule],
  templateUrl: './update-image.component.html',
  styleUrl: './update-image.component.css',
})
export class UpdateImageComponent {
  selectedImage: File | null = null;
  previewUrl: string | null = null;
  sizeExceeded: boolean = false;

  userService = inject(UserService);
  toastService = inject(ToastService);
  authService = inject(AuthService);
  router = inject(Router);

  readonly MAX_SIZE_MB = 2;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const sizeInMB = file.size / (1024 * 1024);

      this.sizeExceeded = sizeInMB > this.MAX_SIZE_MB;
      this.selectedImage = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async onUpdate() {
    if (this.selectedImage && !this.sizeExceeded) {
      const username = this.authService.getUserName();

      const updatedImage = await this.userService
        .updateImage(username, this.selectedImage)
        .toPromise();
      this.toastService.showSuccess('Imagen actualizada correctamente');
      this.router.navigate(['app/profile']);

      console.log('Imagen actualizada:', this.selectedImage.name);
    }
  }
}
