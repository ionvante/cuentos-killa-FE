import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../../services/pedido.service';
import { Pedido } from '../../../../model/pedido.model';

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
  voucherImg: string | null = null;
  processing = false;
  isMobile = false;

  constructor(private pedidoService: PedidoService) {}

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 600;
  }

  ngOnInit(): void {
    this.onResize();
    this.pedidoService.getOrders().subscribe({
      next: data => {
         this.pedidos = data
        //   .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        //   .slice(0, 5);
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
    this.pedidoService.getVoucher(id).subscribe({
      next: blob => {
        this.voucherImg = URL.createObjectURL(blob);
      },
      error: err => console.error('Error fetching voucher', err)
    });
  }

  cerrarModal(): void {
    if (this.voucherImg) {
      URL.revokeObjectURL(this.voucherImg);
    }
    this.selectedPedido = null;
    this.voucherImg = null;
    this.processing = false;
  }

  validarPago(): void {
    if (!this.selectedPedido) return;
    this.processing = true;
    const id = this.selectedPedido.Id || this.selectedPedido.id || 0;
    this.pedidoService.validateVoucher(id).subscribe({
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
    const motivo = prompt('Motivo de rechazo (opcional)') || '';
    this.processing = true;
    const id = this.selectedPedido.Id || this.selectedPedido.id || 0;
    this.pedidoService.rejectVoucher(id, motivo).subscribe({
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
}
