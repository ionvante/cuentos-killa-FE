import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cuento } from '../model/cuento.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class CuentoService {
  private apiUrl = `${environment.apiBaseUrl}/cuentos`; // ajustable según tu backend

  constructor(private http: HttpClient) {}

  obtenerCuentos(): Observable<Cuento[]> {
    return this.http.get<Cuento[]>(this.apiUrl);
  }


  getCuentoById(id: number): Observable<Cuento> {
    return this.http.get<Cuento>(`${this.apiUrl}/${id}`);

  }
}