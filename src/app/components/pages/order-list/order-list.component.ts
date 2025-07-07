import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Pedido } from '../../../model/pedido.model';
import { PedidoService } from '../../../services/pedido.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../../badge/badge.component';
import { AuthService } from '../../../services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-order-list',
  standalone: true, // Ensure standalone is true
  imports: [CommonModule, RouterModule, FormsModule, BadgeComponent],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class OrderListComponent implements OnInit {
  pedidos: Pedido[] = [];
  isLoading: boolean = true;
  errorMensaje: string | null = null;
  selectedPayment: { [id: number]: string } = {};
  searchTerm: string = '';
  estadoFilter: string = '';
  estadosUnicos: string[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  itemsExpanded: { [id: number]: boolean } = {};

  estadoMap: Record<string, { texto: string; emoji: string }> = {
    'PAGO_PENDIENTE': { texto: 'Pago pendiente', emoji: '🔶' },
    'PAGO_ENVIADO': { texto: 'Pago enviado', emoji: '📤' },
    'PAGO_VERIFICADO': { texto: 'Pago verificado', emoji: '✅' },
    'ENVIADO': { texto: 'Enviado', emoji: '📦' },
    'ENTREGADO': { texto: 'Entregado', emoji: '📬' },
  };

  constructor(
    private pedidoService: PedidoService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMensaje = null;

    const usuario = this.authService.getUser();
    this.pedidoService.getOrders().subscribe({
      next: (data) => {
        this.pedidos = usuario
          ? data.filter(p => p.correoUsuario === usuario.email)
          : [];
        this.estadosUnicos = Array.from(new Set(this.pedidos.map(p => p.estado)));
        this.currentPage = 1;
        this.searchTerm = '';
        this.estadoFilter = '';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
        this.errorMensaje = 'No se pudieron cargar los pedidos. Intente más tarde.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  verDetalle(pedidoId: number): void {
    this.router.navigate(['/pedidos', pedidoId]);
  }

  irAPago(pedidoId: number): void {
    this.router.navigate(['/pago', pedidoId]);
  }

  getEstadoVisible(estado: string): string {
    const info = this.estadoMap[estado];
    return info ? `${info.emoji} ${info.texto}` : estado;
  }

  getEstadoClass(estado: string): string {
    return 'status-' + estado.toLowerCase().replace('_', '-');
  }

  toggleItems(id: number): void {
    this.itemsExpanded[id] = !this.itemsExpanded[id];
  }

  getPedidoId(p: Pedido): number {
    return (p.Id ?? (p as any).id) as number;
  }

  get filteredPedidos(): Pedido[] {
    return this.pedidos.filter(p => {
      const idStr = this.getPedidoId(p).toString();
      const matchesSearch = this.searchTerm
        ? idStr.includes(this.searchTerm)
        : true;
      const matchesEstado = this.estadoFilter
        ? p.estado === this.estadoFilter
        : true;
      return matchesSearch && matchesEstado;
    });
  }

  get paginatedPedidos(): Pedido[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPedidos.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPedidos.length / this.itemsPerPage));
  }

  changePage(delta: number): void {
    const newPage = this.currentPage + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
    }
  }

  descargarPDF(pedidoId: number): void {
    this.pedidoService.downloadInvoice(pedidoId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedido-${pedidoId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  dejarResena(pedidoId: number): void {
    this.router.navigate(['/reseña', pedidoId]);
  }

  trackByPedidoId = (index: number, pedido: Pedido) => this.getPedidoId(pedido);

  goToStore(): void {
    this.router.navigate(['/cuentos']);
  }

  exportCSV(): void {
    const headers = ['Id', 'fecha', 'estado', 'total'];
    const filas = this.filteredPedidos.map(p => [this.getPedidoId(p), p.fecha, p.estado, p.total]);
    const contenido = [headers.join(','), ...filas.map(f => f.join(','))].join('\n');
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pedidos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
