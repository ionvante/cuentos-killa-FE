export enum EstadoPedido {
  // Estados del ciclo de vida del pedido (sincronizados con OrderStatus.java del backend)
  GENERADO = 'GENERADO',            // Pedido creado, aún sin pago
  PAGO_PENDIENTE = 'PAGO_PENDIENTE', // Esperando que el usuario pague
  PAGO_ENVIADO = 'PAGO_ENVIADO',    // Voucher enviado, a la espera de verificación manual
  PAGADO = 'PAGADO',                // Pago confirmado por MP (webhook) - alias de PAGO_VERIFICADO en algunos flujos
  VERIFICADO = 'VERIFICADO',        // Verificado manualmente por admin - alias legacy
  PAGO_VERIFICADO = 'PAGO_VERIFICADO', // Estado principal de pago confirmado
  EMPAQUETADO = 'EMPAQUETADO',      // Pedido en preparación
  ENVIADO = 'ENVIADO',              // Pedido despachado al courier
  ENTREGADO = 'ENTREGADO',          // Pedido recibido por el cliente
  CANCELADO = 'CANCELADO',          // Pedido cancelado
  PAGO_RECHAZADO = 'PAGO_RECHAZADO' // Pago rechazado por MP
}
