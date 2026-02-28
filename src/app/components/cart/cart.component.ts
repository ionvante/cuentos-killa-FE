import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/carrito.service';
import { Cuento } from '../../model/cuento.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})

export class CartComponent implements OnInit {
  cuentos: { cuento: Cuento, cantidad: number }[] = [];

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.cartService.items$.subscribe(items => {
      this.cuentos = items;
    });
    this.cuentos = this.cartService.obtenerItems();
  }

  incrementar(id: number) {
    this.cartService.incrementarCantidad(id);
  }

  decrementar(id: number) {
    this.cartService.decrementarCantidad(id);
  }

  calcularTotal(): number {
    return this.cartService.calcularSubtotalGeneral();
  }

  eliminarDelCarrito(id: number) {
    this.cartService.removeItem(id);
  }

  limpiarCarrito() {
    this.cartService.clearCart();
  }
}
