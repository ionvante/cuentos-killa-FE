import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../model/user.model';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;
  private tokenKey = 'token';
  private userKey = 'userData';
  usuarioLogueado$ = new Subject<User>(); // 👈 Nuevo

  constructor(private http: HttpClient, private router: Router) {
   
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });
  }

  guardarToken(token: string) {
    localStorage.setItem(this.tokenKey, token);

  }

  guardarUsuario(user: User) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.usuarioLogueado$.next(user); // 👈 Notifica a quien esté escuchando

  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  cerrarSesion() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    return !!this.getUser();
  }
    getUser(): User | null {
      if (typeof window !== 'undefined' && localStorage.getItem(this.userKey)) {
        return JSON.parse(localStorage.getItem(this.userKey)!);
      }
      return null;
  }


}