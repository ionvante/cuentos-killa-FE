import { Component,OnInit  } from '@angular/core';
import { CartService } from '../../services/carrito.service';
import { Cuento } from '../../model/cuento.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})

export class CartComponent implements OnInit {
  cuentos: Cuento[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cuentos = this.cartService.getItems();
  }

  eliminarDelCarrito(id: number) {
    this.cartService.removeItem(id);
    this.cuentos = this.cartService.getItems(); // refresca
  }

  limpiarCarrito() {
    this.cartService.clearCart();
    this.cuentos = [];
  }
}
