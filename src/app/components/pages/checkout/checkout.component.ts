import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../../services/carrito.service';
import { PedidoService } from '../../../services/pedido.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
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
  pasoActual: number = 1;
  isLoading = false;
  gpsLoading = false;

  departamentos = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Junín', 'Lambayeque', 'Cajamarca', 'Puno', 'Loreto'];
  provincias = ['Lima', 'Callao', 'Huancayo', 'Trujillo', 'Arequipa', 'Cusco', 'Chiclayo', 'Piura'];
  distritos = ['Miraflores', 'San Isidro', 'Surco', 'San Borja', 'Barranco', 'La Molina', 'Jesús María', 'Lince', 'Magdalena', 'Pueblo Libre'];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,

  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    // this.itemsCarrito = this.cartService.obtenerItems(); // método debe existir
    // this.checkoutForm = this.fb.group({
    //   nombre: [this.user?.nombre || '', Validators.required],
    //   correo: [this.user?.email || '', [Validators.required, Validators.email]],
    //   direccion: ['', Validators.required],
    //   telefono: [this.user?.telefono || '', Validators.required],
    // });

    // 1. Inicializa el formulario
    this.checkoutForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      calle: ['', Validators.required],
      direccion: [''],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]]
    });

    // 2. Obtiene usuario logueado
    const user = this.authService.getUser();

    // 3. Si existe, autocompleta
    if (user) {
      this.checkoutForm.patchValue({
        nombre: user.nombre + ' ' + user.apellido || '',
        correo: user.email || '',
        // direccion: user.direccion || '',
        telefono: user.telefono || ''
      });
    }

    // 4. Carga el carrito
    this.itemsCarrito = this.cartService.obtenerItems();

    // 5. Recuperar estado del stepper
    const savedForm = sessionStorage.getItem('checkoutForm');
    if (savedForm) {
      this.checkoutForm.patchValue(JSON.parse(savedForm));
    }

    // Guardar en session storage en cada cambio
    this.checkoutForm.valueChanges.subscribe(val => {
      sessionStorage.setItem('checkoutForm', JSON.stringify(val));
    });
  }

  siguientePaso() {
    if (this.esPasoValido(this.pasoActual)) {
      this.pasoActual++;
    } else {
      this.marcarPasoComoTocado(this.pasoActual);
    }
  }

  pasoAnterior() {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  esPasoValido(paso: number): boolean {
    if (paso === 1) {
      return this.checkoutForm.get('nombre')?.valid! &&
        this.checkoutForm.get('correo')?.valid! &&
        this.checkoutForm.get('telefono')?.valid!;
    } else if (paso === 2) {
      return this.checkoutForm.get('departamento')?.valid! &&
        this.checkoutForm.get('provincia')?.valid! &&
        this.checkoutForm.get('distrito')?.valid! &&
        this.checkoutForm.get('calle')?.valid!;
    }
    return true;
  }

  marcarPasoComoTocado(paso: number): void {
    if (paso === 1) {
      this.checkoutForm.get('nombre')?.markAsTouched();
      this.checkoutForm.get('correo')?.markAsTouched();
      this.checkoutForm.get('telefono')?.markAsTouched();
    } else if (paso === 2) {
      this.checkoutForm.get('departamento')?.markAsTouched();
      this.checkoutForm.get('provincia')?.markAsTouched();
      this.checkoutForm.get('distrito')?.markAsTouched();
      this.checkoutForm.get('calle')?.markAsTouched();
    }
  }

  usarGPS(): void {
    if (!navigator.geolocation) return;
    this.gpsLoading = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.checkoutForm.patchValue({
          calle: `Lat: ${pos.coords.latitude.toFixed(5)}, Lng: ${pos.coords.longitude.toFixed(5)}`
        });
        this.gpsLoading = false;
      },
      () => {
        this.gpsLoading = false;
      }
    );
  }

  /** Compose full direccion string before submit */
  private composeDireccion(): void {
    const f = this.checkoutForm.value;
    this.checkoutForm.patchValue({
      direccion: `${f.calle}, ${f.distrito}, ${f.provincia}, ${f.departamento}`
    });
  }

  calcularSubtotal(): number {
    return this.itemsCarrito.reduce((acc, item) => acc + item.cuento.precio * item.cantidad, 0);
  }

  registrarPedido(): void {
    this.composeDireccion();

    // Check essential fields only (address sub-fields compose into direccion)
    const nombre = this.checkoutForm.get('nombre');
    const correo = this.checkoutForm.get('correo');
    const telefono = this.checkoutForm.get('telefono');
    const direccion = this.checkoutForm.get('direccion');

    if (!nombre?.value || !correo?.valid || !telefono?.valid || !direccion?.value) {
      return;
    }

    if (this.itemsCarrito.length === 0) {
      this.toast.show('Tu carrito est\u00e1 vac\u00edo');
      return;
    }
    if (this.isLoading) return; // evita doble submit
    this.isLoading = true;

    const formData = this.checkoutForm.value;

    const pedido: Pedido = {
      Id: 0, // O usa UUID temporal si se espera del backend
      fecha: new Date().toISOString(), // Convert Date to ISO string      
      nombre: formData.nombre,
      correo: formData.correo,
      direccion: formData.direccion,
      telefono: formData.telefono,
      items: this.itemsCarrito.map(item => ({
        cuentoId: item.cuento.id,
        nombreCuento: item.cuento.nombre,
        imagenUrl: item.cuento.imagenUrl,
        precioUnitario: item.cuento.precio,
        cantidad: item.cantidad,
        subtotal: item.cuento.precio * item.cantidad
      })),
      total: this.calcularSubtotal(),
      estado: 'PAGO_PENDIENTE',
      userId: this.user?.id || 0,
      correoUsuario: this.user?.email || ''
    };

    this.pedidoService.registrarPedido(pedido).subscribe({
      next: (resp) => {
        this.cartService.clearCart();
        sessionStorage.removeItem('checkoutForm');
        const pedidoId = resp.id;
        this.router.navigate(['/pago', pedidoId]); // Redirigir a página de pago
      },
      error: (err) => {
        console.error('Error al registrar pedido:', err);
        this.toast.show('Ocurrió un error al registrar el pedido');
        this.isLoading = false;
      }
    });
  }
}
