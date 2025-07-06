import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pedido } from '../model/pedido.model';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = `${environment.apiBaseUrl}/orders`; // cambia si es producción

  constructor(private http: HttpClient) {}

  registrarPedido(pedido: Pedido): Observable<any> {
    return this.http.post(this.apiUrl, pedido);
  }

  uploadVoucher(pedidoId: number, voucherFile: File): Observable<any> {
    const formData = new FormData();
    // Backend expects these specific field names
    formData.append('file', voucherFile);
    formData.append('idpedido', pedidoId.toString());
    return this.http.post(`${this.apiUrl}/${pedidoId}/voucher`, formData,{ withCredentials: true });
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

  getVoucher(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/voucher`, {
      responseType: 'blob',
      withCredentials: true
    });
  }

  validateVoucher(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/validate-voucher`, {}, { withCredentials: true });
  }

  rejectVoucher(id: number, motivo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reject-voucher`, { motivo }, { withCredentials: true });
  }
}
