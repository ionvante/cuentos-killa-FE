import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate{

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.estaAutenticado()) {
      return true;
    }

    this.router.navigate(['/login'], {
      queryParams: { returnTo: this.router.url }
    });
    return false;
  }
}