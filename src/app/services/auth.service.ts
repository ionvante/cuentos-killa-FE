import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../model/user.model';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../model/auth-response.model';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;
  private tokenKey = 'TOKEN_KEY';
  private userKey = 'USER_KEY';
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
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  register(data: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, data);
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
    return data ? JSON.parse(data) : null;
  }
}
