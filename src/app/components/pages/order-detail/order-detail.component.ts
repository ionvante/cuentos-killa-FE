import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Pedido, PedidoItem } from '../../../model/pedido.model';
import { PedidoService } from '../../../services/pedido.service';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { ModalComponent } from '../../app-modal/modal.component';
import { ToastService } from '../../../services/toast.service';
import { AppCurrencyPipe } from '../../../pipes/app-currency.pipe';
import { forkJoin } from 'rxjs';

import { MaestrosService } from '../../../services/maestros.service';
import { EstadoPedido } from '../../../model/estado-pedido.enum';

@Component({
  selector: 'app-order-detail',
  standalone: true, // Ensure standalone is true
  imports: [CommonModule, RouterModule, AppCurrencyPipe, ModalComponent],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  pedido: Pedido | null = null;
  isLoading: boolean = true;
  errorMensaje: string | null = null;
  tiposDocumento: any[] = [];

  showVoucherModal = false;
  voucherFile: File | null = null;
  uploading = false;
  voucherNombre = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService,
    private maestrosService: MaestrosService,
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
            mergedPedido.documentoTipo = mergedPedido.documentoTipo || listMatch.documentoTipo || listMatch.DocumentoTipo || '';
            mergedPedido.documentoNumero = mergedPedido.documentoNumero || listMatch.documentoNumero || listMatch.DocumentoNumero || '';
          }

          this.pedido = mergedPedido;
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error fetching order details:', err);
          this.errorMensaje = 'No se pudo cargar el detalle del pedido. Verifique el ID o intente más tarde.';
          this.isLoading = false;
        }
      });
      this.loadTiposDocumento();
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
    if (this.pedido) {
      const id = this.pedido.Id ?? this.pedido.id;
      this.router.navigate(['/pago', id]);
    }
  }

  // Helper para verificar si el pedido está pendiente de pago
  isPagoPendiente(): boolean {
    return this.pedido?.estado?.toUpperCase() === EstadoPedido.PAGO_PENDIENTE;
  }

  get stepProgreso(): number {
    if (!this.pedido) return 0;
    switch (this.pedido.estado) {
      case EstadoPedido.PAGO_PENDIENTE:
      case EstadoPedido.PAGO_ENVIADO:
        return 1;
      case EstadoPedido.PAGO_VERIFICADO:
        return 2;
      case EstadoPedido.EMPAQUETADO:
        return 3;
      case EstadoPedido.ENVIADO:
        return 4;
      case EstadoPedido.ENTREGADO:
        return 5;
      default:
        return 0; // Cancelado/Rechazado
    }
  }

  isCancelledState(): boolean {
    return this.pedido?.estado === EstadoPedido.CANCELADO || this.pedido?.estado === EstadoPedido.PAGO_RECHAZADO;
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
    [EstadoPedido.PAGO_PENDIENTE]: { texto: 'Pago pendiente', icon: 'local_mall', theme: 'pendiente' },
    [EstadoPedido.PAGO_ENVIADO]: { texto: 'Pago enviado', icon: 'sync', theme: 'enviado' },
    [EstadoPedido.PAGO_VERIFICADO]: { texto: 'Pago verificado', icon: 'verified', theme: 'verificado' },
    [EstadoPedido.ENVIADO]: { texto: 'En camino', icon: 'category', theme: 'encamino' },
    [EstadoPedido.ENTREGADO]: { texto: 'Entregado', icon: 'local_shipping', theme: 'entregado' },
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

  loadTiposDocumento(): void {
    this.maestrosService.obtenerMaestrosPorGrupo('TIPO_DOCUMENTO').subscribe({
      next: (data) => {
        this.tiposDocumento = data || [];
      },
      error: () => {
        this.tiposDocumento = [];
      }
    });
  }

  getTipoDocumentoDisplay(codigo: string | undefined): string {
    if (!codigo) return '';
    const tipo = this.tiposDocumento.find(t => t.codigo === codigo);
    return tipo ? (tipo.valor || tipo.descripcion || codigo) : codigo;
  }
}
