import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../model/user.model';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../model/auth-response.model';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;
  private tokenKey = 'token';
  private userKey = 'userData';
  usuarioLogueado$ = new Subject<User>(); // 👈 Nuevo

  constructor(private http: HttpClient, private router: Router) {
   
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  register(data: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, data);
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