import { Component, OnInit } from '@angular/core';
import { LoginComponent } from '../pages/login/login.component';
import { MatDialog } from '@angular/material/dialog';
import { CartService } from '../../services/carrito.service';
import { Router, RouterModule } from '@angular/router';

import { CartModalComponent } from '../cart-modal/cart-modal.component';
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
    RouterModule, // habilita routerLink en la plantilla
    // otros imports que tengas como MatDialogModule, etc.
  ]
})
export class NavbarComponent implements OnInit {
  carritoAbierto = false; // 🔥
  cantidadItems: number = 0;
  user: User | null = null;
  menuAbierto = false;
  mostrarPerfil = false;
  constructor(
    private dialog: MatDialog,
    public CartService: CartService,
    public authService: AuthService,
    private router: Router
  ) {

    this.actualizarCantidad();

  }
  public itemsCarrito: { cuento: Cuento, cantidad: number }[] = [];




  openLoginDialog() {
    this.dialog.open(LoginComponent, {
      maxWidth: '50vw',
      width: '80%',
      panelClass: 'custom-login-dialog'
    });
  }
  ngOnInit(): void {
    this.CartService.items$.subscribe(items => {
      this.itemsCarrito = this.CartService.obtenerItems();
      this.user = this.authService.getUser();

      // 👇 Escucha cambios de login
      this.authService.usuarioLogueado$.subscribe((nuevoUsuario) => {
        this.user = nuevoUsuario;
      });
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
  abrirCarrito() {
    this.carritoAbierto = true;
  }
  cerrarCarrito() {
    this.carritoAbierto = false;
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  closeMenu() {
    this.menuAbierto = false;
  }

  togglePerfil() {
    this.mostrarPerfil = !this.mostrarPerfil;
  }
  irACheckout() {
    const usuario = this.user;
    this.cerrarCarrito();

    if (!usuario) {
      this.router.navigate(['/login'], {
        queryParams: { returnTo: '/checkout' }
      });
    } else {
      this.router.navigate(['/checkout']);
    }
  }

  logout() {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
    window.location.href = '/home';  // 🔥 redirecciona bonito
  }

}
