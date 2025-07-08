import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CuentoService } from '../../../../services/cuento.service';
import { PedidoService } from '../../../../services/pedido.service';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../model/user.model';
import { ChartOptions, ChartData } from 'chart.js';
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
  pedidosNuevos = 0;
  ticketPromedio = 0;
  tasaConversion = 0;
  deltaPedidos = 0;
  statusCounts: Record<string, number> = {};
  statusKeys: string[] = [];
  ingresosData: ChartData<'line'> = { labels: [], datasets: [{ data: [], label: 'Ingresos', borderColor: '#A66E38', fill: false }] };
  funnelData: ChartData<'bar'> = { labels: ['Visitas', 'Carrito', 'Checkout', 'Pagos', 'Envíos'], datasets: [{ data: [1000, 150, 60, 50, 48], backgroundColor: '#FFAD60' }] };
  chartOptions: ChartOptions = { responsive: true };
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
        const rango = typeof this.selectedDays === 'number' ? this.selectedDays : 365;
        const inicio = subDays(new Date(), rango);
        const anteriorInicio = subDays(inicio, rango);
        const pedidosActuales = pedidos.filter(p => new Date(p.fecha) >= inicio);
        const pedidosPrevios = pedidos.filter(p => new Date(p.fecha) >= anteriorInicio && new Date(p.fecha) < inicio);
        this.pedidosNuevos = pedidosActuales.length;
        this.deltaPedidos = this.pedidosNuevos - pedidosPrevios.length;
        this.ventasTotales = pedidosActuales.reduce((sum, p) => sum + p.total, 0);
        this.ticketPromedio = this.pedidosNuevos ? this.ventasTotales / this.pedidosNuevos : 0;
        this.tasaConversion = 0; // no visits data
        this.statusCounts = pedidos.reduce((acc: Record<string, number>, p) => {
          acc[p.estado] = (acc[p.estado] || 0) + 1;
          return acc;
        }, {});
        this.statusKeys = Object.keys(this.statusCounts);
        const ingresosPorDia: { [date: string]: number } = {};
        for (let i = 0; i < rango; i++) {
          const d = subDays(new Date(), rango - 1 - i);
          const key = format(d, 'MM-dd');
          ingresosPorDia[key] = 0;
        }
        pedidosActuales.forEach(p => {
          const key = format(new Date(p.fecha), 'MM-dd');
          if (ingresosPorDia[key] !== undefined) ingresosPorDia[key] += p.total;
        });
        this.ingresosData = {
          labels: Object.keys(ingresosPorDia),
          datasets: [{ data: Object.values(ingresosPorDia), label: 'Ingresos', borderColor: '#A66E38', fill: false }]
        };
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
