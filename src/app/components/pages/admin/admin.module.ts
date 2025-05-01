// admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { AdminCuentosComponent } from './pages/cuentos/admin-cuentos.component';
import { AdminPedidosComponent } from './pages/pedidos/admin-pedidos.component';
import { AdminUsuariosComponent } from './pages/usuarios/admin-usuarios.component';
import { SharedModule } from '../../Shared.module';


const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'cuentos', component: AdminCuentosComponent },
      { path: 'pedidos', component: AdminPedidosComponent },
      { path: 'usuarios', component: AdminUsuariosComponent },
    ]
  }
];

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminDashboardComponent,
    AdminCuentosComponent,
    AdminPedidosComponent,
    AdminUsuariosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class AdminModule {}
