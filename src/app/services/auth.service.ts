import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../model/user.model';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth/login';
  private tokenKey = 'token';
  private userKey = 'userData';

  constructor(private http: HttpClient, private router: Router) {
   
  }

  login(correo: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { correo, password });
  }

  guardarToken(token: string) {
    localStorage.setItem(this.tokenKey, token);

  }

  guardarUsuario(user: User) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
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
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }


}