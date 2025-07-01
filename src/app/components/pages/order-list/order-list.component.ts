import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Pedido } from '../../../model/pedido.model';
import { PedidoService } from '../../../services/pedido.service';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-order-list',
  standalone: true, // Ensure standalone is true
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  pedidos: Pedido[] = [];
  isLoading: boolean = true;
  errorMensaje: string | null = null;
  selectedPayment: { [id: number]: string } = {};

  constructor(
    private pedidoService: PedidoService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUser();
    this.pedidoService.getOrders().subscribe({
      next: (data) => {
        this.pedidos = usuario
          ? data.filter(p => p.correoUsuario === usuario.email)
          : [];
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

  irAPago(pedidoId: number): void {
    this.router.navigate(['/pago', pedidoId]);
  }
}
