import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CuentosComponent } from './cuentos.component';
import { CuentoCardComponent } from '../../cuento-card/cuento-card.component';

const routes: Routes = [
  { path: '', component: CuentosComponent }
];

@NgModule({
  declarations: [CuentosComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes), CuentoCardComponent],
})
export class CuentosModule {}
