import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Pedido, PedidoItem } from '../../../model/pedido.model';
import { PedidoService } from '../../../services/pedido.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../app-modal/modal.component';
import { ToastService } from '../../../services/toast.service';
import { AppCurrencyPipe } from '../../../pipes/app-currency.pipe';
import { forkJoin } from 'rxjs';
import { MaestrosService } from '../../../services/maestros.service';
import { PedidoEstadoService, TimelineStep } from '../../../services/pedido-estado.service';
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

  // HU-R1-10/11: Descarga de boleta PDF
  descargandoBoleta = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService,
    private maestrosService: MaestrosService,
    private toast: ToastService,
    public estadoSvc: PedidoEstadoService
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

  isPagoPendiente(): boolean {
    return this.pedido?.estado?.toUpperCase() === EstadoPedido.PAGO_PENDIENTE
      || this.pedido?.estado?.toUpperCase() === EstadoPedido.GENERADO;
  }

  get stepProgreso(): number {
    return this.estadoSvc.getStepProgreso(this.pedido?.estado ?? '');
  }

  isCancelledState(): boolean {
    return this.estadoSvc.isCancelledState(this.pedido?.estado ?? '');
  }

  get timelineSteps(): TimelineStep[] {
    return this.estadoSvc.timelineSteps;
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
  // Helpers visuales — delegados al PedidoEstadoService
  getEstadoVisible(estado: string): string { return this.estadoSvc.getTexto(estado); }
  getEstadoIcon(estado: string): string     { return this.estadoSvc.getIcon(estado); }
  getEstadoTheme(estado: string): string    { return this.estadoSvc.getTheme(estado); }

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

  // ── HU-R1-11: Descarga confidencial de Boleta ────────────────────────────
  /**
   * La boleta solo está disponible cuando el pago fue verificado
   * (estados post-PAGO_VERIFICADO).
   */
  puedeDescargarBoleta(): boolean {
    const estadosConBoleta = [
      EstadoPedido.PAGADO,
      EstadoPedido.VERIFICADO,
      EstadoPedido.PAGO_VERIFICADO,
      EstadoPedido.EMPAQUETADO,
      EstadoPedido.ENVIADO,
      EstadoPedido.ENTREGADO
    ];
    return estadosConBoleta.includes(this.pedido?.estado as EstadoPedido);
  }

  descargarBoleta(): void {
    const id = this.getPedidoId();
    if (!id || this.descargandoBoleta) return;

    this.descargandoBoleta = true;
    this.pedidoService.downloadInvoice(+id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `boleta-killa-${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.descargandoBoleta = false;
        this.toast.show('✅ Boleta descargada correctamente');
      },
      error: (err) => {
        this.descargandoBoleta = false;
        if (err.status === 404) {
          this.toast.show('⚠️ La boleta aún no fue generada. Inténtalo en unos minutos.');
        } else {
          this.toast.show('❌ No se pudo descargar la boleta. Inténtalo nuevamente.');
        }
      }
    });
  }
}
