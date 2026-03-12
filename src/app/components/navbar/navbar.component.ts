import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../services/carrito.service';
import { Router, RouterModule } from '@angular/router';
import { DrawerService } from '../../services/drawer.service';
import { MiniCartService } from '../../services/mini-cart.service';

import { CartModalComponent } from '../cart-modal/cart-modal.component';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Cuento } from '../../model/cuento.model';
import { User } from '../../model/user.model';
import { FormsModule } from '@angular/forms';
import { LazyLoadImageDirective } from '../../directives/lazy-load-image.directive';
import { CuentoService } from '../../services/cuento.service';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';




@Component({
  standalone: true,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [
    CommonModule, // 🔥 necesario para *ngIf, *ngFor
    RouterModule, // habilita routerLink en la plantilla
    FormsModule,
    LazyLoadImageDirective
  ]
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  cantidadItems: number = 0;
  user: User | null = null;
  mostrarPerfil = false;
  searchQuery = '';
  searchSubject = new Subject<string>();
  searchResults: Cuento[] = [];
  showDropdown = false;

  constructor(
    public CartService: CartService,
    public authService: AuthService,
    private router: Router,
    public drawer: DrawerService,
    private miniCart: MiniCartService,
    private cuentoService: CuentoService
  ) {

    this.actualizarCantidad();

  }
  public itemsCarrito: { cuento: Cuento, cantidad: number }[] = [];

  ngOnInit(): void {
    // Suscripción unificada: carrito + usuario sin anidamiento
    combineLatest([
      this.CartService.items$,
      this.authService.usuarioLogueado$
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([items, usuario]) => {
        this.itemsCarrito = items;
        this.user = usuario;
      });

    // Typeahead Logic
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query.length > 2) {
        this.cuentoService.obtenerCuentos().subscribe(cuentos => {
          this.searchResults = cuentos.filter(c =>
            c.titulo.toLowerCase().includes(query.toLowerCase()) ||
            c.autor.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 5);
          this.showDropdown = this.searchResults.length > 0;
        });
      } else {
        this.searchResults = [];
        this.showDropdown = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.miniCart.open();
  }
  cerrarCarrito() {
    this.miniCart.close();
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

  onSearchInput(value: string) {
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  hideDropdown() {
    setTimeout(() => this.showDropdown = false, 200); // Retraso para permitir click
  }

  selectResult(cuento: Cuento) {
    this.searchQuery = '';
    this.showDropdown = false;
    this.router.navigate(['/cuento', cuento.id]);
  }

  onSearch(event: Event) {
    event.preventDefault();
    const query = this.searchQuery.trim();
    this.showDropdown = false;
    if (query) {
      this.router.navigate(['/cuentos'], { queryParams: { q: query } });
    } else {
      this.router.navigate(['/cuentos']);
    }
  }

  logout() {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
    window.location.href = '/home';  // 🔥 redirecciona bonito
  }

}
