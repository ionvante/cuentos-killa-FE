import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';  // 🔥 importa esto
import { NavbarComponent } from '../navbar/navbar.component';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, NgIf],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  constructor(private router: Router) {}

  get esRutaAdmin(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
