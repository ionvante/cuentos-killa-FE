import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CuentoCardComponent } from './cuento-card/cuento-card.component';
import { LazyLoadImageDirective } from '../directives/lazy-load-image.directive';
import { FlyToCartDirective } from '../directives/fly-to-cart.directive';

@NgModule({
  declarations: [CuentoCardComponent],
  imports: [CommonModule, LazyLoadImageDirective, FlyToCartDirective],
  exports: [CuentoCardComponent, LazyLoadImageDirective, FlyToCartDirective]
})
export class SharedModule {}

