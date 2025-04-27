import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HeroBannerComponent } from '../../hero-banner/hero-banner.component';
import { CuentosGridComponent } from '../../cuentos-grid/cuentos-grid.component';
import { CuentoCardComponent } from '../../cuento-card/cuento-card.component';
import { HomeComponent } from './home.component';
import { MatCardModule } from '@angular/material/card';



@NgModule({
  declarations: [    HomeComponent,    CuentosGridComponent,    HeroBannerComponent,    CuentoCardComponent  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatCardModule
  ]
})
export class HomeModule {}