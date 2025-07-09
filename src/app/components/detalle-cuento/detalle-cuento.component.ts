import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CuentoService } from './../../services/cuento.service';
import { Cuento } from './../../model/cuento.model';
import { CartService } from '../../services/carrito.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-detalle-cuento',
  templateUrl: './detalle-cuento.component.html',
  styleUrls: ['./detalle-cuento.component.scss']
})
export class DetalleCuentoComponent implements OnInit, AfterViewInit, OnDestroy {
  cuento?: Cuento;
  cargandoImagen: boolean = true; // 🔥 Nueva bandera para el skeleton
  relatedCuentos: Cuento[] = [];
  selectedTab: 'description' | 'tech' | 'reviews' = 'description';
  openTech = false;
  /** Cantidad seleccionada para agregar al carrito */
  cantidad = 1;
  @ViewChild('carousel', { static: false }) carousel?: ElementRef<HTMLDivElement>;
  minFreeShipping = environment.minFreeShipping;
  isNuevo = false;
  badgeLabel = '';
  quantity = 1;
  selectedImageIndex = 0;
  private carouselInterval?: ReturnType<typeof setInterval>;
  /** Indica si el cuento posee un descuento válido */
  get hasDiscount(): boolean {
    return this.cuento?.descuento !== undefined && this.cuento.descuento > 0;
  }
  constructor(
    private route: ActivatedRoute,
    private cuentoService: CuentoService,
    private carritoService: CartService   ,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cuentoService.getCuentoById(+id).subscribe(data => {
        this.cuento = data;
        if (this.cuento?.fechaIngreso) {
          const diff = (Date.now() - new Date(this.cuento.fechaIngreso).getTime()) / (1000 * 3600 * 24);
          this.isNuevo = diff <= 30;
        }
        this.badgeLabel = this.cuento.badge || (this.isNuevo ? 'Nuevo' : '');
      });
      this.cuentoService.obtenerCuentos().subscribe(cuentos => {
        this.relatedCuentos = cuentos.filter(c => c.id !== +id).slice(0, 8);
      });
    }
  }

  ngAfterViewInit(): void {
    this.carouselInterval = setInterval(() => {
      const container = this.carousel?.nativeElement;
      if (container) {
        const atEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth;
        if (atEnd) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          this.scrollCarousel(1);
        }
      }
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }
  agregarAlCarrito() {
    if (this.cuento) {
      this.carritoService.addItemCantidad(this.cuento, this.cantidad);
    }
  }

  comprarAhora() {
    if (this.cuento) {
      this.carritoService.addItemCantidad(this.cuento, this.cantidad);
      this.router.navigate(['/checkout']);
    }
  }

  incrementarCantidad() {
    if (this.cuento && this.cantidad < this.cuento.stock) {
      this.cantidad++;
    }
  }

  decrementarCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }
  cargarImagenPlaceholder(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.onerror = null; // 🔥 MUY IMPORTANTE: eliminar el listener para evitar loop
    imgElement.src = 'assets/placeholder-cuento.jpg';
    this.cargandoImagen = false; // 🔥 Ya no hay que seguir mostrando skeleton
  }
  imagenCargada(): void {
    this.cargandoImagen = false; // 🔥 Cuando la imagen carga, quitamos skeleton
  }

  selectTab(tab: 'description' | 'tech' | 'reviews'): void {
    this.selectedTab = tab;
  }
  selectImage(index: number): void {
    this.selectedImageIndex = index;
    this.cargandoImagen = true;
  }

  get mainImage(): string {
    return (
      this.cuento?.galeria?.[this.selectedImageIndex] ||
      this.cuento?.imagenUrl ||
      'assets/placeholder-cuento.jpg'
    );
  }

  toggleTech(): void {
    this.openTech = !this.openTech;
  }

  scrollCarousel(direction: number) {
    const container = this.carousel?.nativeElement;
    if (container) {
      const width = container.offsetWidth;
      container.scrollBy({ left: width * 0.8 * direction, behavior: 'smooth' });
    }
  }

  compartir(red: 'whatsapp' | 'tiktok') {
    const url = encodeURIComponent(window.location.href);
    if (red === 'whatsapp') {
      window.open(`https://wa.me/?text=${url}`, '_blank');
    } else {
      window.open('https://www.tiktok.com/upload?url=' + url, '_blank');
    }
  }

  volver() {
  this.location.back();
  }

  /** Devuelve el string de estrellas según la valoración */
  getRatingStars(rating: number): string {
    return '★★★★★'.slice(0, rating) + '☆☆☆☆☆'.slice(rating);
  }

  /** Calcula el precio final con descuento */
  get precioFinal(): number {
    if (!this.cuento) {
      return 0;
    }
    if (this.cuento.descuento && this.cuento.descuento > 0) {
      return this.cuento.precio * (1 - this.cuento.descuento / 100);
    }
    return this.cuento.precio;
  }

  /** Mensaje de stock con advertencia cuando quedan pocas unidades */
  get stockMessage(): string {
    if (!this.cuento) {
      return '';
    }
    if (!this.cuento.habilitado) {
      return 'Sin stock';
    }
    return this.lowStock ? 'Últimas unidades' : 'En stock';
  }

  /** Indica si el cuento tiene pocas unidades disponibles */
  get lowStock(): boolean {
    return !!this.cuento && this.cuento.stock <= 5;
  }
}