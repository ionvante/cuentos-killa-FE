import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AppCurrencyPipe } from '../../../../pipes/app-currency.pipe';
import { NgChartsModule } from 'ng2-charts';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { StatCardComponent } from '../../../stat-card/stat-card.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent }
];

@NgModule({
  declarations: [AdminDashboardComponent],
  imports: [CommonModule, FormsModule, NgChartsModule, RouterModule.forChild(routes), StatCardComponent, AppCurrencyPipe],
  exports: [AdminDashboardComponent]
})
export class AdminDashboardModule {}
