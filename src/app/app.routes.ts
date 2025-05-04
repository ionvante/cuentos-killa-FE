import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component'; // importa tu layout
import { CheckoutComponent } from './components/pages/checkout/checkout.component';
import { LoginComponent } from './components/pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { AdminDashboardComponent } from './components/pages/admin/admin-dashboard/admin-dashboard.component';
import { AdminPedidosComponent } from './components/pages/admin/admin-pedidos/admin-pedidos.component';
import { AdminCuentosComponent } from './components/pages/admin/admin-cuentos/admin-cuentos.component';
import { AdminLayoutComponent } from './components/pages/admin/admin-layout/admin-layout.component';


export const routes: Routes = [
  {
    path: '',
  component: LayoutComponent,
  children: [
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
    path: 'carrito',
    loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent)
  },
  { path: 'checkout', component: CheckoutComponent,canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [authGuard],
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'pedidos', component: AdminPedidosComponent },
      { path: 'cuentos', component: AdminCuentosComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/home',
  }]
  }
];