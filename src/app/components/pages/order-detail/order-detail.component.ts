import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pedido, PedidoItem } from '../../../model/pedido.model';
import { PedidoService } from '../../../services/pedido.service';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { LazyLoadImageDirective } from '../../../directives/lazy-load-image.directive';
import { ModalComponent } from '../../app-modal/modal.component';
import { ToastService } from '../../../services/toast.service';
import { VoucherComponent } from '../voucher/voucher.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-order-detail',
  standalone: true, // Ensure standalone is true
  imports: [CommonModule, ModalComponent], // Add CommonModule here
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  pedido: Pedido | null = null;
  isLoading: boolean = true;
  errorMensaje: string | null = null;

  showVoucherModal = false;
  voucherFile: File | null = null;
  uploading = false;
  voucherNombre = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const pedidoId = +idParam; // Convert string to number
      forkJoin({
        detail: this.pedidoService.getOrderById(pedidoId),
        list: this.pedidoService.getOrders()
      }).subscribe({
        next: ({ detail, list }) => {
          const listMatch = list.find((o: Pedido) => o.Id === pedidoId || o.id === pedidoId);

          let mergedPedido = { ...detail, items: detail.items ?? [] };

          if (listMatch) {
            // Fusionar propiedades faltantes que el endpoint /orders/:id omitió pero /orders sí incluyó
            mergedPedido.fecha = mergedPedido.fecha || listMatch.fecha || listMatch.Fecha || '';
            mergedPedido.nombre = mergedPedido.nombre || listMatch.nombre || listMatch.Nombre || listMatch.usuario?.nombre || '';
            mergedPedido.correo = mergedPedido.correo || listMatch.correo || listMatch.Correo || listMatch.usuario?.email || '';
            mergedPedido.telefono = mergedPedido.telefono || listMatch.telefono || listMatch.Telefono || listMatch.usuario?.telefono || '';
            mergedPedido.direccion = mergedPedido.direccion || listMatch.direccion || listMatch.Direccion || '';
            mergedPedido.total = mergedPedido.total || listMatch.total || listMatch.Total || 0;
          }

          this.pedido = mergedPedido;
          console.log('Detalle del pedido (fusionado):', this.pedido);
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error fetching order details:', err);
          this.errorMensaje = 'No se pudo cargar el detalle del pedido. Verifique el ID o intente más tarde.';
          this.isLoading = false;
        }
      });
    } else {
      this.errorMensaje = 'ID de pedido no encontrado en la URL.';
      this.isLoading = false;
      // Consider navigating back or showing a more prominent error
    }
  }

  volverAPedidos(): void {
    this.router.navigate(['/pedidos']);
  }

  pagarAhora(): void {
    // Lógica de pago real podría ir aquí
    // Por ahora, solo un log y/o redirección a una página de placeholder
    console.log('Intento de pago para el pedido:', this.pedido?.Id);
    if (this.pedido) {
      // Ejemplo: Redirigir a una ruta de pago simulada o real
      // this.router.navigate(['/pago', this.pedido.id]);
      this.toast.show('Funcionalidad de pago aún no implementada. Serás redirigido a una página de simulación.');
    }
  }

  // Helper para verificar si el pedido está pendiente de pago
  isPagoPendiente(): boolean {
    return this.pedido?.estado?.toUpperCase() === 'PAGO_PENDIENTE';
  }

  confirmReplaceVoucher(): void {
    if (confirm('¿Deseas reemplazar el voucher enviado?')) {
      this.showVoucherModal = true;
      this.voucherFile = null;
      this.voucherNombre = '';
      this.uploading = false;
    }
  }

  onVoucherSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.voucherFile = input.files[0];
      this.voucherNombre = this.voucherFile.name;
    }
  }

  enviarNuevoVoucher(): void {
    if (!this.pedido || !this.voucherFile) return;
    this.uploading = true;
    const id = this.pedido.Id || this.pedido.id || 0;
    this.pedidoService.uploadVoucher(id, this.voucherFile).subscribe({
      next: () => {
        this.toast.show('Voucher reemplazado exitosamente.');
        this.showVoucherModal = false;
        // mantener estado en PAGO_ENVIADO
      },
      error: () => {
        this.toast.show('Error al subir el nuevo voucher.');
      },
      complete: () => {
        this.uploading = false;
      }
    });
  }
  // Helpers visuales para el diseño
  estadoMap: Record<string, { texto: string; icon: string; theme: string }> = {
    'PAGO_PENDIENTE': { texto: 'Pago pendiente', icon: 'local_mall', theme: 'pendiente' },
    'PAGO_ENVIADO': { texto: 'Pago enviado', icon: 'sync', theme: 'enviado' },
    'PAGO_VERIFICADO': { texto: 'Pago verificado', icon: 'verified', theme: 'verificado' },
    'ENVIADO': { texto: 'En camino', icon: 'category', theme: 'encamino' },
    'ENTREGADO': { texto: 'Entregado', icon: 'local_shipping', theme: 'entregado' },
  };

  getEstadoVisible(estado: string): string {
    const info = this.estadoMap[estado];
    return info ? info.texto : estado;
  }

  getEstadoIcon(estado: string): string {
    const info = this.estadoMap[estado];
    return info ? info.icon : 'info';
  }

  getEstadoTheme(estado: string): string {
    const info = this.estadoMap[estado];
    return info ? info.theme : 'default';
  }

  getPedidoId(): number | string {
    if (!this.pedido) return '';
    return (this.pedido.Id ?? (this.pedido as any).id) || '';
  }
}
