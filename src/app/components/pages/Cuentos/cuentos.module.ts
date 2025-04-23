import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CuentosComponent } from './cuentos.component';

@NgModule({
  declarations: [CuentosComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: CuentosComponent }
    ])
  ]
})
export class CuentosModule {}
