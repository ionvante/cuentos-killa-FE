import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DrawerService } from '../../services/drawer.service';
import { CartService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../model/user.model';

@Component({
  selector: 'app-drawer-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './drawer-menu.component.html',
  styleUrls: ['./drawer-menu.component.scss']
})
export class DrawerMenuComponent {
  user: User | null = null;

  constructor(
    public drawer: DrawerService,
    public cart: CartService,
    private auth: AuthService
  ) {
    this.user = this.auth.getUser();
    this.auth.usuarioLogueado$.subscribe((u: User | null) => (this.user = u));
  }

  close() {
    this.drawer.close();
  }

  get itemCount(): number {
    return this.cart.obtenerItems().reduce((total: number, item: { cuento: any; cantidad: number }) => total + item.cantidad, 0);
  }

  logout() {
    this.auth.cerrarSesion();
    this.close();
  }
}
