import { Component, OnInit } from '@angular/core';
import { Cuento } from '../../../../model/cuento.model';

@Component({
  selector: 'app-admin-cuentos',
  standalone: true,
  imports: [],
  templateUrl: './admin-cuentos.component.html',
  styleUrl: './admin-cuentos.component.scss'
})
export class AdminCuentosComponent implements OnInit {
  // cuentos = [
  //   { titulo: 'Mi primer cuento', autor: 'Daniel Pérez', stock: 12, precio: 40 },
  //   { titulo: 'Animales domésticos', autor: 'Killary', stock: 8, precio: 35 }
  // ];

  constructor() {}

  ngOnInit(): void {


  }
}
