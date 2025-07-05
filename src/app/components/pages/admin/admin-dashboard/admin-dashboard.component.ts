import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CuentoService } from '../../../../services/cuento.service';
import { PedidoService } from '../../../../services/pedido.service';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../model/user.model';
import { ChartOptions } from 'chart.js';
import { subDays, addDays, format } from 'date-fns';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  cuentosPublicados = 0;
  pedidosEnProceso = 0;
  usuariosRegistrados = 0;
  ventasTotales = 0;
  cuentosData: number[] = [];
  pedidosData: number[] = [];
  usuariosData: number[] = [];
  isLoading = true;
  errorMensaje: string | null = null;
  usuarios: User[] = [];
  selectedDays: number | string = 7;
  timeUnitShort = '7d';
  sparklineOptions: ChartOptions = {
    responsive: true,
    elements: { point: { radius: 0 } },
    scales: { x: { display: false }, y: { display: false } },
    plugins: { legend: { display: false }, tooltip: { enabled: false } }
  };

  private ensureMinLength(data: number[], min = 5): number[] {
    if (!data || data.length >= min) return data;
    const last = data.length ? data[data.length - 1] : 0;
    return data.concat(Array(min - data.length).fill(last));
  }

  mapIndexToDate(i: number): string {
    const fechaInicial = subDays(new Date(), typeof this.selectedDays === 'number' ? this.selectedDays : 365);
    return format(addDays(fechaInicial, i), 'dd/MM/yyyy');
  }

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
        this.cuentosData = this.ensureMinLength(
          cuentos.map(c => c.id ?? 0).slice(0, 10)
        );
        this.pedidosData = this.ensureMinLength(
          pedidos.map(p => p.total).slice(0, 10)
        );
        this.usuariosData = this.ensureMinLength(
          usuarios.map((u, i) => i + 1).slice(0, 10)
        );
        this.isLoading = false;
      },
      error: () => {
        this.errorMensaje = 'Error al cargar estadísticas. Reintentar';
        this.isLoading = false;
      }
    });
  }

  onRangeChange(): void {
    const val = this.selectedDays;
    this.timeUnitShort = typeof val === 'number' ? `${val}d` : '12m';
    this.cargarEstadisticas();
  }
}
