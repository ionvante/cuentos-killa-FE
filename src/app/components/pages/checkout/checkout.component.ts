import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../../services/carrito.service';
import { CommonModule } from '@angular/common';

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

  constructor(private fb: FormBuilder, private cartService: CartService) {}

  ngOnInit(): void {
    this.itemsCarrito = this.cartService.obtenerItems(); // método debe existir
    this.checkoutForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
    });
  }

  calcularSubtotal(): number {
    return this.itemsCarrito.reduce((acc, item) => acc + item.cuento.precio * item.cantidad, 0);
  }

  registrarPedido(): void {
    if (this.checkoutForm.invalid) return;

    const datosPedido = {
      ...this.checkoutForm.value,
      items: this.itemsCarrito,
      total: this.calcularSubtotal(),
      estado: 'PAGO PENDIENTE'
    };

    // Aquí deberías conectar con tu API (o Firebase)
    console.log('Registrando pedido:', datosPedido);
  }
}
