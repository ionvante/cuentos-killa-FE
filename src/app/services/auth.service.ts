import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../model/user.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../model/auth-response.model';
import { StorageService, TOKEN_KEY, USER_KEY } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  // Usamos las constantes exportadas por StorageService:
  //   TOKEN_KEY = 'token'     ← la misma clave que lee el interceptor
  //   USER_KEY  = 'userData'
  private readonly tokenKey = TOKEN_KEY;
  private readonly userKey = USER_KEY;

  usuarioLogueado$ = new BehaviorSubject<User | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {
    const user = this.getUser();
    if (user) {
      this.usuarioLogueado$.next(user);
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(res => res.data ?? res)
    );
  }

  register(data: any): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
      map(res => res.data ?? res)
    );
  }

  guardarToken(token: string) {
    this.storageService.setItem(this.tokenKey, token);
  }

  guardarUsuario(user: User) {
    this.storageService.setItem(this.userKey, JSON.stringify(user));
    this.usuarioLogueado$.next(user);
  }

  getToken(): string | null {
    return this.storageService.getItem(this.tokenKey);
  }

  cerrarSesion() {
    this.storageService.removeItem(this.tokenKey);
    this.storageService.removeItem(this.userKey);
    this.usuarioLogueado$.next(null);
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    return !!this.getUser();
  }

  getUser(): User | null {
    const data = this.storageService.getItem(this.userKey);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      // Datos corruptos en localStorage, limpiar
      this.storageService.removeItem(this.userKey);
      return null;
    }
  }
}
