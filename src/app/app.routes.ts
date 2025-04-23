import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard'; // ajusta el path según tu estructura

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'cuentos',
    loadChildren: () => import('./components/pages/Cuentos/cuentos.module').then(m => m.CuentosModule),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./components/pages/admin/admin.module').then(m => m.AdminModule),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/cuentos',
    pathMatch: 'full'
  }
];