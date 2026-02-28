import { Component, OnInit } from '@angular/core';
import { Cuento } from '../../../model/cuento.model';
import { CuentoService } from '../../../services/cuento.service';
import { CartService } from '../../../services/carrito.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cuentos-page',
  templateUrl: './cuentos.component.html',
  styleUrls: ['./cuentos.component.scss']
})
export class CuentosComponent implements OnInit {
  cuentos: Cuento[] = [];
  searchTerm = '';
  sortOption: 'fecha' | 'alfabetico' | 'precio' = 'fecha';
  fechaFilter = '';
  precioFilter = '';
  categoriaFilter = '';
  ratingFilter = '';
  isLoading = true;

  categorias = ['Aventura', 'Didáctico', 'Clásico'];

  constructor(
    private cuentoService: CuentoService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.searchTerm = params.get('q') || '';
    });

    this.cuentoService.obtenerCuentos().subscribe(data => {
      // Retrasado artificialmente para visualizar los Skeleton Loaders de la Fase UX 2
      setTimeout(() => {
        this.cuentos = data
          .map((c, idx) => ({
            ...c,
            categoria: this.categorias[Math.floor(Math.random() * this.categorias.length)],
            rating: Math.floor(Math.random() * 5) + 1,
            badge: idx === 0 ? 'Top Ventas' : idx === 1 ? 'Recomendado' : ''
          }))
          .sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime())
          .slice(0, 20);
        this.isLoading = false;
      }, 1000);
    });
  }

  get filteredCuentos(): Cuento[] {
    let filtered = this.cuentos.filter(c =>
      c.titulo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      c.autor.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    if (this.categoriaFilter) {
      filtered = filtered.filter(c => c.categoria === this.categoriaFilter);
    }

    if (this.ratingFilter) {
      filtered = filtered.filter(c => (c.rating || 0) >= +this.ratingFilter);
    }

    if (this.fechaFilter) {
      const now = Date.now();
      filtered = filtered.filter(c => {
        const diffDays = (now - new Date(c.fechaIngreso).getTime()) / (1000 * 3600 * 24);
        switch (this.fechaFilter) {
          case 'semana':
            return diffDays <= 7;
          case 'mes':
            return diffDays <= 30;
          case 'ano':
            return diffDays <= 365;
          default:
            return true;
        }
      });
    }

    if (this.precioFilter) {
      filtered = filtered.filter(c => {
        switch (this.precioFilter) {
          case 'lt10':
            return c.precio < 10;
          case '10-20':
            return c.precio >= 10 && c.precio <= 20;
          case 'gt20':
            return c.precio > 20;
          default:
            return true;
        }
      });
    }
    switch (this.sortOption) {
      case 'alfabetico':
        filtered = filtered.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case 'precio':
        filtered = filtered.sort((a, b) => a.precio - b.precio);
        break;
      default:
        filtered = filtered.sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime());
    }
    return filtered;
  }

  agregarAlCarrito(cuento: Cuento): void {
    this.cartService.addItem(cuento);
  }

  verDetalle(id: number): void {
    this.router.navigate(['/cuento', id]);
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.fechaFilter = '';
    this.precioFilter = '';
    this.categoriaFilter = '';
    this.ratingFilter = '';
  }
}
