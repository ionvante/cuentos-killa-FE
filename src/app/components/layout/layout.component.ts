import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { DrawerMenuComponent } from '../drawer-menu/drawer-menu.component';
import { DrawerService } from '../../services/drawer.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, DrawerMenuComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  constructor(public drawer: DrawerService) {}
}
