export interface PedidoItem {
  cuentoId: number;
  nombreCuento: string;
  imagenUrl: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  /** Identificador único del pedido. El backend puede devolverlo como
   *  `Id` o `id`, por lo que ambos campos se mantienen para compatibilidad. */
  Id?: number;
  id?: number;
  fecha: string; // O Date, dependiendo de la API
  nombre: string;
  correo: string;
  direccion: string;
  telefono: string;
  items: PedidoItem[];
  total: number;
  estado: string; // ejemplo: 'PAGO_PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO'
  tipoPago?: string;
  userId: number;
  correoUsuario: string;
  voucherUrl?: string;
}
