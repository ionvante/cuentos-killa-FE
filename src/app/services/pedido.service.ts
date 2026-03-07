import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pedido } from '../model/pedido.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { ApiResponse } from '../model/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) { }

  registrarPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.post<any>(this.apiUrl, pedido).pipe(
      map(res => res.data ?? res)
    );
  }

  uploadVoucher(pedidoId: number, voucherFile: File): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('file', voucherFile);
    formData.append('idpedido', pedidoId.toString());
    return this.http.post<any>(`${this.apiUrl}/${pedidoId}/voucherF`, formData, { withCredentials: true }).pipe(
      map(res => res.data ?? res)
    );
  }

  getOrderStatus(pedidoId: number): Observable<{ estado: string }> {
    return this.http.get<any>(`${this.apiUrl}/${pedidoId}/status`).pipe(
      map(res => res.data ?? res)
    );
  }

  getOrders(): Observable<Pedido[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.data ?? res)
    );
  }

  getOrderById(id: number): Observable<Pedido> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data ?? res)
    );
  }

  downloadInvoice(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  /** Obtiene la URL del voucher asociado al pedido */
  getVoucherUrl(id: number): Observable<string> {
    const pedidosUrl = `${environment.apiBaseUrl}/pedidos`;
    return this.http.get<any>(`${pedidosUrl}/${id}/voucher-url`, {
      withCredentials: true
    }).pipe(
      map(res => {
        const data = res.data ?? res;
        return typeof data === 'string' ? data : data.url ?? data;
      })
    );
  }

  /**
   * Actualiza el estado del pedido. Opcionalmente se puede enviar un motivo
   * en caso de que el estado sea de rechazo.
   */
  updateOrderStatus(id: number, estado: string, motivo?: string): Observable<ApiResponse> {
    return this.http.patch<any>(
      `${this.apiUrl}/${id}/status`,
      { estado, motivo },
      { withCredentials: true }
    ).pipe(
      map(res => res.data ?? res)
    );
  }
}
