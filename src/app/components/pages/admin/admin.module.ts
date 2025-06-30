// admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminCuentosComponent } from './admin-cuentos/admin-cuentos.component';
import { AdminPedidosComponent } from './admin-pedidos/admin-pedidos.component';
import { AdminUsuariosComponent } from './admin-usuarios/admin-usuarios.component';
import { CuentoFormComponent } from './cuento-form/cuento-form.component';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { SharedModule } from "../../shared.module";

// import { SharedModule } from '../../shared.module'; 


const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'cuentos', component: AdminCuentosComponent },
      { path: 'cuentos/nuevo', component: CuentoFormComponent },
      { path: 'cuentos/editar/:id', component: CuentoFormComponent },
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
    AdminUsuariosComponent,
    CuentoFormComponent,
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // HttpClientModule,
    RouterModule,
    RouterModule.forChild(routes),
    SharedModule
]
})
export class AdminModule {}
