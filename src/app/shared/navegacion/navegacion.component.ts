import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-navegacion',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navegacion.component.html',
  styleUrl: './navegacion.component.css',
})
export class NavegacionComponent {
  profileImage: string =
    'https://cdn-icons-png.flaticon.com/512/1144/1144760.png';

  authService = inject(AuthService);
  router = inject(Router);
  userService = inject(UserService);

  logout() {
    this.authService.removeToken();
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    this.userService.getByUsername(this.authService.getUserName()).subscribe({
      next: (user) => {
        if (user.image) {
          this.profileImage = `data:image/png;base64,${user.image}`;
        }
      },
      error: (err) => {
        console.error('Error al cargar la imagen del perfil', err);
      },
    });
  }
}
