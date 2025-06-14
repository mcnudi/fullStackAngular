import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PasswordRecoveryComponent } from './pages/passwordRecovery/passwordRecovery.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { UpdateImageComponent } from './pages/update-image/update-image.component';
import { ApplayoutComponent } from './shared/applayout/applayout.component';
import { PanelComponent } from './pages/panel/panel.component';
import { RutinaComponent } from './pages/rutina/rutina.component';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'passwordRecovery', component: PasswordRecoveryComponent },
  {
    path: 'app',
    component: ApplayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'updateImage', component: UpdateImageComponent },
      { path: 'panel', component: PanelComponent },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
