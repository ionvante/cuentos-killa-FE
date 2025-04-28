import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public token: string | null;
  private apiUrl = 'http://localhost:8080/auth/login';
  private userName: string | null = null;

  constructor(private http: HttpClient, private router: Router) {
    const savedUser = localStorage.getItem('user');
    if (typeof window !== 'undefined' && localStorage) {
      this.token = localStorage.getItem('token');
      console.log('Token encontrado:', this.token);
    } else {
      this.token = null;
    }
    if (savedUser) {
      this.userName = savedUser;
    }
  }

  login(email: string, password: string) {    
    return this.http.post<{ token: string }>(this.apiUrl, { email, password });
  }
  getUserName(): string | null {
    return this.userName;
  }

  guardarToken(token: string) {
    localStorage.setItem('token', token);
  }

  cerrarSesion() {
    this.userName = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }
  
}