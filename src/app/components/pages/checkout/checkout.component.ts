import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../../services/carrito.service';
import { PedidoService } from '../../../services/pedido.service';
import { AuthService} from '../../../services/auth.service';
import { Pedido, PedidoItem } from '../../../model/pedido.model';
import { User } from '../../../model/user.model';
import { Router } from '@angular/router';


@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  
  checkoutForm!: FormGroup;
  itemsCarrito: any[] = [];
  user: User | null;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router,

  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.itemsCarrito = this.cartService.obtenerItems(); // método debe existir
    this.checkoutForm = this.fb.group({
      nombre: [this.user?.nombre || '', Validators.required],
      correo: [this.user?.correo || '', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      telefono: [this.user?.telefono || '', Validators.required],
    });
    
  }
  calcularSubtotal(): number {
    return this.itemsCarrito.reduce((acc, item) => acc + item.cuento.precio * item.cantidad, 0);
  }

  registrarPedido(): void {
    if (this.checkoutForm.invalid) return;
  
    const formData = this.checkoutForm.value;
  
    const pedido: Pedido = {
      nombre: formData.nombre,
      correo: formData.correo,
      direccion: formData.direccion,
      telefono: formData.telefono,
      items: this.itemsCarrito.map(item => ({
        cuentoId: item.cuento.id,
        cantidad: item.cantidad
      })),
      total: this.calcularSubtotal(),
      estado: 'PAGO PENDIENTE'
    };
  
    this.pedidoService.registrarPedido(pedido).subscribe({
      next: (resp) => {
        console.log('Pedido registrado con éxito:', resp);
        alert('Pedido registrado correctamente');
        this.cartService.clearCart();
      },
      error: (err) => {
        console.error('Error al registrar pedido:', err);
        alert('Ocurrió un error al registrar el pedido');
      }
    });
  }
}
