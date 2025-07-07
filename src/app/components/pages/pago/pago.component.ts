import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertBannerComponent } from '../../alert-banner/alert-banner.component';
import { PedidoService } from '../../../services/pedido.service';
import { PagoService } from '../../../services/pago.service'; // Added PagoService import
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [RouterModule, CommonModule, AlertBannerComponent],
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.scss']
})
export class PagoComponent implements OnInit {
  pedidoId: number = 0;
  orderStatus: string = 'PENDIENTE DE PAGO'; // Default status
  mensaje: string = '';
  mensajeTipo: 'success' | 'error' | 'info' | 'warning' = 'info';
  showVoucherDialog = false;
  showMercadoModal = false;
  orderTotal = 0;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private pagoService: PagoService // Injected PagoService
  ) {}

  ngOnInit(): void {
    // Get pedidoId from route params
    this.pedidoId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchOrderStatus(); // Initial status fetch
    this.pedidoService.getOrderById(this.pedidoId).subscribe({
      next: (pedido) => {
        this.orderTotal = pedido.total;
      },
      error: (err) => console.error('Error fetching order detail:', err)
    });

    // Check for Mercado Pago callback query parameters
    this.route.queryParamMap.subscribe(params => {
      const paymentStatus = params.get('status'); // Mercado Pago uses 'status'
      const externalReference = params.get('external_reference');
      const collectionStatus = params.get('collection_status'); // More specific status

      console.log('Mercado Pago callback params:', { paymentStatus, externalReference, collectionStatus, pedidoId: this.pedidoId });

      // It's common for external_reference to be the order ID.
      // Mercado Pago status 'approved' usually means success.
      if (collectionStatus === 'approved' && externalReference && Number(externalReference) === this.pedidoId) {
        console.log(`Attempting to confirm Mercado Pago payment for order ${this.pedidoId}`);
        this.pagoService.confirmarPagoMercadoPago(this.pedidoId).subscribe({
          next: () => {
            console.log('Payment confirmation successful');
            this.orderStatus = 'Pago Verificado';
            this.mensaje = '¡Pago con Mercado Pago confirmado exitosamente! Estado del pedido actualizado a Pago Verificado.';
            this.mensajeTipo = 'success';
            this.fetchOrderStatus();
          },
          error: (error) => {
            console.error('Error confirming Mercado Pago payment:', error);
            this.mensaje = 'Error al confirmar el pago con Mercado Pago. Por favor, contacta a soporte.';
            this.mensajeTipo = 'error';
            this.fetchOrderStatus();
          }
        });
      } else if (paymentStatus && paymentStatus !== 'approved' && externalReference && Number(externalReference) === this.pedidoId) {
        // Handle cases like 'pending', 'rejected', etc.
        console.log(`Mercado Pago payment status for order ${this.pedidoId}: ${paymentStatus}`);
        this.mensaje = `El pago con Mercado Pago está ${paymentStatus}.`;
        this.mensajeTipo = 'info';
        this.fetchOrderStatus();
      }
    });
  }
  private statusLabels: Record<string,string> = {
  GENERADO:        'Pedido generado',
  PAGO_PENDIENTE:  'PENDIENTE DE PAGO',
  PAGO_VERIFICADO: 'Pago verificado',
  ENVIADO:         'Pedido enviado',
  ENTREGADO:       'Pedido entregado'
};
fetchOrderStatus(): void {
  this.pedidoService.getOrderStatus(this.pedidoId)
    .subscribe({
      next: ({ estado }) => {
        // Si tienes una etiqueta para ese estado, úsala; si no, muestra el valor crudo
        this.orderStatus = this.statusLabels[estado] ?? estado;
      },
      error: err => console.error('Error fetching order status:', err)
    });
}

  pagarConMercadoPagoConfirmado(): void {
    window.location.href = `${environment.apiBaseUrl}/mercado-pago/pagar/${this.pedidoId}`;
  }

  openMercadoPagoModal(): void {
    this.showMercadoModal = true;
  }

  closeMercadoPagoModal(): void {
    this.showMercadoModal = false;
  }

  openVoucherDialog(): void {
    this.showVoucherDialog = true;
  }

  closeVoucherDialog(): void {
    this.showVoucherDialog = false;
  }

  onVoucherUploaded(): void {
    this.orderStatus = 'PAGO_ENVIADO';
    this.mensaje = 'Voucher enviado correctamente';
    this.mensajeTipo = 'success';
    this.fetchOrderStatus();
    this.closeVoucherDialog();
  }
}
