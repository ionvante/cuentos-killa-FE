import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cuento {
  id: number;
  titulo: string;
  autor: string;
  descripcionCorta: string;
  editorial: string;
  tipoEdicion: string;
  nroPaginas: number;
  fechaPublicacion: string;
  fechaIngreso: string;
  edadRecomendada: string;
}

@Injectable({ providedIn: 'root' })
export class CuentoService {
  private apiUrl = 'http://localhost:8080/api/cuentos'; // ajustable según tu backend

  constructor(private http: HttpClient) {}

  obtenerCuentos(): Observable<Cuento[]> {
    return this.http.get<Cuento[]>(this.apiUrl);
  }
}