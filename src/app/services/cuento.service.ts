import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cuento } from '../model/cuento.model';
import { Page } from '../model/page.model';
import { environment } from '../../environments/environment';

export interface CuentoSearchParams {
  q?: string;
  categoria?: string;
  edad?: string;
  precioMin?: number;
  precioMax?: number;
  page?: number;
  size?: number;
  sortBy?: string;
}

@Injectable({ providedIn: 'root' })
export class CuentoService {
  private apiUrl = `${environment.apiBaseUrl}/cuentos`;

  constructor(private http: HttpClient) { }

  obtenerCuentos(): Observable<Cuento[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.data ?? res)
    );
  }

  obtenerCuentosPaginados(page: number = 0, size: number = 10): Observable<Page<Cuento>> {
    return this.http.get<any>(`${this.apiUrl}/page?page=${page}&size=${size}`).pipe(
      map(res => res.data ?? res)
    );
  }

  /**
   * RM-01: Búsqueda server-side con filtros opcionales.
   * Llama a GET /cuentos/search con los params que vengan non-null.
   */
  buscarCuentos(params: CuentoSearchParams = {}): Observable<Page<Cuento>> {
    let httpParams = new HttpParams();
    if (params.q)          httpParams = httpParams.set('q', params.q);
    if (params.categoria)  httpParams = httpParams.set('categoria', params.categoria);
    if (params.edad)       httpParams = httpParams.set('edad', params.edad);
    if (params.precioMin != null) httpParams = httpParams.set('precioMin', params.precioMin);
    if (params.precioMax != null) httpParams = httpParams.set('precioMax', params.precioMax);
    httpParams = httpParams
      .set('page', params.page ?? 0)
      .set('size', params.size ?? 20)
      .set('sortBy', params.sortBy ?? 'fechaIngreso');
    return this.http.get<any>(`${this.apiUrl}/search`, { params: httpParams }).pipe(
      map(res => res.data ?? res)
    );
  }

  getCuentoById(id: number): Observable<Cuento> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data ?? res)
    );
  }

  crearCuento(cuentoData: Partial<Cuento>, file?: File): Observable<Cuento> {
    const formData = new FormData();
    formData.append('cuento', new Blob([JSON.stringify(cuentoData)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<any>(this.apiUrl, formData).pipe(
      map(res => res.data ?? res)
    );
  }

  actualizarCuento(id: number, cuentoData: Partial<Cuento>, file?: File): Observable<Cuento> {
    const formData = new FormData();
    formData.append('cuento', new Blob([JSON.stringify(cuentoData)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData).pipe(
      map(res => res.data ?? res)
    );
  }

  deshabilitarCuento(id: number, habilitado: boolean): Observable<Cuento> {
    return this.http.put<any>(`${this.apiUrl}/${id}/estado`, { habilitado }).pipe(
      map(res => res.data ?? res)
    );
  }
}