import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PedidoService } from './pedido.service';
import { Pedido } from '../model/pedido.model';

interface OrdersPerDay {
  date: string;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderStatsService {
  constructor(private pedidoService: PedidoService) {}

  /** Counts orders grouped by their "estado" field */
  getStatusCounts(): Observable<Record<string, number>> {
    return this.pedidoService.getOrders().pipe(
      map(orders => orders.reduce((acc: Record<string, number>, o: Pedido) => {
        const estado = o.estado;
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {}))
    );
  }

  /** Returns the number of orders for each of the last `days` days */
  getOrdersByDay(days: number): Observable<OrdersPerDay[]> {
    return this.pedidoService.getOrders().pipe(
      map(orders => {
        const today = new Date();
        const results: OrdersPerDay[] = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().slice(0, 10);
          const count = orders.filter(o => (o.fecha ?? '').slice(0, 10) === dateStr).length;
          results.push({ date: dateStr, count });
        }
        return results;
      })
    );
  }
}
