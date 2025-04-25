import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./components/pages/Home/home.module').then((m) => m.HomeModule),
  },{
    path: 'cuento/:id',
    loadChildren: () =>
      import('./components/detalle-cuento/detalle-cuenta.module').then(m => m.DetalleCuentoModule),
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/home',
  }
];