export interface PedidoItem {
    cuentoId: number;
    cantidad: number;
  }
  
  export interface Pedido {
    nombre: string;
    correo: string;
    direccion: string;
    telefono: string;
    items: PedidoItem[];
    total: number;
    estado: string; // ejemplo: 'PAGO PENDIENTE'
  }
  