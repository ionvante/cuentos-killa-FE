import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: number | string = 0;
  @Input() data: number[] = [];
  @Input() icon = '';

  get points(): string {
    if (!this.data || this.data.length === 0) return '';
    const max = Math.max(...this.data);
    const min = Math.min(...this.data);
    const range = max - min || 1;
    return this.data
      .map((d, i) => `${(i / (this.data.length - 1)) * 100},${100 - ((d - min) / range) * 100}`)
      .join(' ');
  }
}
