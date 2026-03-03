import { Component, Input, OnInit } from '@angular/core';
import { Cuento } from '../../../../model/cuento.model';
import { CuentoService } from '../../../../services/cuento.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-cuentos',
  templateUrl: './admin-cuentos.component.html',
  styleUrls: ['./admin-cuentos.component.scss']
})
export class AdminCuentosComponent implements OnInit {
  cuentos: Cuento[] = [];
  cuentoParaDeshabilitar: Cuento | null = null;
  isLoading = true;
  errorMensaje: string | null = null;

  // Paginación
  currentPage: number = 0;
  pageSize: number = 8;
  totalPages: number = 0;

  constructor(
    private cuentoService: CuentoService,
    // private cartService: CartService, // Removed as admin actions are different
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarCuentos(this.currentPage);
  }

  cargarCuentos(page: number): void {
    this.isLoading = true;
    this.cuentoService.obtenerCuentosPaginados(page, this.pageSize).subscribe({
      next: (pageData) => {
        this.cuentos = pageData.content;
        this.currentPage = pageData.number;
        this.totalPages = pageData.totalPages;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error al cargar cuentos paginados:', err);
        this.errorMensaje = 'No se pudieron cargar los cuentos';
        this.isLoading = false;
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.cargarCuentos(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.cargarCuentos(this.currentPage - 1);
    }
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
