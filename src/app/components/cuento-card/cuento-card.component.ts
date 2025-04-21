import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cuento-card',
  templateUrl: './cuento-card.component.html',
  styleUrls: ['./cuento-card.component.scss']
})
export class CuentoCardComponent {
  @Input() titulo = 'Título del cuento';
  @Input() autor = 'Autor';
}
