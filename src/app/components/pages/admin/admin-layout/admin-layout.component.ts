import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LazyLoadImageDirective } from '../../../../directives/lazy-load-image.directive';
import { AdminDrawerComponent } from '../../../admin-drawer/admin-drawer.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, LazyLoadImageDirective, AdminDrawerComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  menuAbierto = false;
  isDesktop = false;

  constructor() {
    this.onResize();
  }

  @HostListener('window:resize')
  onResize() {
    this.isDesktop = window.innerWidth >= 1024;
  }

  toggleMenu(force?: boolean) {
    this.menuAbierto = force !== undefined ? force : !this.menuAbierto;
  }

}
