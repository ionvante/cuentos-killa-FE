import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cuento } from '../model/cuento.model';


@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private items: Cuento[] = [];
  private carritoSubject = new BehaviorSubject<Cuento[]>([]);

  get carrito$() {
    return this.carritoSubject.asObservable();
  }

  agregarAlCarrito(cuento: Cuento) {
    this.items.push(cuento);
    this.carritoSubject.next(this.items);
  }

  obtenerCarrito() {
    return this.items;
  }

  limpiarCarrito() {
    this.items = [];
    this.carritoSubject.next(this.items);
  }
}
