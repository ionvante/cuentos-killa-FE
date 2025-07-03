import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from '../../../../services/config.service';
import { ConfigCategory } from '../../../../model/config-category.model';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-config-categories',
  templateUrl: './config-categories.component.html',
  styleUrls: ['./config-categories.component.scss']
})
export class ConfigCategoriesComponent implements OnInit {
  categories: ConfigCategory[] = [];
  isLoading = true;
  errorMensaje: string | null = null;

  constructor(private configService: ConfigService, private router: Router, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.configService.getCategories().subscribe({
      next: data => {
        this.categories = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMensaje = 'No se pudieron cargar las categorías';
        this.isLoading = false;
      }
    });
  }

  nueva(): void {
    this.router.navigate(['/admin/config/nueva']);
  }

  editar(id: number): void {
    this.router.navigate(['/admin/config/editar', id]);
  }

  verItems(id: number): void {
    this.router.navigate(['/admin/config', id, 'items']);
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar categoría?')) return;
    this.configService.deleteCategory(id).subscribe({
      next: () => {
        this.toast.show('Categoría eliminada');
        this.loadCategories();
      },
      error: () => this.toast.show('Error al eliminar categoría')
    });
  }
}
