import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MiniCartComponent } from './components/mini-cart/mini-cart.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CartService } from './services/carrito.service';
import { ToastService } from './services/toast.service';
import { BottomNavComponent } from './components/shared/bottom-nav/bottom-nav.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MiniCartComponent, BottomNavComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'cuentos-killa-FE';
  userRole: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cartService: CartService,
    private toastService: ToastService
  ) {
    const user = this.auth.getUser();
    this.userRole = user?.role ?? null;
    this.auth.usuarioLogueado$.subscribe((u: { role?: string } | null) => this.userRole = u?.role ?? null);
  }

  ngOnInit() {
    this.checkAbandonedCart();
  }

  private checkAbandonedCart(): void {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      const shown = sessionStorage.getItem('cart_reminder_shown');
      if (!shown) {
        // Obtenemos los ítems sin suscribirnos permanente para evitar spam
        const items = this.cartService.obtenerItems();
        if (items && items.length > 0) {
          setTimeout(() => {
            this.toastService.show('Parece que dejaste cuentos en tu carrito, ¿deseas continuar comprando? 🛒');
            sessionStorage.setItem('cart_reminder_shown', 'true');
          }, 2000); // 2 segundos de retraso al cargar la app
        }
      }
    }
  }

  get showMiniCart(): boolean {
    const url = this.router.url;
    const hideCartFlows = url.includes('/carrito') || url.includes('/checkout') || url.includes('/pago');

    // Solo mostramos el mini carrito amarillo/naranja si el usuario es comprador y no está ya en las vistas de carrito/pago
    return this.userRole === 'USER' && !hideCartFlows;
  }
}
