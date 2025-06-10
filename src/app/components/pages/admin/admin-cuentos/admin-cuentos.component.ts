import { Component, OnInit } from '@angular/core';
import { Cuento } from '../../../../model/cuento.model';
import { CuentoService } from '../../../../services/cuento.service';
import { Router } from '@angular/router';
import { CartService } from '../../../../services/carrito.service';

@Component({
  selector: 'app-admin-cuentos',
  templateUrl: './admin-cuentos.component.html',
  styleUrl: './admin-cuentos.component.scss'
})
export class AdminCuentosComponent implements OnInit {
  cuentos: Cuento[] = [];
  cargandoImagen: boolean = true; // 🔥 Nueva bandera para el skeleton

  constructor(
    private cuentoService: CuentoService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cuentoService.obtenerCuentos().subscribe(data => {
      this.cuentos = data;
    });
  }

  cargarImagenPlaceholder(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.onerror = null; // 🔥 MUY IMPORTANTE: eliminar el listener para evitar loop
    imgElement.src = 'assets/placeholder-cuento.jpg';
    this.cargandoImagen = false; // 🔥 Ya no hay que seguir mostrando skeleton
  }
  imagenCargada(): void {
    this.cargandoImagen = false; // 🔥 Cuando la imagen carga, quitamos skeleton
  }
  verDetalle(id: number) {
    this.router.navigate(['/cuento', id]);
  }

  agregarAlCarrito(cuento: Cuento): void {
    this.cartService.addItem(cuento);
  }
}
