import { Component, Input, OnInit } from '@angular/core';
import { Cuento } from '../../../../model/cuento.model';
import { CuentoService } from '../../../../services/cuento.service';
import { Router } from '@angular/router';
// import { CartService } from '../../../../services/carrito.service'; // Assuming CartService is not needed here for admin actions directly

@Component({
  selector: 'app-admin-cuentos',
  templateUrl: './admin-cuentos.component.html',
  styleUrl: './admin-cuentos.component.scss'
})
export class AdminCuentosComponent implements OnInit {
  // @Input() cuento!: Cuento; // This Input seems unused here, more for a detail/card component
  cuentos: Cuento[] = [];
  // cargandoImagen: boolean = true; // This logic is now in CuentoCardComponent

  constructor(
    private cuentoService: CuentoService,
    // private cartService: CartService, // Removed as admin actions are different
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cuentoService.obtenerCuentos().subscribe(data => {
      this.cuentos = data;
    });
  }

  // Placeholder for image loading logic if needed directly in this component,
  // but it's better handled in CuentoCardComponent
  // cargarImagenPlaceholder(event: Event): void {
  //   const imgElement = event.target as HTMLImageElement;
  //   imgElement.onerror = null;
  //   imgElement.src = 'assets/placeholder-cuento.jpg';
  // }
  // imagenCargada(): void {
  //   // Logic when image is loaded if needed
  // }

  verDetalle(id: number): void { // This might be redundant if CuentoCard handles its own navigation
    this.router.navigate(['/cuento', id]);
  }

  // agregarAlCarrito(cuento: Cuento): void { // Admin dashboard might not need "agregarAlCarrito" directly
  //   this.cartService.addItem(cuento);
  // }

  // --- Funciones para Admin ---
  abrirModalAgregarCuento(): void {
    console.log('Abrir modal para agregar nuevo cuento');
    // Aquí se implementará la lógica para abrir un modal/dialogo con el formulario
    // Por ahora, podemos navegar a una ruta si el formulario es una página separada
    // this.router.navigate(['/admin/cuentos/nuevo']);
  }

  editarCuento(cuento: Cuento): void {
    console.log('Editar cuento:', cuento);
    // Aquí se implementará la lógica para abrir un modal/dialogo con el formulario
    // precargado con los datos del cuento.
    // O navegar a una ruta como '/admin/cuentos/editar', cuento.id]);
    // this.router.navigate(['/admin/cuentos/editar', cuento.id]);
  }

  deshabilitarCuento(cuento: Cuento): void {
    console.log('Deshabilitar cuento:', cuento);
    // Aquí se implementará la lógica para llamar al servicio y deshabilitar el cuento.
    // Se podría mostrar una confirmación antes de proceder.
    // Ejemplo: if (confirm(`¿Está seguro de que desea deshabilitar "${cuento.titulo}"?`)) { ... }
  }
}
