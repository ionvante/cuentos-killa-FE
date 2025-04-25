import { Component, Input } from '@angular/core';
import { Cuento } from '../../model/cuento.model'; // ajusta el path según tu estructura


@Component({
  selector: 'app-cuento-card',
  templateUrl: './cuento-card.component.html',
  styleUrls: ['./cuento-card.component.scss']
})
export class CuentoCardComponent {
  // @Input() titulo = 'Título del cuento';
  // @Input() autor = 'Autor';
  @Input() cuento!: Cuento;
}
