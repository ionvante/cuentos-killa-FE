export interface PedidoItem {
  cuentoId:number;
  nombreCuento: string;
  imagenUrl: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  Id: number;
  fecha: string; // O Date, dependiendo de la API
  nombre: string;
  correo: string;
  direccion: string;
  telefono: string;
  items: PedidoItem[];
  total: number;
  estado: string; // ejemplo: 'PAGO_PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO'
  userId: number;
  correoUsuario: string;
}