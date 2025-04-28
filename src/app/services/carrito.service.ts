import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cuento } from '../model/cuento.model';


@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartKey = 'cart';
  private items: Cuento[] = [];
  private itemsSubject = new BehaviorSubject<Cuento[]>([]);
  items$ = this.itemsSubject.asObservable();


  constructor() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const carritoGuardado = localStorage.getItem('carrito');
      if (carritoGuardado) {
        this.items = JSON.parse(carritoGuardado);
        this.itemsSubject.next(this.items);
      }
    }
  }

  getItems(): Cuento[] {
    return this.items;
  }

  addItem(cuento: Cuento): void {
    this.items.push(cuento);
    this.itemsSubject.next(this.items);
    localStorage.setItem('carrito', JSON.stringify(this.items));
  }

  removeItem(cuentoId: number): void {
    this.items = this.items.filter(item => item.id !== cuentoId);
    this.saveCart();
  }

  clearCart(): void {
    this.items = [];
    this.itemsSubject.next(this.items);
    localStorage.removeItem('carrito');
  }

  private saveCart(): void {
    localStorage.setItem(this.cartKey, JSON.stringify(this.items));
  }
}