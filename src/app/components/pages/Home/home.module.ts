import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HeroBannerComponent } from '../../hero-banner/hero-banner.component';
import { CuentosGridComponent } from '../../cuentos-grid/cuentos-grid.component';
import { HomeComponent } from './home.component';
import { CuentosModule } from '../cuentos/cuentos.module';
import { SharedModule } from './../../shared.module';


@NgModule({
  declarations: [    HomeComponent,    CuentosGridComponent,    HeroBannerComponent  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    CuentosModule
  ],
})
export class HomeModule {}