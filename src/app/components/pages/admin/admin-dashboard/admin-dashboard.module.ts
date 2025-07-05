import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { StatCardComponent } from '../../../stat-card/stat-card.component';

@NgModule({
  declarations: [AdminDashboardComponent],
  imports: [CommonModule, FormsModule, NgChartsModule, StatCardComponent],
  exports: [AdminDashboardComponent]
})
export class AdminDashboardModule {}
