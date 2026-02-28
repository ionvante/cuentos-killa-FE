import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../../services/carrito.service';
import { MiniCartService } from '../../../services/mini-cart.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss']
})
export class BottomNavComponent implements OnInit {
  cartCount = 0;

  constructor(
    private cartService: CartService,
    private miniCartService: MiniCartService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.cartService.items$.subscribe(items => {
      this.cartCount = items.reduce((acc, item) => acc + item.cantidad, 0);
    });
  }

  isRouteActive(route: string): boolean {
    return this.router.url.includes(route) && route !== '/' || (this.router.url === '/' && route === '/home');
  }

  openCart(event: Event): void {
    event.preventDefault();
    this.miniCartService.open();
  }
}
