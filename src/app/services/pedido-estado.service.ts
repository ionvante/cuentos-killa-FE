import { Injectable } from '@angular/core';
import { EstadoPedido } from '../model/estado-pedido.enum';

export interface EstadoInfo {
  texto: string;        // Texto amigable para mostrar al usuario
  icon: string;         // Material Icon
  theme: string;        // Clase CSS de tema de color
  cornerIcon: string;   // Ícono decorativo de la tarjeta
  descripcion: string;  // Descripción del paso en el timeline
}

export interface TimelineStep {
  estado: EstadoPedido;
  icon: string;
  label: string;
  descripcion: string;
  step: number;         // Número de progreso (1-5), 0 para estados de cancelación/error
}

/**
 * Servicio centralizado de estados de pedido.
 * Fuente única de verdad para textos, íconos, temas y progreso del timeline.
 * Elimina la duplicación entre order-list y order-detail.
 */
@Injectable({ providedIn: 'root' })
export class PedidoEstadoService {

  private readonly estadoMap: Record<string, EstadoInfo> = {
    [EstadoPedido.GENERADO]: {
      texto: 'Pedido creado',
      icon: 'receipt_long',
      theme: 'pendiente',
      cornerIcon: 'menu_book',
      descripcion: 'Tu pedido fue registrado exitosamente.'
    },
    [EstadoPedido.PAGO_PENDIENTE]: {
      texto: 'Pago pendiente',
      icon: 'local_mall',
      theme: 'pendiente',
      cornerIcon: 'menu_book',
      descripcion: 'Esperando que completes el pago.'
    },
    [EstadoPedido.PAGO_ENVIADO]: {
      texto: 'Voucher enviado',
      icon: 'sync',
      theme: 'enviado',
      cornerIcon: 'pending_actions',
      descripcion: 'Recibimos tu comprobante. Estamos verificando el pago.'
    },
    [EstadoPedido.PAGADO]: {
      texto: 'Pago confirmado',
      icon: 'verified',
      theme: 'verificado',
      cornerIcon: 'check_circle',
      descripcion: 'Tu pago fue procesado correctamente.'
    },
    [EstadoPedido.VERIFICADO]: {
      texto: 'Pago verificado',
      icon: 'verified',
      theme: 'verificado',
      cornerIcon: 'check_circle',
      descripcion: 'El pago fue verificado por nuestro equipo.'
    },
    [EstadoPedido.PAGO_VERIFICADO]: {
      texto: 'Pago verificado',
      icon: 'verified',
      theme: 'verificado',
      cornerIcon: 'check_circle',
      descripcion: 'El pago fue confirmado. ¡Estamos preparando tu pedido!'
    },
    [EstadoPedido.EMPAQUETADO]: {
      texto: 'En preparación',
      icon: 'inventory_2',
      theme: 'empaquetado',
      cornerIcon: 'auto_stories',
      descripcion: 'Tu pedido está siendo empaquetado con cariño.'
    },
    [EstadoPedido.ENVIADO]: {
      texto: 'En camino',
      icon: 'local_shipping',
      theme: 'encamino',
      cornerIcon: 'toys',
      descripcion: 'Tu pedido está en camino. ¡Pronto llegará!'
    },
    [EstadoPedido.ENTREGADO]: {
      texto: 'Entregado',
      icon: 'check_circle',
      theme: 'entregado',
      cornerIcon: 'auto_stories',
      descripcion: '¡Tu pedido llegó! Esperamos que disfrutes la historia.'
    },
    [EstadoPedido.CANCELADO]: {
      texto: 'Cancelado',
      icon: 'cancel',
      theme: 'cancelado',
      cornerIcon: 'close',
      descripcion: 'Este pedido fue cancelado.'
    },
    [EstadoPedido.PAGO_RECHAZADO]: {
      texto: 'Pago rechazado',
      icon: 'cancel',
      theme: 'cancelado',
      cornerIcon: 'close',
      descripcion: 'El pago fue rechazado. Puedes intentar nuevamente.'
    },
  };

  /** Pasos del timeline (flujo principal, sin estados de error) */
  readonly timelineSteps: TimelineStep[] = [
    { estado: EstadoPedido.PAGO_PENDIENTE, icon: 'receipt_long', label: 'Pedido creado', descripcion: 'Tu pedido fue registrado.', step: 1 },
    { estado: EstadoPedido.PAGO_VERIFICADO, icon: 'verified', label: 'Pago confirmado', descripcion: 'El pago fue confirmado exitosamente.', step: 2 },
    { estado: EstadoPedido.EMPAQUETADO, icon: 'inventory_2', label: 'En preparación', descripcion: 'Estamos empaquetando tu pedido.', step: 3 },
    { estado: EstadoPedido.ENVIADO, icon: 'local_shipping', label: 'En camino', descripcion: 'Tu cuento está en camino.', step: 4 },
    { estado: EstadoPedido.ENTREGADO, icon: 'check_circle', label: 'Entregado', descripcion: '¡Llegó tu cuento!', step: 5 },
  ];

  getInfo(estado: string): EstadoInfo {
    return this.estadoMap[estado] ?? {
      texto: estado,
      icon: 'info',
      theme: 'default',
      cornerIcon: 'star',
      descripcion: ''
    };
  }

  getTexto(estado: string): string {
    return this.getInfo(estado).texto;
  }

  getIcon(estado: string): string {
    return this.getInfo(estado).icon;
  }

  getTheme(estado: string): string {
    return this.getInfo(estado).theme;
  }

  getCornerIcon(estado: string): string {
    return this.getInfo(estado).cornerIcon;
  }

  getDescripcion(estado: string): string {
    return this.getInfo(estado).descripcion;
  }

  /**
   * Retorna el número de paso activo en el timeline (1-5).
   * Los estados GENERADO / PAGO_ENVIADO son parte del paso 1.
   * Los estados de cancelación retornan 0.
   */
  getStepProgreso(estado: string): number {
    switch (estado) {
      case EstadoPedido.GENERADO:
      case EstadoPedido.PAGO_PENDIENTE:
      case EstadoPedido.PAGO_ENVIADO:
        return 1;
      case EstadoPedido.PAGADO:
      case EstadoPedido.VERIFICADO:
      case EstadoPedido.PAGO_VERIFICADO:
        return 2;
      case EstadoPedido.EMPAQUETADO:
        return 3;
      case EstadoPedido.ENVIADO:
        return 4;
      case EstadoPedido.ENTREGADO:
        return 5;
      default:
        return 0; // CANCELADO / PAGO_RECHAZADO
    }
  }

  isCancelledState(estado: string): boolean {
    return estado === EstadoPedido.CANCELADO || estado === EstadoPedido.PAGO_RECHAZADO;
  }
}
