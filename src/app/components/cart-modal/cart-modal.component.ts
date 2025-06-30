import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/carrito.service';
import { Cuento } from '../../model/cuento.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, // 🔥 necesario para *ngIf, *ngFor
  ],
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.scss'],
  
})
export class CartModalComponent implements OnInit {
  cuentos: { cuento: Cuento, cantidad: number }[] = [];

  constructor(private carrito: CartService) {}

  ngOnInit(): void {
    this.cuentos = this.carrito.obtenerItems(); 
  }

  eliminar(cuentoId: number) {
    this.carrito.removeItem(cuentoId);
    this.cuentos = this.carrito.obtenerItems();
  }

  vaciar() {
    this.carrito.clearCart();
    this.cuentos = [];
  }
}
