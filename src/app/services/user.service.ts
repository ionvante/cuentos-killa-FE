import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../model/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) { }

  obtenerUsuarios(): Observable<User[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.data ?? res)
    );
  }

  cambiarEstado(id: number, habilitado: boolean): Observable<User> {
    return this.http.put<any>(`${this.apiUrl}/${id}/estado`, { habilitado }, { withCredentials: true }).pipe(
      map(res => res.data ?? res)
    );
  }

  convertirEnAdmin(id: number): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/${id}/make-admin`, {}, { withCredentials: true }).pipe(
      map(res => res.data ?? res)
    );
  }
}
