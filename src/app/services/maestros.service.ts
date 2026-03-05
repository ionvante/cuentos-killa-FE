import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Maestro } from '../model/maestro.model';

@Injectable({
  providedIn: 'root'
})
export class MaestrosService {
  private apiUrl = `${environment.apiBaseUrl}/maestros`;
  private ubigeoUrl = `${environment.apiBaseUrl}/ubigeo`;

  constructor(private http: HttpClient) { }

  // --- MÉTODOS DE CATÁLOGO GENERAL (MAESTROS) ---

  obtenerTodosMaestros(): Observable<Maestro[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.data ?? res)
    );
  }

  obtenerMaestrosPorGrupo(grupo: string): Observable<Maestro[]> {
    return this.http.get<any>(`${this.apiUrl}/grupo/${grupo}`).pipe(
      map(res => res.data ?? res)
    );
  }

  crearMaestro(maestro: Maestro): Observable<Maestro> {
    return this.http.post<any>(this.apiUrl, maestro).pipe(
      map(res => res.data ?? res)
    );
  }

  actualizarMaestro(id: number, maestro: Maestro): Observable<Maestro> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, maestro).pipe(
      map(res => res.data ?? res)
    );
  }

  eliminarMaestro(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data ?? res)
    );
  }

  // --- MÉTODOS DE UBIGEO ---

  obtenerDepartamentos(): Observable<any[]> {
    return this.http.get<any>(`${this.ubigeoUrl}/departamentos`).pipe(
      map(res => res.data ?? res)
    );
  }

  obtenerProvincias(idDepartamento: string): Observable<any[]> {
    return this.http.get<any>(`${this.ubigeoUrl}/provincias/${idDepartamento}`).pipe(
      map(res => res.data ?? res)
    );
  }

  obtenerDistritos(idProvincia: string): Observable<any[]> {
    return this.http.get<any>(`${this.ubigeoUrl}/distritos/${idProvincia}`).pipe(
      map(res => res.data ?? res)
    );
  }
}
