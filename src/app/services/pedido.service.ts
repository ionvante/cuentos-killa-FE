import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pedido } from '../model/pedido.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = 'http://localhost:8080/api/orders'; // cambia si es producción

  constructor(private http: HttpClient) {}

  registrarPedido(pedido: Pedido): Observable<any> {
    return this.http.post(this.apiUrl, pedido);
  }

  uploadVoucher(pedidoId: number, voucherFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('voucherFile', voucherFile);
    return this.http.post(`${this.apiUrl}/${pedidoId}/voucher`, formData);
  }

  getOrderStatus(pedidoId: number): Observable<{ estado: string }> {
    return this.http.get<{ estado: string }>(`${this.apiUrl}/${pedidoId}/status`);
  }
}
