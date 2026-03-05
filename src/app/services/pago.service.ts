import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PagoResponse } from '../model/pago-response.model';

export interface MercadoPagoPreferenceResponse {
  initPoint: string;  // URL del checkout de Mercado Pago
  orderId: number;    // ID del pedido guardado en BD
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private apiUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) { }

  /**
   * Llama al BE para crear la preferencia de pago en Mercado Pago.
   */
  crearPreferenciaMercadoPago(pedidoDTO: any): Observable<MercadoPagoPreferenceResponse> {
    return this.http.post<any>(
      `${this.apiUrl}/mercadopago/create-preference`,
      pedidoDTO
    ).pipe(
      map(res => res.data ?? res)
    );
  }

  /**
   * Confirma el estado del pago tras el redirect de Mercado Pago.
   */
  confirmarPagoMercadoPago(pedidoId: number): Observable<PagoResponse> {
    return this.http.post<any>(
      `${this.apiUrl}/${pedidoId}/confirmar-pago-mercadopago`,
      {}
    ).pipe(
      map(res => res.data ?? res)
    );
  }
}
