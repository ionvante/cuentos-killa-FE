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
import { UBIGEO_PERU, Departamento, Provincia, Distrito } from '../../../data/ubigeo';


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
  loadingProvincias = false;
  loadingDistritos = false;
  docMaxLength = 8;  // DNI=8, CE=9, Pasaporte=12

  departamentos: Departamento[] = UBIGEO_PERU;
  provincias: Provincia[] = [];
  distritos: Distrito[] = [];

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
      nombre: this.fb.control('', { validators: [Validators.required], updateOn: 'blur' }),
      documentoTipo: ['DNI', Validators.required],
      documentoNumero: this.fb.control('', { validators: [Validators.required, Validators.pattern(/^\d{8}$/)], updateOn: 'blur' }),
      correo: this.fb.control('', { validators: [Validators.required, Validators.email], updateOn: 'blur' }),
      telefono: this.fb.control('', { validators: [Validators.required, Validators.pattern(/^\d{9}$/)], updateOn: 'blur' }),

      departamento: ['', Validators.required],
      provincia: [{ value: '', disabled: false }, Validators.required],
      distrito: [{ value: '', disabled: false }, Validators.required],
      calle: this.fb.control('', { validators: [Validators.required], updateOn: 'blur' }),
      referencia: this.fb.control('', { updateOn: 'blur' }),
      ubicacionGps: [''],
      direccion: [''],
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
      const parsedForm = JSON.parse(savedForm);
      // Restore ubigeo cascades manually before patching
      if (parsedForm.departamento) {
        const d = this.departamentos.find(dept => dept.nombre === parsedForm.departamento);
        this.provincias = d ? d.provincias : [];
      }
      if (parsedForm.provincia) {
        const p = this.provincias.find(prov => prov.nombre === parsedForm.provincia);
        this.distritos = p ? p.distritos : [];
      }
      this.checkoutForm.patchValue(parsedForm);
    }

    // Gestionar dependencias de UBIGEO
    this.checkoutForm.get('departamento')?.valueChanges.subscribe(deptoNombre => {
      this.loadingProvincias = true;
      this.checkoutForm.get('provincia')?.disable({ emitEvent: false });

      setTimeout(() => {
        const depto = this.departamentos.find(d => d.nombre === deptoNombre);
        this.provincias = depto ? depto.provincias : [];
        this.distritos = [];
        this.checkoutForm.patchValue({ provincia: '', distrito: '' }, { emitEvent: false });
        this.checkoutForm.get('provincia')?.enable({ emitEvent: false });
        this.loadingProvincias = false;
      }, 400);
    });

    this.checkoutForm.get('provincia')?.valueChanges.subscribe(provId => {
      this.loadingDistritos = true;
      this.checkoutForm.get('distrito')?.disable({ emitEvent: false });

      setTimeout(() => {
        const prov = this.provincias.find(p => p.nombre === provId);
        this.distritos = prov ? prov.distritos : [];
        this.checkoutForm.patchValue({ distrito: '' }, { emitEvent: false });
        this.checkoutForm.get('distrito')?.enable({ emitEvent: false });
        this.loadingDistritos = false;
      }, 400);
    });

    // Validaciones dinámicas según tipo de documento
    this.checkoutForm.get('documentoTipo')?.valueChanges.subscribe(tipo => {
      const docInput = this.checkoutForm.get('documentoNumero');
      if (docInput) {
        docInput.setValue(''); // Limpiar al cambiar tipo
        docInput.clearValidators();
        if (tipo === 'DNI') {
          this.docMaxLength = 8;
          docInput.setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
        } else if (tipo === 'CE') {
          this.docMaxLength = 9;
          docInput.setValidators([Validators.required, Validators.pattern(/^\d{9}$/)]);
        } else {
          this.docMaxLength = 12;
          docInput.setValidators([Validators.required, Validators.minLength(5)]);
        }
        docInput.updateValueAndValidity();
      }
    });

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
        this.checkoutForm.get('documentoTipo')?.valid! &&
        this.checkoutForm.get('documentoNumero')?.valid! &&
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
      this.checkoutForm.get('documentoTipo')?.markAsTouched();
      this.checkoutForm.get('documentoNumero')?.markAsTouched();
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
    if (!navigator.geolocation) {
      this.toast.show('Tu navegador no soporta geolocalización.');
      return;
    }

    this.gpsLoading = true;

    const gpsTimeout = setTimeout(() => {
      if (this.gpsLoading) {
        this.gpsLoading = false;
        this.toast.show('Tiempo de espera agotado. Revisa permisos o ingresa la dirección manualmente.');
      }
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(gpsTimeout);
        this.checkoutForm.patchValue({
          ubicacionGps: `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`
        });
        this.gpsLoading = false;
        this.toast.show('Ubicación obtenida correctamente');
      },
      (error) => {
        clearTimeout(gpsTimeout);
        this.gpsLoading = false;
        if (error.code === error.PERMISSION_DENIED) {
          this.toast.show('Permiso de ubicación denegado.');
        } else {
          this.toast.show('No se pudo obtener la ubicación.');
        }
      },
      { timeout: 10000 }
    );
  }

  enfocarDocumento(): void {
    setTimeout(() => {
      const el = document.getElementById('docNumeroInput');
      if (el) el.focus();
    }, 50);
  }

  /** Filtra cualquier caracter no numérico del campo de documento */
  soloNumeros(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, this.docMaxLength);
    this.checkoutForm.get('documentoNumero')?.setValue(input.value);
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
    const docNum = this.checkoutForm.get('documentoNumero');
    const correo = this.checkoutForm.get('correo');
    const telefono = this.checkoutForm.get('telefono');
    const direccion = this.checkoutForm.get('direccion');

    if (!nombre?.value || !docNum?.value || !correo?.valid || !telefono?.valid || !direccion?.value) {
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
      documentoTipo: formData.documentoTipo,
      documentoNumero: formData.documentoNumero,
      correo: formData.correo,
      direccion: formData.direccion,
      referencia: formData.referencia,
      ubicacionGps: formData.ubicacionGps,
      telefono: formData.telefono,
      items: this.itemsCarrito.map(item => ({
        cuentoId: item.cuento.id,
        nombreCuento: item.cuento.titulo,
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
