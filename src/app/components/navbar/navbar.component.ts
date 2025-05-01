import { Component ,OnInit} from '@angular/core';
import { LoginComponent } from '../pages/login/login.component';
import { MatDialog } from '@angular/material/dialog';
import { CartService } from '../../services/carrito.service';
import { Router } from '@angular/router';

import {CartModalComponent } from '../cart-modal/cart-modal.component';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Cuento } from '../../model/cuento.model';
import { User } from '../../model/user.model';




@Component({
  standalone: true,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [
    CommonModule, // 🔥 necesario para *ngIf, *ngFor
    // otros imports que tengas como MatDialogModule, etc.
  ]
})
export class NavbarComponent implements OnInit{
  carritoAbierto = false; // 🔥
  cantidadItems: number = 0;
  //userName: string | null = null;  
  user: User | null;
  constructor(
    private dialog: MatDialog,
    public  CartService: CartService,
    public authService: AuthService,
    private router: Router
  ) {

    this.actualizarCantidad();
    this.user = this.authService.getUser() || null;

  }
  public itemsCarrito: {  cuento: Cuento, cantidad: number }[] = [];



   abrirCarrito() {
    this.carritoAbierto = true;
  }
  cerrarCarrito() {
    this.carritoAbierto = false;
  }
  openLoginDialog() {
    this.dialog.open(LoginComponent, {
      width: '1200px'
    });
  }  
  ngOnInit(): void {
    this.CartService.items$.subscribe(items => {
      this.itemsCarrito = this.CartService.obtenerItems();
      this.user = this.authService.getUser();
    });
  }

  actualizarCantidad() {
    this.itemsCarrito = this.CartService.obtenerItems();       
  }

  get cantidadTotalItems(): number {
    return this.itemsCarrito.reduce((total, item) => total + item.cantidad, 0);
  }
  calcularSubtotal(): number {
    return this.itemsCarrito.reduce((total, item) => total + (item.cuento.precio * item.cantidad), 0);
  }
  
  irACheckout() {
    this.cerrarCarrito(); // para cerrar el sidebar si está abierto
    this.router.navigate(['/checkout']);
  }
  logout() {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
    window.location.href = '/home';  // 🔥 redirecciona bonito
  }

}
