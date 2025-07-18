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
import { authGuardGuard } from './auth-guard.guard';
import { RutinasListComponent } from './pages/rutinas-list/rutinas-list.component';
import { RutinaComponent } from './pages/rutina/rutina.component';
import { DetalleRutinaComponent } from './pages/detalle-rutina/detalle-rutina.component';
import { RutinaGeneratorComponent } from './pages/rutina-generator/rutina-generator.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent, title: 'Rutinator' },
  { path: 'login', component: LoginComponent, title: 'Rutinator - login' },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Rutinator - registro',
  },
  {
    path: 'passwordRecovery',
    component: PasswordRecoveryComponent,
    title: 'Rutinator - Recuperar contraseña',
  },
  {
    path: 'app',
    canActivate: [authGuardGuard],
    component: ApplayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Rutinator - Dashboard',
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Rutinator - Perfil',
      },
      {
        path: 'updateImage',
        component: UpdateImageComponent,
        title: 'Rutinator - actualizar imagen',
      },
      {
        path: 'panel',
        component: PanelComponent,
        title: 'Rutinator - Mi panel',
      },
      {
        path: 'rutinas/generate',
        component: RutinaGeneratorComponent,
        title: 'Rutinator - Generador Rutinas IA',
      },
      {
        path: 'rutina',
        component: RutinasListComponent,
        title: 'Rutinator - Rutinas',
      },
      {
        path: 'anadirRutina/usuario',
        component: RutinaComponent,
        title: 'Rutinator - Rutinas',
      },
      {
        path: 'anadirRutina/tarea/:id',
        component: RutinaComponent,
        title: 'Rutinator - Rutinas',
      },
      {
        path: 'detalles/:id',
        component: DetalleRutinaComponent,
        title: 'Rutinator - Rutinas',
      },
      { path: 'rutinas/:usuario', 
        component: RutinasListComponent },

    ],
  },
  { path: '**', redirectTo: 'home' },
];
