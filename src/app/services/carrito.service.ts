import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cuento } from '../model/cuento.model';
import { ToastService } from './toast.service';


@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartKey = 'cart';
  private items: { cuento: Cuento, cantidad: number }[] = [];
  private itemsSubject = new BehaviorSubject<{ cuento: Cuento, cantidad: number }[]>([]);
  items$ = this.itemsSubject.asObservable();


  constructor(private toast: ToastService) {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const carritoGuardado = localStorage.getItem('carrito');
      if (carritoGuardado) {
        this.items = JSON.parse(carritoGuardado);
        this.itemsSubject.next(this.items);
      }
    }
  }

  obtenerItems(): { cuento: Cuento, cantidad: number }[] {
    return this.items;
  }

  addItem(cuento: Cuento, cantidad: number = 1): void {
    const itemExistente = this.items.find(item => item.cuento.id === cuento.id);
    if (itemExistente) {
      itemExistente.cantidad += cantidad;
    } else {
      this.items.push({ cuento, cantidad });
    }
    this.actualizarCarrito();
    this.toast.show(
      `"${cuento.titulo}" agregado al carrito. <a href="/carrito">Ver carrito</a>`
    );
  }

  /**
   * Agrega un cuento al carrito con la cantidad indicada
   */
  addItemCantidad(cuento: Cuento, cantidad: number): void {
    const itemExistente = this.items.find(item => item.cuento.id === cuento.id);
    if (itemExistente) {
      itemExistente.cantidad += cantidad;
    } else {
      this.items.push({ cuento, cantidad });
    }
    this.actualizarCarrito();
    this.toast.show(`"${cuento.titulo}" agregado al carrito`);
  }

  actualizarCarrito(): void {
    this.itemsSubject.next(this.items);
    localStorage.setItem('carrito', JSON.stringify(this.items));
  }
  removeItem(cuentoId: number): void {
    this.items = this.items.filter(item => item.cuento.id !== cuentoId);
    this.actualizarCarrito();
  }

  clearCart(): void {
    this.items = [];
    this.itemsSubject.next(this.items);
    localStorage.removeItem('carrito');
  }

  private saveCart(): void {
    localStorage.setItem(this.cartKey, JSON.stringify(this.items));
  }}