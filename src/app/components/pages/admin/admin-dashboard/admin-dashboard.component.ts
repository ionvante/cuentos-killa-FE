import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CuentoService } from '../../../../services/cuento.service';
import { PedidoService } from '../../../../services/pedido.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  // standalone: true,
  // imports: [],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  cuentosPublicados = 0;
  pedidosEnProceso = 0;
  usuariosRegistrados = 0;
  ventasTotales = 0;
  isLoading = true;
  errorMensaje: string | null = null;

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
