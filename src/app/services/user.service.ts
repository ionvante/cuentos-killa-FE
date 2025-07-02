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
}
