import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: number | string | null = 0;
  @Input() data: number[] = [];
  @Input() icon = '';
  @Input() options: ChartOptions | undefined = undefined;
}
