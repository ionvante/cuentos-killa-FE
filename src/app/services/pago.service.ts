import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
   * El BE guarda el pedido en BD y devuelve el initPoint (URL de checkout de MP).
   * El pedidoDTO debe contener los items y el userId del usuario autenticado.
   */
  crearPreferenciaMercadoPago(pedidoDTO: any): Observable<MercadoPagoPreferenceResponse> {
    return this.http.post<MercadoPagoPreferenceResponse>(
      `${this.apiUrl}/mercadopago/create-preference`,
      pedidoDTO
    );
  }

  /**
   * Confirma el estado del pago tras el redirect de Mercado Pago.
   * El BE consulta el estado actual del pedido en BD.
   * Si el webhook de MP ya se procesó → status: 'success'
   * Si el webhook aún no llegó → status: 'pending'
   */
  confirmarPagoMercadoPago(pedidoId: number): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(
      `${this.apiUrl}/${pedidoId}/confirmar-pago-mercadopago`,
      {}
    );
  }
}
