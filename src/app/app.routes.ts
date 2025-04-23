import { Routes } from '@angular/router';

export const routes: Routes = [
    {
      path: 'home',
      loadChildren: () => import('./components/pages/Home/home.module').then(m => m.HomeModule)
    }
  ];
