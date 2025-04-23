import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { NavbarComponent } from '../../navbar/navbar.component';
import { HeroBannerComponent } from '../../hero-banner/hero-banner.component';
import { CuentosGridComponent } from '../../cuentos-grid/cuentos-grid.component';
import { CuentoCardComponent } from '../../cuento-card/cuento-card.component';
import { HomeComponent } from './home.component';


@NgModule({
  declarations: [    HomeComponent,    CuentosGridComponent,    HeroBannerComponent,    NavbarComponent, CuentoCardComponent  ],
  imports: [
    CommonModule,
    HomeRoutingModule
  ]
})
export class HomeModule {}