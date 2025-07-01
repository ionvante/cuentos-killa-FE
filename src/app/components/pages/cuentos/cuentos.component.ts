import { Component, OnInit } from '@angular/core';
import { Cuento } from '../../../model/cuento.model';
import { CuentoService } from '../../../services/cuento.service';
import { CartService } from '../../../services/carrito.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cuentos-page',
  templateUrl: './cuentos.component.html',
  styleUrls: ['./cuentos.component.scss']
})
export class CuentosComponent implements OnInit {
  cuentos: Cuento[] = [];
  searchTerm = '';
  sortOption: 'fecha' | 'alfabetico' | 'precio' = 'fecha';

  constructor(
    private cuentoService: CuentoService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cuentoService.obtenerCuentos().subscribe(data => {
      this.cuentos = data
        .sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime())
        .slice(0, 20);
    });
  }

  get filteredCuentos(): Cuento[] {
    let filtered = this.cuentos.filter(c =>
      c.titulo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      c.autor.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    switch (this.sortOption) {
      case 'alfabetico':
        filtered = filtered.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case 'precio':
        filtered = filtered.sort((a, b) => a.precio - b.precio);
        break;
      default:
        filtered = filtered.sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime());
    }
    return filtered;
  }

  agregarAlCarrito(cuento: Cuento): void {
    this.cartService.addItem(cuento);
  }

  verDetalle(id: number): void {
    this.router.navigate(['/cuento', id]);
  }
}
