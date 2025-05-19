// admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminCuentosComponent } from './admin-cuentos/admin-cuentos.component';
import { AdminPedidosComponent } from './admin-pedidos/admin-pedidos.component';
import { AdminUsuariosComponent } from './admin-usuarios/admin-usuarios.component';

// import { SharedModule } from '../../shared.module'; 


const routes: Routes = [
  {
    path: '',
    // component: AdminLayoutComponent,
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
    // HttpClientModule,
    RouterModule,
    RouterModule.forChild(routes),    
  ]
})
export class AdminModule {}
