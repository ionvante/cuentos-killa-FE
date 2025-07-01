import { Component, Input, OnInit } from '@angular/core';
import { Cuento } from '../../../../model/cuento.model';
import { CuentoService } from '../../../../services/cuento.service';
import { Router } from '@angular/router';
// import { CartService } from '../../../../services/carrito.service'; // Assuming CartService is not needed here for admin actions directly

@Component({
  selector: 'app-admin-cuentos',
  templateUrl: './admin-cuentos.component.html',
  styleUrls: ['./admin-cuentos.component.scss']
})
export class AdminCuentosComponent implements OnInit {
  // @Input() cuento!: Cuento; // This Input seems unused here, more for a detail/card component
  cuentos: Cuento[] = [];
  cuentoParaDeshabilitar: Cuento | null = null;
  isLoading = true;
  errorMensaje: string | null = null;
  // cargandoImagen: boolean = true; // This logic is now in CuentoCardComponent

  constructor(
    private cuentoService: CuentoService,
    // private cartService: CartService, // Removed as admin actions are different
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cuentoService.obtenerCuentos().subscribe({
      next: data => {
        this.cuentos = data;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error al cargar cuentos:', err);
        this.errorMensaje = 'No se pudieron cargar los cuentos';
        this.isLoading = false;
      }
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
    this.router.navigate(['/admin/cuentos/nuevo']);
  }

  editarCuento(cuento: Cuento): void {
    this.router.navigate(['/admin/cuentos/editar', cuento.id]);
  }

  deshabilitarCuento(cuento: Cuento): void {
    this.cuentoParaDeshabilitar = cuento;
  }

  confirmarDeshabilitar(): void {
    if (!this.cuentoParaDeshabilitar) return;
    const id = this.cuentoParaDeshabilitar.id;
    const nuevoEstado = !this.cuentoParaDeshabilitar.habilitado;
    this.cuentoService.deshabilitarCuento(id, nuevoEstado).subscribe({
      next: () => {
        this.cuentos = this.cuentos.map(c =>
          c.id === id ? { ...c, habilitado: nuevoEstado } : c
        );
        this.cuentoParaDeshabilitar = null;
      },
      error: err => {
        console.error('Error al cambiar el estado del cuento:', err);
        this.errorMensaje = 'No se pudo actualizar el estado del cuento';
        this.cuentoParaDeshabilitar = null;
      }
    });
  }

  cancelarDeshabilitar(): void {
    this.cuentoParaDeshabilitar = null;
  }
}
