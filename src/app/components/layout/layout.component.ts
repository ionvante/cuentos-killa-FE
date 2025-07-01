import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';  // 🔥 importa esto
import { NavbarComponent } from '../navbar/navbar.component';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet,NavbarComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  constructor(private router: Router) {}

  get esRutaAdmin(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
