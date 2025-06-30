import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';  // 🔥 importa esto
import { NavbarComponent } from '../navbar/navbar.component';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet,NavbarComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {

}
