import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../model/user.model';


@Injectable({ providedIn: 'root' })
export class AuthService {
  public token: string | null;
  private apiUrl = 'http://localhost:8080/auth/login';
  private userName: string | null = null;

  private storageKey = 'userData';


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

  login(usuario: User): void {
    localStorage.setItem(this.storageKey, JSON.stringify(usuario));
  }

  guardarToken(token: string) {
    localStorage.setItem('token', token);
  }

  cerrarSesion() {
    localStorage.removeItem(this.storageKey);
  }

  estaAutenticado(): boolean {
    return !!this.getUser();
  }
  getUser(): User | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) as User : null;
    } catch (e) {
      console.error('Error al parsear userData de localStorage');
      return null;
    }
  }


}