import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Cuento } from '../../model/cuento.model'; // ajusta el path según tu estructura
import { CartService } from '../../services/carrito.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-cuento-card',
  templateUrl: './cuento-card.component.html',
  styleUrls: ['./cuento-card.component.scss'],
  
})
export class CuentoCardComponent {
  @Input() cuento!: Cuento;
  @Output() agregar = new EventEmitter<Cuento>();
  @Output() detalle = new EventEmitter<number>();
  cargandoImagen: boolean = true; // 🔥 Nueva bandera para el skeleton
  constructor(private cartService: CartService,private router: Router) {}

  verDetalle(): void {
    // this.detalle.emit(this.cuento.id);
    this.router.navigate(['/cuento', this.cuento.id]);
  }

  agregarAlCarrito(): void {
    this.agregar.emit(this.cuento);
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
}
