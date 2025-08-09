import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PagoResponse } from '../model/pago-response.model';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private apiUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) { }

  confirmarPagoMercadoPago(pedidoId: number): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.apiUrl}/${pedidoId}/confirmar-pago-mercadopago`, {});
  }
}
