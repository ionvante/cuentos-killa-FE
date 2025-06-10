import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component'; // importa tu layout
import { CheckoutComponent } from './components/pages/checkout/checkout.component';
import { LoginComponent } from './components/pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminDashboardComponent } from './components/pages/admin/admin-dashboard/admin-dashboard.component';
import { AdminPedidosComponent } from './components/pages/admin/admin-pedidos/admin-pedidos.component';
import { AdminCuentosComponent } from './components/pages/admin/admin-cuentos/admin-cuentos.component';
import { AdminLayoutComponent } from './components/pages/admin/admin-layout/admin-layout.component';
import { PagoComponent } from './components/pages/pago/pago.component';
import { VoucherComponent } from './components/pages/voucher/voucher.component';
import { OrderListComponent } from './components/pages/order-list/order-list.component';
import { OrderDetailComponent } from './components/pages/order-detail/order-detail.component';
import { AdminGuard } from './guards/admin.guard';


export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./components/pages/Home/home.module').then((m) => m.HomeModule),
      }, {
        path: 'cuento/:id',
        loadChildren: () =>
          import('./components/detalle-cuento/detalle-cuento.module').then(m => m.DetalleCuentoModule),
      },
      {
        path: 'carrito',
        loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent)
      },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'pago/:id', component: PagoComponent },
      { path: 'voucher/:id', component: VoucherComponent }, // si vas a subir comprobante
      { path: 'login', component: LoginComponent },
      { path: 'pedidos', component: OrderListComponent, canActivate: [authGuard] },
      { path: 'pedidos/:id', component: OrderDetailComponent, canActivate: [authGuard] },
      {
        path: 'admin',
        loadChildren: () => import('./components/pages/admin/admin.module').then(m => m.AdminModule),
        canActivate: [AdminGuard]
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
