import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { CuentosGridComponent } from 'src/app/components/cuentos-grid/cuentos-grid.component';
import { HeroBannerComponent } from 'src/app/components/hero-banner/hero-banner.component';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';

@NgModule({
  declarations: [
    HomeComponent,
    CuentosGridComponent,
    HeroBannerComponent,
    NavbarComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule
  ]
})
export class HomeModule {}