import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { CuentoCardComponent } from './cuento-card/cuento-card.component';

const routes: Routes = [
  { path: '', component: HomeComponent }
];

@NgModule({
  declarations: [CuentoCardComponent],
  exports: [CuentoCardComponent] // ✅ importante para poder usarlo fuera
})
export class SharedModule {}