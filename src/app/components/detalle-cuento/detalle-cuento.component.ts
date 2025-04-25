import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CuentoService } from './../../services/cuento.service';
import { Cuento } from './../../model/cuento.model';
import { CarritoService } from '../../services/CarritoService';


@Component({
  selector: 'app-detalle-cuento',
  templateUrl: './detalle-cuento.component.html',
  styleUrls: ['./detalle-cuento.component.scss']
})
export class DetalleCuentoComponent implements OnInit {
  cuento?: Cuento;

  constructor(
    private route: ActivatedRoute,
    private cuentoService: CuentoService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cuentoService.getCuentoById(+id).subscribe(data => {
        this.cuento = data;
      });
    }
  }
  agregarAlCarrito() {
    if (this.cuento) {
      // Aquí deberías llamar al servicio de carrito
      // por ejemplo:
      this.carritoService.agregarAlCarrito(this.cuento);
      alert(`"${this.cuento.titulo}" fue agregado al carrito.`);
    }
  }
}