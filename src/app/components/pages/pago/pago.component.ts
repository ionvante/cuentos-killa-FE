import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertBannerComponent } from '../../alert-banner/alert-banner.component';
import { VoucherComponent } from '../voucher/voucher.component';
import { PedidoService } from '../../../services/pedido.service';
import { PagoService } from '../../../services/pago.service';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [RouterModule, CommonModule, AlertBannerComponent, VoucherComponent],
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.scss']
})
export class PagoComponent implements OnInit {
  pedidoId: number = 0;
  orderStatus: string = 'PENDIENTE DE PAGO';
  mensaje: string = '';
  mensajeTipo: 'success' | 'error' | 'info' | 'warning' = 'info';
  showVoucherDialog = false;
  showMercadoModal = false;
  orderTotal = 0;
  isLoadingMercadoPago = false; // Indicador de carga al redirigir a MP
  isGuest: boolean = false; // Add property to track if order belongs to a guest
  isMercadoPagoError = false;

  /** Mapa de estados del BE a etiquetas legibles */
  private readonly statusLabels: Record<string, string> = {
    GENERADO: 'Pedido generado',
    PAGO_PENDIENTE: 'Pendiente de pago',
    PAGO_ENVIADO: 'Comprobante enviado',
    PAGADO: 'Pago verificado',
    VERIFICADO: 'Pago verificado',
    EMPAQUETADO: 'Pedido empaquetado',
    ENVIADO: 'Pedido enviado',
    ENTREGADO: 'Pedido entregado'
  };

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private pagoService: PagoService
  ) { }

  ngOnInit(): void {
    this.pedidoId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchOrderStatus();

    // Cargar el total del pedido
    this.pedidoService.getOrderById(this.pedidoId).subscribe({
      next: (pedido) => {
        this.orderTotal = pedido.total;
        this.isGuest = !pedido.userId || pedido.userId === 0;
      },
      error: (err) => console.error('Error cargando total del pedido:', err)
    });

    // Procesar callback de Mercado Pago
    this.route.queryParamMap.subscribe(params => {
      const mpStatus = params.get('status');            // 'approved', 'pending', 'failure'
      const collectionStatus = params.get('collection_status'); // más específico: 'approved'
      const externalReference = params.get('external_reference'); // nuestro orderId

      if (!mpStatus || !externalReference) return; // No es callback de MP

      const orderRef = Number(externalReference);
      if (orderRef !== this.pedidoId) return; // No corresponde a este pedido

      console.log(`Callback MP: status=${mpStatus}, collection_status=${collectionStatus}, orderId=${orderRef}`);

      if (collectionStatus === 'approved' || mpStatus === 'approved') {
        // Llamar al BE para confirmar el pago (el webhook pudo haberse procesado ya)
        this.pagoService.confirmarPagoMercadoPago(this.pedidoId).subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.mensaje = '¡Pago con Mercado Pago confirmado! Tu pedido está siendo preparado.';
              this.mensajeTipo = 'success';
            } else {
              // El webhook aún no llegó — el estado se actualizará en segundos
              this.mensaje = 'Tu pago está siendo procesado. El estado se actualizará en breve.';
              this.mensajeTipo = 'info';
            }
            this.fetchOrderStatus();
          },
          error: (err) => {
            console.error('Error confirmando pago MP:', err);
            this.mensaje = 'Hubo un error al verificar tu pago. Por favor contáctanos.';
            this.mensajeTipo = 'error';
            this.isMercadoPagoError = true;
            this.fetchOrderStatus();
          }
        });
      } else if (mpStatus === 'failure') {
        this.mensaje = 'El pago fue rechazado. Por favor intenta con otro método de pago.';
        this.mensajeTipo = 'error';
        this.isMercadoPagoError = true;
        this.fetchOrderStatus();
      } else if (mpStatus === 'pending') {
        this.mensaje = 'Tu pago está pendiente de acreditación. Te notificaremos cuando se confirme.';
        this.mensajeTipo = 'info';
        this.fetchOrderStatus();
      }
    });
  }

  fetchOrderStatus(): void {
    this.pedidoService.getOrderStatus(this.pedidoId).subscribe({
      next: ({ estado }) => {
        this.orderStatus = this.statusLabels[estado] ?? estado;
      },
      error: err => console.error('Error obteniendo estado del pedido:', err)
    });
  }

  /** Inicia el pago con Mercado Pago: pide al BE el initPoint y redirige al checkout de MP */
  pagarConMercadoPago(): void {
    this.isLoadingMercadoPago = true;
    this.mensaje = '';

    // Construir el DTO mínimo necesario para que el BE cree la preferencia
    // El BE también necesita el userId — se obtiene del token JWT en el BE
    const pedidoDTO = {
      userId: 0, // El BE lo toma del @AuthenticationPrincipal, no del body
      items: [] // El BE reconstruye los items desde el pedido guardado en BD
    };

    // Nota: como el pedido ya fue guardado en BD al hacer checkout,
    // usamos el endpoint /pay que recrea la preferencia desde el pedido existente
    this.pedidoService.getOrderById(this.pedidoId).subscribe({
      next: (pedido) => {
        this.pagoService.crearPreferenciaMercadoPago(pedido).subscribe({
          next: (response) => {
            // Redirigir al checkout de Mercado Pago
            window.location.href = response.initPoint;
          },
          error: (err) => {
            console.error('Error creando preferencia MP:', err);
            this.isLoadingMercadoPago = false;
            this.mensaje = 'No se pudo conectar con Mercado Pago. Por favor intenta de nuevo.';
            this.mensajeTipo = 'error';
            this.isMercadoPagoError = true;
          }
        });
      },
      error: (err) => {
        console.error('Error obteniendo pedido:', err);
        this.isLoadingMercadoPago = false;
        this.mensaje = 'Error al obtener los datos del pedido.';
        this.mensajeTipo = 'error';
        this.isMercadoPagoError = true;
      }
    });
  }

  openMercadoPagoModal(): void {
    this.showMercadoModal = true;
  }

  resetMercadoPago(): void {
    this.mensaje = '';
    this.isMercadoPagoError = false;
    this.isLoadingMercadoPago = false;
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
    this.orderStatus = this.statusLabels['PAGO_ENVIADO'];
    this.mensaje = 'Comprobante enviado correctamente. Lo verificaremos pronto.';
    this.mensajeTipo = 'success';
    this.fetchOrderStatus();
    this.closeVoucherDialog();
  }

  /** True cuando el pedido ya fue pagado/verificado (no mostrar botones de pago) */
  get isPaid(): boolean {
    return ['Pago verificado'].includes(this.orderStatus);
  }

  /** True cuando el comprobante fue enviado (esperando verificación manual) */
  get isPendingVerification(): boolean {
    return this.orderStatus === this.statusLabels['PAGO_ENVIADO'];
  }
}
