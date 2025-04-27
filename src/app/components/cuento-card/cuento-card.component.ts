import { Component, Input } from '@angular/core';
import { Cuento } from '../../model/cuento.model'; // ajusta el path según tu estructura
import { CartService } from '../../services/carrito.service';



@Component({
  selector: 'app-cuento-card',
  templateUrl: './cuento-card.component.html',
  styleUrls: ['./cuento-card.component.scss']
})
export class CuentoCardComponent {
  @Input() cuento!: Cuento;

  constructor(private cartService: CartService) {}

  agregarAlCarrito() {
    this.cartService.addItem(this.cuento);
  }
}
