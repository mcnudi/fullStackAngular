
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PasswordRecoveryComponent } from './pages/passwordRecovery/passwordRecovery.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'passwordRecovery', component: PasswordRecoveryComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: 'home' },
];
