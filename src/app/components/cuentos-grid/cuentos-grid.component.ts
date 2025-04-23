import { Component, OnInit  } from '@angular/core';
import { CuentoService, Cuento } from '../../services/cuento.service';

@Component({
  selector: 'app-cuentos-grid',
  templateUrl: './cuentos-grid.component.html',
  styleUrls: ['./cuentos-grid.component.scss'
  ],})
export class CuentosGridComponent implements OnInit {
  cuentos: Cuento[] = [];

  constructor(private cuentoService: CuentoService) {}

  ngOnInit(): void {
    this.cuentoService.obtenerCuentos().subscribe(data => {
      this.cuentos = data;
    });
}
}
