import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../../services/carrito.service';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../model/user.model';
import { Cuento } from '../../../../model/cuento.model';

@Component({
  selector: 'app-admin-layout',
  // standalone: true,
  // imports: [RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  menuAbierto = false;
  itemsCarrito: { cuento: Cuento, cantidad: number }[] = [];
  user: User | null = null;

  constructor(private cartService: CartService, private authService: AuthService) {}

  ngOnInit(): void {
    this.cartService.items$.subscribe(items => this.itemsCarrito = items);
    this.user = this.authService.getUser();
    this.authService.usuarioLogueado$.subscribe(u => this.user = u);
  }

  get cantidadTotalItems(): number {
    return this.itemsCarrito.reduce((t, i) => t + i.cantidad, 0);
  }

  toggleMenu(force?: boolean) {
    this.menuAbierto = force !== undefined ? force : !this.menuAbierto;
  }
}
