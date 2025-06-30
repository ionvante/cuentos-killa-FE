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

  // POST: /api/cuentos
  crearCuento(cuentoData: Partial<Cuento>): Observable<Cuento> {
    // El backend ahora espera un JSON con los datos del cuento.
    return this.http.post<Cuento>(this.apiUrl, cuentoData);
  }

  // PUT: /api/cuentos/{id}
  actualizarCuento(id: number, cuentoData: Partial<Cuento>): Observable<Cuento> {
    return this.http.put<Cuento>(`${this.apiUrl}/${id}`, cuentoData);
  }

  // PUT: /api/cuentos/{id}/deshabilitar (o similar, podría ser un PATCH o PUT al recurso principal)
  // Asumimos que el backend espera un body para cambiar el estado o simplemente la acción en la URL.
  // Si el backend solo cambia el estado basado en la ruta y no devuelve el cuento actualizado:
  // deshabilitarCuento(id: number): Observable<void>
  // Si devuelve el cuento actualizado:
  deshabilitarCuento(id: number, habilitado: boolean): Observable<Cuento> {
    // El backend podría esperar un cuerpo como { habilitado: false }
    // O, si la ruta es específica como /deshabilitar o /habilitar, el cuerpo podría no ser necesario o ser diferente.
    // Para este ejemplo, asumimos que enviamos el nuevo estado.
    // El endpoint exacto y el payload dependen de la implementación del backend.
    // Una opción común es PATCH con el campo a actualizar: PATCH /api/cuentos/{id} body: { habilitado: false }
    // Otra es PUT a un subrecurso: PUT /api/cuentos/{id}/estado body: { habilitado: false }
    // Por ahora, usaré un PUT al ID con el cuerpo indicando el nuevo estado.
    return this.http.put<Cuento>(`${this.apiUrl}/${id}/estado`, { habilitado });
  }

  // Alternativamente, si la deshabilitación es una operación DELETE (Hard Delete)
  // eliminarCuento(id: number): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${id}`);
  // }
}