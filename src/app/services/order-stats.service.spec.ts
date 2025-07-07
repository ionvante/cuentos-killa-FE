import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OrderStatsService } from './order-stats.service';
import { PedidoService } from './pedido.service';
import { Pedido } from '../model/pedido.model';

class MockPedidoService {
  constructor(private orders: Pedido[]) {}
  getOrders() { return of(this.orders); }
}

describe('OrderStatsService', () => {
  const today = new Date();
  const format = (d: Date) => d.toISOString().slice(0,10);
  const orders: Pedido[] = [
    { Id:1, id:1, fecha: format(today), nombre:'', correo:'', direccion:'', telefono:'', items:[], total:10, estado:'PAGO_PENDIENTE', userId:1, correoUsuario:'' },
    { Id:2, id:2, fecha: format(today), nombre:'', correo:'', direccion:'', telefono:'', items:[], total:20, estado:'PAGO_ENVIADO', userId:1, correoUsuario:'' },
    { Id:3, id:3, fecha: format(new Date(today.getTime()-86400000)), nombre:'', correo:'', direccion:'', telefono:'', items:[], total:15, estado:'PAGO_PENDIENTE', userId:1, correoUsuario:'' }
  ];

  let service: OrderStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderStatsService,
        { provide: PedidoService, useValue: new MockPedidoService(orders) }
      ]
    });
    service = TestBed.inject(OrderStatsService);
  });

  it('should group orders by status', (done) => {
    service.getStatusCounts().subscribe(counts => {
      expect(counts['PAGO_PENDIENTE']).toBe(2);
      expect(counts['PAGO_ENVIADO']).toBe(1);
      done();
    });
  });

  it('should count orders per day', (done) => {
    service.getOrdersByDay(2).subscribe(data => {
      expect(data.length).toBe(2);
      // first day is yesterday
      expect(data[0].count).toBe(1);
      expect(data[1].count).toBe(2);
      done();
    });
  });
});
