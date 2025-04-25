import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cuento } from '../model/cuento.model';


@Injectable({ providedIn: 'root' })
export class CuentoService {
  private apiUrl = 'http://localhost:8080/api/cuentos'; // ajustable según tu backend

  constructor(private http: HttpClient) {}

  obtenerCuentos(): Observable<Cuento[]> {
    return this.http.get<Cuento[]>(this.apiUrl);
  }


  getCuentoById(id: number): Observable<Cuento> {
    return this.http.get<Cuento>(`${this.apiUrl}/${id}`);

  }
}