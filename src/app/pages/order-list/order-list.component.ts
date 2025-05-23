import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Pedido } from '../../model/pedido.model';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  pedidos: Pedido[] = [];
  isLoading: boolean = true;
  errorMensaje: string | null = null;

  constructor(private pedidoService: PedidoService, private router: Router) {}

  ngOnInit(): void {
    this.pedidoService.getOrders().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
        this.errorMensaje = 'No se pudieron cargar los pedidos. Intente más tarde.';
        this.isLoading = false;
      }
    });
  }

  verDetalle(pedidoId: number): void {
    this.router.navigate(['/pedidos', pedidoId]);
  }
}
