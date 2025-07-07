import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiBaseUrl}/user`;

  constructor(private http: HttpClient) {}

  obtenerUsuarios(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/usuarios`);
  }

  cambiarEstado(id: number, habilitado: boolean): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/estado`, { habilitado }, { withCredentials: true });
  }

  convertirEnAdmin(id: number): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${id}/make-admin`, {}, { withCredentials: true });
  }
}
