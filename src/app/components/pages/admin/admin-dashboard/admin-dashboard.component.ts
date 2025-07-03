import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CuentoService } from '../../../../services/cuento.service';
import { PedidoService } from '../../../../services/pedido.service';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../model/user.model';
import { StatCardComponent } from '../../../stat-card/stat-card.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  cuentosPublicados = 0;
  pedidosEnProceso = 0;
  usuariosRegistrados = 0;
  ventasTotales = 0;
  cuentosTrend: number[] = [];
  pedidosTrend: number[] = [];
  usuariosTrend: number[] = [];
  isLoading = true;
  errorMensaje: string | null = null;
  usuarios: User[] = [];

  constructor(
    private cuentoService: CuentoService,
    private pedidoService: PedidoService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.errorMensaje = null;
    this.isLoading = true;
    forkJoin([
      this.cuentoService.obtenerCuentos(),
      this.pedidoService.getOrders(),
      this.userService.obtenerUsuarios()
    ]).subscribe({
      next: ([cuentos, pedidos, usuarios]) => {
        this.cuentosPublicados = cuentos.length;
        this.pedidosEnProceso = pedidos.length;
        this.usuariosRegistrados = usuarios.length;
        this.usuarios = usuarios;
        this.cuentosTrend = cuentos.map(c => c.id ?? 0).slice(0, 10);
        this.pedidosTrend = pedidos.map(p => p.total).slice(0, 10);
        this.usuariosTrend = usuarios.map((u, i) => i + 1).slice(0, 10);
        this.isLoading = false;
      },
      error: () => {
        this.errorMensaje = 'Error al cargar estadísticas. Reintentar';
        this.isLoading = false;
      }
    });
  }

  reloadStats(): void {
    this.cargarEstadisticas();
  }
}
