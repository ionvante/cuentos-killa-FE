import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  @Input() status = '';

  get styles() {
    // HU-R1-08: Sincronizado con EstadoPedido.enum.ts y PedidoEstadoService
    const map: Record<string, {bg: string; color: string; label: string}> = {
      'GENERADO':        { bg: '#e0e7ff', color: '#3730a3', label: 'Creado' },
      'PAGO_PENDIENTE':  { bg: '#FFEEAD', color: '#A66E38', label: 'Pago pendiente' },
      'PAGO_ENVIADO':    { bg: '#FFAD60', color: '#593720', label: 'Pago enviado' },
      'PAGADO':          { bg: '#bbf7d0', color: '#065f46', label: 'Pagado' },
      'VERIFICADO':      { bg: '#bbf7d0', color: '#065f46', label: 'Verificado' },
      'PAGO_VERIFICADO': { bg: '#96CEB4', color: '#084D3A', label: 'Pago verificado' },
      'EMPAQUETADO':     { bg: '#fef9c3', color: '#713f12', label: 'En preparación' },
      'ENVIADO':         { bg: '#dbeafe', color: '#1e3a8a', label: 'En camino' },
      'ENTREGADO':       { bg: '#d1fae5', color: '#065f46', label: 'Entregado' },
      'CANCELADO':       { bg: '#fee2e2', color: '#7f1d1d', label: 'Cancelado' },
      'PAGO_RECHAZADO':  { bg: '#F44336', color: '#FFF',    label: 'Pago rechazado' }
    };
    return map[this.status] || { bg: '#e0e0e0', color: '#333', label: this.status };
  }
}
