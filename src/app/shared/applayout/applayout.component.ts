import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { RouterOutlet, RouterLink, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { lastValueFrom } from 'rxjs';
import { User } from '../../interfaces/iuser.interface';

@Component({
  selector: 'app-applayout',
  imports: [
    MatSidenavModule,
    RouterOutlet,
    MatDividerModule,
    MatListModule,
    RouterLink,
    RouterModule  
  ],
  templateUrl: './applayout.component.html',
  styleUrl: './applayout.component.css',
})
export class ApplayoutComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);

  user: User | null = null;
  profileImage: string =
    'https://cdn-icons-png.flaticon.com/512/1144/1144760.png';

  async ngOnInit() {
    const username = this.authService.getUserName();
    if (username) {
      this.user = await lastValueFrom(this.userService.getByUsername(username));
      if (this.user.image)
        this.profileImage = `data:image/png;base64,${this.user.image}`;
    }
  }

  logout() {
    this.authService.removeToken();
    this.router.navigate(['/home']);
  }
}
