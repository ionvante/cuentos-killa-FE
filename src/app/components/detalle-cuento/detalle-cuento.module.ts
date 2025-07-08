import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DetalleCuentoComponent } from './detalle-cuento.component';
import { LazyLoadImageDirective } from '../../directives/lazy-load-image.directive';

const routes: Routes = [
  { path: '', component: DetalleCuentoComponent }
];

@NgModule({
  declarations: [DetalleCuentoComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    LazyLoadImageDirective
  ]
})
export class DetalleCuentoModule {}