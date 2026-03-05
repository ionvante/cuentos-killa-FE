import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DireccionService {
    private apiUrl = `${environment.apiBaseUrl}/direcciones`;

    constructor(private http: HttpClient) { }

    obtenerPorUsuario(usuarioId: number): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/usuario/${usuarioId}`).pipe(
            map(res => res.data ?? res)
        );
    }

    guardar(direccion: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, direccion).pipe(
            map(res => res.data ?? res)
        );
    }

    actualizar(id: number, direccion: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, direccion).pipe(
            map(res => res.data ?? res)
        );
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
            map(res => res.data ?? res)
        );
    }
}
