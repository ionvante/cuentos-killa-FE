import { Component, OnInit, OnDestroy } from '@angular/core';
import { Cuento } from '../../../model/cuento.model';
import { CuentoService, CuentoSearchParams } from '../../../services/cuento.service';
import { CartService } from '../../../services/carrito.service';
import { MaestrosService } from '../../../services/maestros.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Maestro } from '../../../model/maestro.model';
import {
  CUENTO_MAESTRO_GRUPOS,
  normalizarCodigoCategoria,
  normalizarCodigoEdad
} from '../../../shared/cuento-maestros';
import { Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-cuentos-page',
  templateUrl: './cuentos.component.html',
  styleUrls: ['./cuentos.component.scss']
})
export class CuentosComponent implements OnInit, OnDestroy {
  cuentos: Cuento[] = [];
  searchTerm = '';
  sortOption: 'fechaIngreso' | 'alfabetico' | 'precio' = 'fechaIngreso';
  categoriaFilter = '';
  edadFilter = '';
  precioFilter = '';
  isLoading = true;

  // Paginación server-side
  currentPage = 0;
  totalPages = 1;
  totalElements = 0;
  pageSize = 20;

  categorias: Maestro[] = [];
  edades: Maestro[] = [];

  // RM-01: Subject para debounce de filtros
  private filtros$ = new BehaviorSubject<CuentoSearchParams>({});
  private destroy$ = new Subject<void>();

  constructor(
    private cuentoService: CuentoService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private maestrosService: MaestrosService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.searchTerm = params.get('q') || '';
      this.categoriaFilter = params.get('categoria') || '';
      this.edadFilter = params.get('edad') || '';
      this.precioFilter = params.get('precio') || '';
      this.currentPage = 0;
      this.emitFiltros();
    });

    this.cargarMaestros();

    // RM-01: Debounce de 400ms antes de llamar al BE
    this.filtros$.pipe(
      debounceTime(400),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap(params => {
        this.isLoading = true;
        return this.cuentoService.buscarCuentos(params);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (page: any) => {
        const items = page.content ?? page;
        this.cuentos = Array.isArray(items)
          ? items.map((c: Cuento, idx: number) => this.normalizarCuento(c, idx))
          : [];
        this.totalPages = page.totalPages ?? 1;
        this.totalElements = page.totalElements ?? this.cuentos.length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Construye los parámetros de búsqueda desde el estado actual */
  private buildParams(): CuentoSearchParams {
    const [precioMin, precioMax] = this.parsePrecio(this.precioFilter);
    const sortBy = this.sortOption === 'alfabetico' ? 'titulo'
                 : this.sortOption === 'precio'      ? 'precio'
                 : 'fechaIngreso';
    return {
      q: this.searchTerm || undefined,
      categoria: this.categoriaFilter || undefined,
      edad: this.edadFilter || undefined,
      precioMin,
      precioMax,
      page: this.currentPage,
      size: this.pageSize,
      sortBy
    };
  }

  private parsePrecio(filtro: string): [number | undefined, number | undefined] {
    switch (filtro) {
      case 'lt10':  return [undefined, 10];
      case '10-20': return [10, 20];
      case 'gt20':  return [20, undefined];
      default:      return [undefined, undefined];
    }
  }

  /** Emite los filtros actuales al Subject para disparar la búsqueda con debounce */
  emitFiltros(): void {
    this.filtros$.next(this.buildParams());
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
    this.onFilterChange();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchTerm || null,
        categoria: this.categoriaFilter || null,
        edad: this.edadFilter || null,
        precio: this.precioFilter || null
      },
      queryParamsHandling: 'merge'
    });
    this.emitFiltros();
  }

  irAPagina(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.emitFiltros();
  }

  private cargarMaestros(): void {
    this.maestrosService.obtenerMaestrosPorGrupo(CUENTO_MAESTRO_GRUPOS.categoria).subscribe({
      next: c => {
        this.categorias = c;
        this.cuentos = this.cuentos.map((cuento, idx) => this.normalizarCuento(cuento, idx));
      },
      error: () => {
        this.maestrosService.obtenerMaestrosPorGrupo(CUENTO_MAESTRO_GRUPOS.categoriaLegacy).subscribe({
          next: c => {
            this.categorias = c;
            this.cuentos = this.cuentos.map((cuento, idx) => this.normalizarCuento(cuento, idx));
          }
        });
      }
    });

    this.maestrosService.obtenerMaestrosPorGrupo(CUENTO_MAESTRO_GRUPOS.edad).subscribe({
      next: e => {
        this.edades = e;
        this.cuentos = this.cuentos.map((cuento, idx) => this.normalizarCuento(cuento, idx));
      },
      error: err => console.warn('Error cargando edades:', err?.status)
    });
  }

  private normalizarCuento(cuento: Cuento, idx: number): Cuento {
    return {
      ...cuento,
      categoria: normalizarCodigoCategoria(cuento.categoria, this.categorias),
      edadRecomendada: normalizarCodigoEdad(cuento.edadRecomendada, this.edades),
      rating: cuento.rating ?? undefined,
      // HU-R1-03: El badge se toma del backend; no se asigna por posición (era dato falso)
      badge: cuento.badge ?? undefined
    };
  }

  get hasFiltros(): boolean {
    return !!(this.searchTerm || this.categoriaFilter || this.edadFilter || this.precioFilter);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}
