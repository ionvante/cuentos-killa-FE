import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private apiUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) { }

  confirmarPagoMercadoPago(pedidoId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${pedidoId}/confirmar-pago-mercadopago`, {});
  }
}
