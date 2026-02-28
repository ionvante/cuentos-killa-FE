import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/carrito.service';
import { Cuento } from '../../model/cuento.model';
import { DrawerService } from '../../services/drawer.service';
import { MiniCartService } from '../../services/mini-cart.service';

@Component({
  selector: 'app-mini-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-cart.component.html',
  styleUrls: ['./mini-cart.component.scss']
})
export class MiniCartComponent implements OnInit {
  open = false;
  items: { cuento: Cuento; cantidad: number }[] = [];
  isAnimating = false;

  constructor(
    private cart: CartService,
    private router: Router,
    public drawer: DrawerService,
    private miniCart: MiniCartService
  ) { }

  ngOnInit(): void {
    this.cart.items$.subscribe(items => (this.items = items));
    this.miniCart.isOpen$.subscribe(open => (this.open = open));

    this.cart.itemAdded$.subscribe(() => {
      this.isAnimating = true;
      setTimeout(() => {
        this.isAnimating = false;
      }, 600); // 600ms duración de la animación bounce
    });
  }

  get totalQuantity(): number {
    return this.items.reduce((t, i) => t + i.cantidad, 0);
  }

  get subtotal(): number {
    return this.items.reduce((t, i) => t + i.cuento.precio * i.cantidad, 0);
  }

  openCart() {
    this.miniCart.open();
  }

  closeCart() {
    this.miniCart.close();
  }

  remove(id: number) {
    this.cart.removeItem(id);
  }

  changeQty(item: { cuento: Cuento; cantidad: number }, delta: number) {
    const found = this.items.find(i => i.cuento.id === item.cuento.id);
    if (found) {
      found.cantidad = Math.max(1, found.cantidad + delta);
      this.cart.actualizarCarrito();
    }
  }

  goCheckout() {
    this.closeCart();
    this.router.navigate(['/checkout']);
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.open) this.closeCart();
  }
}
