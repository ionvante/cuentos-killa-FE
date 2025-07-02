import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LazyLoadImageDirective } from '../../../directives/lazy-load-image.directive';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, LazyLoadImageDirective],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  menuAbierto = false;

  toggleMenu(force?: boolean) {
    this.menuAbierto = force !== undefined ? force : !this.menuAbierto;
  }

}
