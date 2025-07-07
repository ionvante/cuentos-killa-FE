import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { OrderStatsService } from '../../services/order-stats.service';

@Component({
  selector: 'app-order-stats',
  templateUrl: './order-stats.component.html',
  styleUrls: ['./order-stats.component.scss']
})
export class OrderStatsComponent implements OnInit {
  pieData: ChartData<'pie'> = {
    labels: ['Pago pendiente', 'Pago enviado'],
    datasets: [{ data: [0, 0] }]
  };

  barData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: '#FFAD60' }]
  };

  barOptions: ChartOptions<'bar'> = {
    responsive: true
  };

  constructor(private statsService: OrderStatsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData() {
    this.statsService.getStatusCounts().subscribe(counts => {
      this.pieData.datasets[0].data = [
        counts['PAGO_PENDIENTE'] || 0,
        counts['PAGO_ENVIADO'] || 0
      ];
    });

    this.statsService.getOrdersByDay(7).subscribe(entries => {
      this.barData.labels = entries.map(e => e.date.slice(5));
      this.barData.datasets[0].data = entries.map(e => e.count);
    });
  }
}
