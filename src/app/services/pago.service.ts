import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) { }

  confirmarPagoMercadoPago(pedidoId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${pedidoId}/confirmar-pago-mercadopago`, {});
  }
}
