import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../../../../services/config.service';
import { ConfigItem } from '../../../../model/config-item.model';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-config-items',
  templateUrl: './config-items.component.html',
  styleUrls: ['./config-items.component.scss']
})
export class ConfigItemsComponent implements OnInit {
  categoryId!: number;
  items: ConfigItem[] = [];
  isLoading = true;
  errorMensaje: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ConfigService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.categoryId = +(this.route.snapshot.paramMap.get('id') || 0);
    this.loadItems();
  }

  loadItems(): void {
    this.isLoading = true;
    this.service.getItems(this.categoryId).subscribe({
      next: data => {
        this.items = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMensaje = 'No se pudieron cargar los ítems';
        this.isLoading = false;
      }
    });
  }

  nuevo(): void {
    this.router.navigate(['/admin/config', this.categoryId, 'items', 'nuevo']);
  }

  editar(id: number): void {
    this.router.navigate(['/admin/config', this.categoryId, 'items', 'editar', id]);
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar ítem?')) return;
    this.service.deleteItem(this.categoryId, id).subscribe({
      next: () => {
        this.toast.show('Ítem eliminado');
        this.loadItems();
      },
      error: () => this.toast.show('Error al eliminar ítem')
    });
  }
}
