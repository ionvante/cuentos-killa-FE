import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DetalleCuentoComponent } from './detalle-cuento.component';
import { LazyLoadImageDirective } from '../../directives/lazy-load-image.directive';

const routes: Routes = [
  { path: '', component: DetalleCuentoComponent }
];

@NgModule({
  declarations: [DetalleCuentoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LazyLoadImageDirective
  ]
})
export class DetalleCuentoModule {}