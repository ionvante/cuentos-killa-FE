import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  cuentosPublicados = 10;
  pedidosEnProceso = 5;
  usuariosRegistrados = 25;
  ventasTotales = 1200;

  constructor() {}
  ngOnInit(): void {}
}
