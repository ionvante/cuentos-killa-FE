import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { DrawerMenuComponent } from '../drawer-menu/drawer-menu.component';
import { DrawerService } from '../../services/drawer.service';
import { MiniCartComponent } from '../mini-cart/mini-cart.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../model/user.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, DrawerMenuComponent, MiniCartComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  user: User | null = null;
  constructor(public drawer: DrawerService, public router: Router, private auth: AuthService) {
    this.user = this.auth.getUser();
    this.auth.usuarioLogueado$.subscribe(u => this.user = u);
  }
}
