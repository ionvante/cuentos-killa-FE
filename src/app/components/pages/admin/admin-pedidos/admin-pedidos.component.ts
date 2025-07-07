import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../../services/pedido.service';
import { Pedido } from '../../../../model/pedido.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-pedidos',
  templateUrl: './admin-pedidos.component.html',
  styleUrls: ['./admin-pedidos.component.scss']
})
export class AdminPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  isLoading = true;
  errorMensaje: string | null = null;
  selectedPedido: Pedido | null = null;
  voucherUrl: string | null = null;
  processing = false;

  isMobile = false;
  showReasonDialog = false;
  private userIdFilter: string | null = null;

  constructor(private pedidoService: PedidoService, private route: ActivatedRoute) {}

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 600;
  }

  ngOnInit(): void {
    this.onResize();
    this.route.queryParamMap.subscribe(params => {
      this.userIdFilter = params.get('userId');
      this.cargarPedidos();
    });
  }

  private cargarPedidos(): void {
    this.pedidoService.getOrders().subscribe({
      next: data => {
        this.pedidos = this.userIdFilter
          ? data.filter(p => String(p.userId) === this.userIdFilter)
          : data;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error fetching orders:', err);
        this.errorMensaje = 'No se pudieron cargar los pedidos';
        this.isLoading = false;
      }
    });
  }

  abrirModal(pedido: Pedido): void {
    this.selectedPedido = pedido;
    const id = pedido.Id || pedido.id || 0;
    this.pedidoService.getVoucherUrl(id).subscribe({
      next: url => {
        this.voucherUrl = url;
      },
      error: err => console.error('Error fetching voucher url', err)
    });
  }

  cerrarModal(): void {
    this.selectedPedido = null;
    this.voucherUrl = null;
    this.processing = false;
  }

  descargarVoucher(): void {
    if (this.voucherUrl) {
      window.open(this.voucherUrl, '_blank');
    }
  }

  validarPago(): void {
    if (!this.selectedPedido) return;
    this.processing = true;
    const id = this.selectedPedido.Id || this.selectedPedido.id || 0;
    this.pedidoService.updateOrderStatus(id, 'PAGO_VERIFICADO').subscribe({
      next: () => {
        this.selectedPedido!.estado = 'PAGO_VERIFICADO';
        this.cerrarModal();
      },
      error: err => {
        console.error('Error validating voucher', err);
        this.processing = false;
      }
    });
  }

  rechazarPago(): void {
    if (!this.selectedPedido) return;
    this.showReasonDialog = true;
  }

  confirmarRechazo(motivo: string): void {
    if (!this.selectedPedido) return;
    this.showReasonDialog = false;
    this.processing = true;
    const id = this.selectedPedido.Id || this.selectedPedido.id || 0;
    this.pedidoService.updateOrderStatus(id, 'PAGO_RECHAZADO', motivo).subscribe({
      next: () => {
        this.selectedPedido!.estado = 'PAGO_RECHAZADO';
        this.cerrarModal();
      },
      error: err => {
        console.error('Error rejecting voucher', err);
        this.processing = false;
      }
    });
  }

  cancelarRechazo(): void {
    this.showReasonDialog = false;
  }
  trackByPedidoId(index: number, pedido: Pedido): number | undefined {
    return pedido.Id || pedido.id;
  }
}
