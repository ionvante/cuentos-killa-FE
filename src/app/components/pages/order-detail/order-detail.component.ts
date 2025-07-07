import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pedido, PedidoItem } from '../../../model/pedido.model';
import { PedidoService } from '../../../services/pedido.service';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { LazyLoadImageDirective } from '../../../directives/lazy-load-image.directive';
import { ToastService } from '../../../services/toast.service';
import { VoucherComponent } from '../voucher/voucher.component';

@Component({
  selector: 'app-order-detail',
  standalone: true, // Ensure standalone is true
  imports: [CommonModule, LazyLoadImageDirective, VoucherComponent],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  pedido: Pedido|null =null;
  isLoading: boolean = true;
  errorMensaje: string | null = null;
  showVoucherDialog = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const pedidoId = +idParam; // Convert string to number
      this.pedidoService.getOrderById(pedidoId).subscribe({
        next: (data) => {
          // this.pedido = data;
          this.pedido = { ...data, items: data.items ?? [] };
          console.log('Detalle del pedido:', this.pedido);
          this.isLoading = false;
        },
        error: (err) => {
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
    return this.pedido?.estado?.toUpperCase() === 'PAGO_PENDIENTE' ;
  }

  openVoucherDialog(): void {
    this.showVoucherDialog = true;
  }

  closeVoucherDialog(): void {
    this.showVoucherDialog = false;
  }

  onVoucherUploaded(): void {
    if (this.pedido) {
      this.pedido.estado = 'PAGO_ENVIADO';
    }
    this.toast.show('Voucher enviado correctamente', 'success');
    this.closeVoucherDialog();
  }
}
