import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CuentoCardComponent } from './cuento-card/cuento-card.component';
import { LazyLoadImageDirective } from '../directives/lazy-load-image.directive';
import { FlyToCartDirective } from '../directives/fly-to-cart.directive';
import { SkeletonComponent } from './shared/skeleton/skeleton.component';
import { BreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';

@NgModule({
  declarations: [CuentoCardComponent],
  imports: [CommonModule, LazyLoadImageDirective, FlyToCartDirective, SkeletonComponent, BreadcrumbComponent],
  exports: [CuentoCardComponent, LazyLoadImageDirective, FlyToCartDirective, SkeletonComponent, BreadcrumbComponent]
})
export class SharedModule { }

