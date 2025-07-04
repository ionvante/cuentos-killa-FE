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
  selectedFile: File | null = null;
  orderStatus: string = 'PENDIENTE DE PAGO'; // Default status
  nombreArchivo: string = '';
  mensaje: string = '';
  mensajeTipo: 'success' | 'error' | 'info' | '' = '';
  isUploading = false;
  previewUrl: string | null = null;
  isImage = false;
  isPdf = false;
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


  pagarConMercadoPagoConfirmado(): void {
    window.location.href = `${environment.apiBaseUrl}/mercado-pago/pagar/${this.pedidoId}`;
  }

  openMercadoPagoModal(): void {
    this.showMercadoModal = true;
  }

  closeMercadoPagoModal(): void {
    this.showMercadoModal = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf'
      ];
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(extension)) {
        this.mensaje = 'Formato no permitido';
        this.mensajeTipo = 'error';
        this.selectedFile = null;
        this.nombreArchivo = '';
        this.previewUrl = null;
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.mensaje = 'El archivo supera los 5 MB';
        this.mensajeTipo = 'error';
        this.selectedFile = null;
        this.nombreArchivo = '';
        this.previewUrl = null;
        return;
      }

      this.selectedFile = file;
      this.nombreArchivo = file.name;
      this.mensaje = '';

      if (file.type.startsWith('image/')) {
        this.isImage = true;
        this.isPdf = false;
        const reader = new FileReader();
        reader.onload = (e: any) => (this.previewUrl = e.target.result);
        reader.readAsDataURL(file);
      } else {
        this.isImage = false;
        this.isPdf = true;
        this.previewUrl = 'pdf';
      }
    } else {
      this.selectedFile = null;
      this.nombreArchivo = '';
      this.previewUrl = null;
    }
  }

  uploadVoucher(): void {
    if (!this.selectedFile) {
      this.mensaje = 'Por favor, selecciona un archivo de voucher.';
      this.mensajeTipo = 'error';
      return;
    }

    this.isUploading = true;
    this.pedidoService.uploadVoucher(this.pedidoId, this.selectedFile).subscribe({
      next: () => {
        this.orderStatus = 'Confirmación de Pago Enviada';
        this.mensaje = 'Voucher subido exitosamente. El estado del pedido se actualizará en breve.';
        this.mensajeTipo = 'success';
        this.fetchOrderStatus();
      },
      error: (error) => {
        console.error('Error uploading voucher:', error);
        this.mensaje = 'Error al subir el voucher. Por favor, inténtalo de nuevo.';
        this.mensajeTipo = 'error';
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }
}
