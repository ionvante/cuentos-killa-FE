import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../services/pedido.service';
import { PagoService } from '../../../services/pago.service'; // Added PagoService import

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.scss'
})
export class PagoComponent implements OnInit {
  pedidoId: number = 0;
  selectedFile: File | null = null;
  orderStatus: string = 'PENDIENTE DE PAGO'; // Default status
  nombreArchivo: string = '';

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private pagoService: PagoService // Injected PagoService
  ) {}

  ngOnInit(): void {
    // Get pedidoId from route params
    this.pedidoId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchOrderStatus(); // Initial status fetch

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
        this.pagoService.confirmarPagoMercadoPago(this.pedidoId).subscribe(
          response => {
            console.log('Payment confirmation successful:', response);
            this.orderStatus = 'Pago Verificado';
            alert('¡Pago con Mercado Pago confirmado exitosamente! Estado del pedido actualizado a Pago Verificado.');
            // Optionally, re-fetch to ensure consistency, though direct update is good for UI
            this.fetchOrderStatus(); 
          },
          error => {
            console.error('Error confirming Mercado Pago payment:', error);
            alert('Error al confirmar el pago con Mercado Pago. Por favor, contacta a soporte.');
            // Potentially fetch status again to see if it was processed despite error, or leave as is
            this.fetchOrderStatus();
          }
        );
      } else if (paymentStatus && paymentStatus !== 'approved' && externalReference && Number(externalReference) === this.pedidoId) {
        // Handle cases like 'pending', 'rejected', etc.
        console.log(`Mercado Pago payment status for order ${this.pedidoId}: ${paymentStatus}`);
        alert(`El pago con Mercado Pago está ${paymentStatus}.`);
        // We might still want to fetch the order status from our backend
        this.fetchOrderStatus();
      }
    });
  }

  fetchOrderStatus(): void {
    this.pedidoService.getOrderStatus(this.pedidoId).subscribe(
      response => {
        this.orderStatus = response.estado;
      },
      error => {
        console.error('Error fetching order status:', error);
      }
    );
  }

  onVoucherSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  uploadVoucher(): void {
    if (!this.selectedFile) {
      alert('Por favor, selecciona un archivo de voucher.');
      return;
    }

    this.pedidoService.uploadVoucher(this.pedidoId, this.selectedFile).subscribe(
      response => {
        // Assuming the backend might not immediately return the final "Pago Verificado" status,
        // so setting a general confirmation message and then refreshing.
        this.orderStatus = "Confirmación de Pago Enviada"; // Temporary status
        alert('Voucher subido exitosamente. El estado del pedido se actualizará en breve.');
        this.fetchOrderStatus(); // Refresh order status from backend
      },
      error => {
        console.error('Error uploading voucher:', error);
        alert('Error al subir el voucher. Por favor, inténtalo de nuevo.');
      }
    );
  }

  pagarConMercadoPago(): void {
    // Redirige o llama al backend para generar link de MercadoPago
    window.location.href = `http://localhost:8080/api/mercado-pago/pagar/${this.pedidoId}`;
  }


  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.nombreArchivo = input.files[0].name;
    // Aquí podrías almacenar el archivo en una variable para enviarlo al backend luego
  }
}
}
