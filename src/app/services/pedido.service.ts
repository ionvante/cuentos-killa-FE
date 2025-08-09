import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pedido } from '../model/pedido.model';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';
import { ApiResponse } from '../model/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = `${environment.apiBaseUrl}/orders`; // cambia si es producción

  constructor(private http: HttpClient) {}

  registrarPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido);
  }

  uploadVoucher(pedidoId: number, voucherFile: File): Observable<ApiResponse> {
    const formData = new FormData();
    // Backend expects these specific field names
    formData.append('file', voucherFile);
    formData.append('idpedido', pedidoId.toString());
    return this.http.post<ApiResponse>(`${this.apiUrl}/${pedidoId}/voucherF`, formData,{ withCredentials: true });
  }

  getOrderStatus(pedidoId: number): Observable<{ estado: string }> {
    return this.http.get<{ estado: string }>(`${this.apiUrl}/${pedidoId}/status`);
  }

  getOrders(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  getOrderById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  downloadInvoice(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  /** Obtiene la URL del voucher asociado al pedido */
  getVoucherUrl(id: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/${id}/voucher-url`, {
      responseType: 'text',
      withCredentials: true
    });
  }

  /**
   * Actualiza el estado del pedido. Opcionalmente se puede enviar un motivo
   * en caso de que el estado sea de rechazo.
   */
  updateOrderStatus(id: number, estado: string, motivo?: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(
      `${this.apiUrl}/${id}/status`,
      { estado, motivo },
      { withCredentials: true }
    );
  }
}
