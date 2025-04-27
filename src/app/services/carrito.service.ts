import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cuento } from '../model/cuento.model';


@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartKey = 'cart';
  private items: Cuento[] = [];

  constructor() {
    const savedCart = localStorage.getItem(this.cartKey);
    if (savedCart) {
      this.items = JSON.parse(savedCart);
    }
  }

  getItems(): Cuento[] {
    return [...this.items];
  }

  addItem(cuento: Cuento): void {
    this.items.push(cuento);
    this.saveCart();
  }

  removeItem(cuentoId: number): void {
    this.items = this.items.filter(item => item.id !== cuentoId);
    this.saveCart();
  }

  clearCart(): void {
    this.items = [];
    this.saveCart();
  }

  private saveCart(): void {
    localStorage.setItem(this.cartKey, JSON.stringify(this.items));
  }
}