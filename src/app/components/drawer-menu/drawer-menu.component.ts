import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DrawerService } from '../../services/drawer.service';
import { CartService } from '../../services/carrito.service';

@Component({
  selector: 'app-drawer-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './drawer-menu.component.html',
  styleUrls: ['./drawer-menu.component.scss']
})
export class DrawerMenuComponent {
  constructor(public drawer: DrawerService, public cart: CartService) {}

  close() {
    this.drawer.close();
  }

  get itemCount(): number {
    return this.cart.obtenerItems().reduce((total: number, item: { cuento: any; cantidad: number }) => total + item.cantidad, 0);
  }
}
