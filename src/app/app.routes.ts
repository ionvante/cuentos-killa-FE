import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./components/pages/Home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'cuento/:id',
        loadChildren: () =>
          import('./components/detalle-cuento/detalle-cuento.module').then(m => m.DetalleCuentoModule),
      },
      {
        path: 'carrito',
        loadComponent: () =>
          import('./components/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./components/pages/checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      {
        path: 'pago/:id',
        loadComponent: () =>
          import('./components/pages/pago/pago.component').then(m => m.PagoComponent)
      },
      {
        path: 'voucher/:id',
        loadComponent: () =>
          import('./components/pages/voucher/voucher.component').then(m => m.VoucherComponent)
      }, // si vas a subir comprobante
      {
        path: 'login',
        loadComponent: () =>
          import('./components/pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./components/pages/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./components/pages/order-list/order-list.component').then(m => m.OrderListComponent),
        canActivate: [authGuard]
      },
      {
        path: 'pedidos/:id',
        loadComponent: () =>
          import('./components/pages/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
        canActivate: [authGuard]
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./components/pages/admin/admin.module').then(m => m.AdminModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'cuentos',
        loadChildren: () =>
          import('./components/pages/cuentos/cuentos.module').then(m => m.CuentosModule)
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
    ]
  }
];
