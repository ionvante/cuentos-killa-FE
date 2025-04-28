import { Component ,OnInit} from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { MatDialog } from '@angular/material/dialog';
import { CartService } from '../../services/carrito.service';

import {CartModalComponent } from '../cart-modal/cart-modal.component';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Cuento } from '../../model/cuento.model';




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
  constructor(private dialog: MatDialog,public  CartService: CartService,public authService: AuthService) {

    this.actualizarCantidad();
    this.userName = this.authService.getUserName();
  }
  public itemsCarrito: {  cuento: Cuento, cantidad: number }[] = [];
  cantidadItems: number = 0;
  userName: string | null = null;


   abrirCarrito() {
    this.carritoAbierto = true;
  }
  cerrarCarrito() {
    this.carritoAbierto = false;
  }
  openLoginDialog() {
    this.dialog.open(LoginComponent, {
      width: '400px'
    });
  }  
  ngOnInit(): void {
    this.CartService.items$.subscribe(items => {
      this.itemsCarrito = this.CartService.obtenerItems();
    });

    this.userName = this.authService.getUserName();
  }

  actualizarCantidad() {
    this.itemsCarrito = this.CartService.obtenerItems();       
  }

  get cantidadTotalItems(): number {
    return this.itemsCarrito.reduce((total, item) => total + item.cantidad, 0);
  }

  logout() {
    this.authService.cerrarSesion();
    this.userName = null;
    window.location.href = '/home';  // 🔥 redirecciona bonito
  }

}
