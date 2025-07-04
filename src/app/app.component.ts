import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MiniCartComponent } from './components/mini-cart/mini-cart.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MiniCartComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'cuentos-killa-FE';
  userRole: string | null = null;

  constructor(private auth: AuthService, private router: Router) {
    const user = this.auth.getUser();
    this.userRole = user?.role ?? null;
    this.auth.usuarioLogueado$.subscribe(u => this.userRole = u?.role ?? null);
  }

  get showMiniCart(): boolean {
    const url = this.router.url;
    const allowedRoutes = url.startsWith('/home') ||
      url.startsWith('/cuentos') ||
      url.startsWith('/cuento/');
    return this.userRole === 'USER' && allowedRoutes;
  }
}
