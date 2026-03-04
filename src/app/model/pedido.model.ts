export interface PedidoItem {
  cuentoId: number;
  nombreCuento: string;
  imagenUrl: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  // Fallbacks para datos de API directos
  NombreCuento?: string;
  ImagenUrl?: string;
  PrecioUnitario?: number;
  Cantidad?: number;
  Subtotal?: number;
  cuento?: { titulo?: string; nombre?: string; imagenUrl?: string };
}

export interface Pedido {
  Id?: number;
  id?: number;
  fecha: string;
  nombre: string;
  correo: string;
  direccion: string;
  telefono: string;
  items: PedidoItem[];
  total: number;
  estado: string;
  tipoPago?: string;
  userId?: number;
  correoUsuario?: string;
  voucherUrl?: string;

  // Nuevos campos para checkout
  documentoTipo?: string;
  documentoNumero?: string;
  referencia?: string;
  ubicacionGps?: string;

  // Fallbacks
  Fecha?: string;
  Nombre?: string;
  Correo?: string;
  Direccion?: string;
  Telefono?: string;
  Total?: number;
  usuario?: { nombre?: string; correo?: string; email?: string; telefono?: string; direccion?: string };
}
