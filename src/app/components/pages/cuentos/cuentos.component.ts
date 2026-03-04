import { Component, NgZone, OnInit } from '@angular/core';
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
  categoriaFilter = '';
  edadFilter = '';
  precioFilter = '';
  isLoading = true;

  categorias = ['Aventura', 'Didáctico', 'Clásico'];

  constructor(
    private cuentoService: CuentoService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.searchTerm = params.get('q') || '';
    });

    this.cuentoService.obtenerCuentos().subscribe(data => {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.ngZone.run(() => {
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
          });
        }, 1000);
      });
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

    if (this.edadFilter) {
      filtered = filtered.filter(c => {
        if (!c.edadRecomendada) return false;
        // La Base de Datos de prueba podría tener "0-3 años" o "0 - 3 años"
        const prefix = this.edadFilter.split('-')[0].trim();
        return c.edadRecomendada.includes(prefix);
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
    this.categoriaFilter = '';
    this.edadFilter = '';
    this.precioFilter = '';
  }
}
