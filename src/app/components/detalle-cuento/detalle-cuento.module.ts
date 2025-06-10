import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DetalleCuentoComponent } from './detalle-cuento.component';

const routes: Routes = [
  { path: '', component: DetalleCuentoComponent }
];

@NgModule({
  declarations: [DetalleCuentoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class DetalleCuentoModule {}