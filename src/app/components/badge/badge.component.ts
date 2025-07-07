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
    const map: Record<string, {bg: string; color: string; label: string}> = {
      'PAGO_PENDIENTE': { bg: '#FFEEAD', color: '#A66E38', label: 'Pago pendiente' },
      'PAGO_ENVIADO': { bg: '#FFAD60', color: '#593720', label: 'Pago enviado' },
      'PAGO_VERIFICADO': { bg: '#96CEB4', color: '#084D3A', label: 'Pago verificado' },
      'PAGO_RECHAZADO': { bg: '#F44336', color: '#FFF', label: 'Pago rechazado' }
    };
    return map[this.status] || { bg: '#e0e0e0', color: '#333', label: this.status };
  }
}
