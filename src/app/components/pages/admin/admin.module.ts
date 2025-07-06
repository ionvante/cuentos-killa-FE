// admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminCuentosComponent } from './admin-cuentos/admin-cuentos.component';
import { AdminPedidosComponent } from './admin-pedidos/admin-pedidos.component';
import { AdminUsuariosComponent } from './admin-usuarios/admin-usuarios.component';
import { CuentoFormComponent } from './cuento-form/cuento-form.component';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { ConfigCategoriesComponent } from './admin-config/config-categories.component';
import { ConfigCategoryFormComponent } from './admin-config/config-category-form.component';
import { ConfigItemsComponent } from './admin-config/config-items.component';
import { ConfigItemFormComponent } from './admin-config/config-item-form.component';
import { SharedModule } from "../../shared.module";
import { ModalComponent } from '../../app-modal/modal.component';
import { InputDialogComponent } from '../../input-dialog/input-dialog.component';

// import { SharedModule } from '../../shared.module'; 


const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => import('./admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardModule) },
      { path: 'cuentos', component: AdminCuentosComponent },
      { path: 'cuentos/nuevo', component: CuentoFormComponent },
      { path: 'cuentos/editar/:id', component: CuentoFormComponent },
      { path: 'pedidos', component: AdminPedidosComponent },
      { path: 'usuarios', component: AdminUsuariosComponent },
      { path: 'config', component: ConfigCategoriesComponent },
      { path: 'config/nueva', component: ConfigCategoryFormComponent },
      { path: 'config/editar/:id', component: ConfigCategoryFormComponent },
      { path: 'config/:id/items', component: ConfigItemsComponent },
      { path: 'config/:id/items/nuevo', component: ConfigItemFormComponent },
      { path: 'config/:id/items/editar/:itemId', component: ConfigItemFormComponent },
    ]
  }
];

@NgModule({
  declarations: [
    AdminCuentosComponent,
    AdminPedidosComponent,
    AdminUsuariosComponent,
    CuentoFormComponent,
    ConfirmDialogComponent,
    ConfigCategoriesComponent,
    ConfigCategoryFormComponent,
    ConfigItemsComponent,
    ConfigItemFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // HttpClientModule,
    RouterModule,
    RouterModule.forChild(routes),
    SharedModule,
    AdminLayoutComponent,
    ModalComponent,
    InputDialogComponent
  ]
})
export class AdminModule {}
