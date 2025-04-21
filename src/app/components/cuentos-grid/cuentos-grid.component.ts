import { Component } from '@angular/core';

@Component({
  selector: 'app-cuentos-grid',
  templateUrl: './cuentos-grid.component.html',
  styleUrls: ['./cuentos-grid.component.scss']
})
export class CuentosGridComponent {
  cuentos = [
    { titulo: 'La luna encantada', autor: 'Daniel Pérez' },
    { titulo: 'El zorro sabio', autor: 'Meli Rosales' }
  ];
}
