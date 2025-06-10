import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../../services/pedido.service';
import { Pedido } from '../../../../model/pedido.model';

@Component({
  selector: 'app-admin-pedidos',
  // standalone: true,
  // imports: [CommonModule],
  templateUrl: './admin-pedidos.component.html',
  styleUrl: './admin-pedidos.component.scss'
})
export class AdminPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  isLoading = true;
  errorMensaje: string | null = null;

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.pedidoService.getOrders().subscribe({
      next: data => {
         this.pedidos = data
        //   .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        //   .slice(0, 5);
       this.isLoading = false; 
      },
      error: err => {
        console.error('Error fetching orders:', err);
        this.errorMensaje = 'No se pudieron cargar los pedidos';
        this.isLoading = false;
      }
    });
  }
}
