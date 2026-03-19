import { Component, OnInit, OnDestroy } from '@angular/core';
import { CART_KEY } from '../../../services/carrito.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  // HU-R1-12: Recordatorio de carrito abandonado
  mostrarBannerCarrito = false;
  itemsCarritoCount = 0;
  private bannerTimeout: any;

  ngOnInit(): void {
    // Detectar carrito abandonado en localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(CART_KEY);
        if (saved) {
          const items = JSON.parse(saved) as { cantidad: number }[];
          const total = items.reduce((acc, i) => acc + (i.cantidad || 1), 0);
          if (total > 0) {
            this.itemsCarritoCount = total;
            this.mostrarBannerCarrito = true;
          }
        }
      } catch {
        // ignore
      }
    }
  }

  cerrarBannerCarrito(): void {
    this.mostrarBannerCarrito = false;
  }

  ngOnDestroy(): void {
    if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
  }
}
