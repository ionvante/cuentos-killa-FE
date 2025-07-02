import { NgModule ,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CuentoCardComponent } from './cuento-card/cuento-card.component';
import { LazyLoadImageDirective } from '../directives/lazy-load-image.directive';
// import { CuentosGridComponent } from './cuentos-grid/cuentos-grid.component';

const routes: Routes = [
  { path: '', component: CuentoCardComponent }
];

@NgModule({
  declarations: [CuentoCardComponent],
  imports: [CommonModule, LazyLoadImageDirective],
  exports: [CuentoCardComponent, LazyLoadImageDirective], // 🔥 esto es clave
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {}