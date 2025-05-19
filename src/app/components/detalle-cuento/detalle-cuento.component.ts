import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CuentoService } from './../../services/cuento.service';
import { Cuento } from './../../model/cuento.model';
import { CartService } from '../../services/carrito.service';



@Component({
  selector: 'app-detalle-cuento',
  templateUrl: './detalle-cuento.component.html',
  styleUrls: ['./detalle-cuento.component.scss']
})
export class DetalleCuentoComponent implements OnInit {
  cuento?: Cuento;
  cargandoImagen: boolean = true; // 🔥 Nueva bandera para el skeleton

  constructor(
    private route: ActivatedRoute,
    private cuentoService: CuentoService,
    private carritoService: CartService
  ) { }

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
      this.carritoService.addItem(this.cuento);
    }
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