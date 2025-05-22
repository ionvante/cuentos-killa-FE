import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../services/pedido.service';

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

  constructor(private route: ActivatedRoute, private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.pedidoId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchOrderStatus();
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
}
