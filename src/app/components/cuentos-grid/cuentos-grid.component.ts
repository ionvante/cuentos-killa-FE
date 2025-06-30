import { Component, OnInit } from '@angular/core';
import { CuentoService } from '../../services/cuento.service';
import { Cuento } from '../../model/cuento.model';
import { Router } from '@angular/router';
import { CartService } from '../../services/carrito.service';

@Component({
  selector: 'app-cuentos-grid',
  templateUrl: './cuentos-grid.component.html',
  styleUrls: ['./cuentos-grid.component.scss'],
})

export class CuentosGridComponent implements OnInit {

  cuentos: Cuento[] = [];
  constructor(private cuentoService: CuentoService, private cartService: CartService, private router: Router) { }
  ngOnInit(): void {
    this.cuentoService.obtenerCuentos().subscribe(data => {
      this.cuentos = data;
    });
  }

  verDetalle(id: number) :void {
    this.router.navigate(['/cuento', id]);
  }

  agregarAlCarrito(cuento: Cuento): void {
    this.cartService.addItem(cuento);
  }

}







