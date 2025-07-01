import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Cuento } from '../../model/cuento.model'; // ajusta el path según tu estructura
import { CartService } from '../../services/carrito.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cuento-card',
  templateUrl: './cuento-card.component.html',
  styleUrls: ['./cuento-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CuentoCardComponent implements OnInit {
  @Input() cuento!: Cuento;
  @Input() isAdmin: boolean = false; // Nueva entrada para modo admin
  @Output() agregar = new EventEmitter<Cuento>();
  @Output() detalle = new EventEmitter<number>();
  @Output() editar = new EventEmitter<Cuento>(); // Nuevo evento para editar
  @Output() deshabilitar = new EventEmitter<Cuento>(); // Nuevo evento para deshabilitar
  cargandoImagen: boolean = true;
  isNuevo = false;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    if (this.cuento?.fechaIngreso) {
      const ingreso = new Date(this.cuento.fechaIngreso);
      const diff = (Date.now() - ingreso.getTime()) / (1000 * 3600 * 24);
      this.isNuevo = diff <= 30;
    }
  }

  verDetalle(): void {
    this.router.navigate(['/cuento', this.cuento.id]);
  }

  agregarAlCarrito(): void {
    this.agregar.emit(this.cuento);
  }

  editarCuento(): void {
    this.editar.emit(this.cuento);
  }

  deshabilitarCuento(): void {
    this.deshabilitar.emit(this.cuento);
  }

  cargarImagenPlaceholder(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.onerror = null;
    imgElement.src = 'assets/placeholder-cuento.jpg';
    this.cargandoImagen = false;
  }

  imagenCargada(): void {
    this.cargandoImagen = false;
  }

  compartir(tipo: 'whatsapp' | 'instagram'): void {
    const url = encodeURIComponent(window.location.href + '/cuento/' + this.cuento.id);
    if (tipo === 'whatsapp') {
      window.open(`https://wa.me/?text=${url}`, '_blank');
    } else {
      window.open('https://www.instagram.com/', '_blank');
    }
  }
}
