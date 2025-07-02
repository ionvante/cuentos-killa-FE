import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { DrawerMenuComponent } from '../drawer-menu/drawer-menu.component';
import { DrawerService } from '../../services/drawer.service';
import { MiniCartComponent } from '../mini-cart/mini-cart.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, DrawerMenuComponent, MiniCartComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  constructor(public drawer: DrawerService) {}
}
