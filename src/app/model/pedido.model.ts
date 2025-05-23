export interface PedidoItem {
  nombreCuento: string;
  imagenUrl: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  fecha: string; // O Date, dependiendo de la API
  nombre: string;
  correo: string;
  direccion: string;
  telefono: string;
  items: PedidoItem[];
  total: number;
  estado: string; // ejemplo: 'PAGO PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO'
  userId: number;
  correoUsuario: string;
}