import { Component, OnInit } from '@angular/core';
import { RouterModule,ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.scss'
})
export class PagoComponent  implements OnInit {
  pedidoId: number = 0;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.pedidoId = Number(this.route.snapshot.paramMap.get('id'));
  }

  pagarConMercadoPago(): void {
    // Redirige o llama al backend para generar link de MercadoPago
    window.location.href = `http://localhost:8080/api/mercado-pago/pagar/${this.pedidoId}`;
  }
}
