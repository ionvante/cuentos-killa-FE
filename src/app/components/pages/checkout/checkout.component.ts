import { Component, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../../services/carrito.service';
import { PedidoService } from '../../../services/pedido.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Pedido, PedidoItem } from '../../../model/pedido.model';
import { User } from '../../../model/user.model';
import { Router } from '@angular/router';
import { MaestrosService } from '../../../services/maestros.service';
import { getDocumentoErrorMessage, getDocumentoRule, getTipoDocumentoLabel } from '../../../utils/documento-utils';
import { FormErrorComponent } from '../../shared/form-error.component';
import { FormHelpComponent } from '../../shared/form-help.component';
import { Maestro } from '../../../model/maestro.model'; @Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormErrorComponent, FormHelpComponent],
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
  loadingDepartamentos = false;
  loadingProvincias = false;
  loadingDistritos = false;
  docMaxLength = 8;
  documentoPlaceholder = '12345678';
  documentoHelpText = 'DNI: 8 dígitos numéricos.';

  // Arrays asincrónicos desde la BD (tabla general / maestros)
  departamentos: any[] = [];
  provincias: any[] = [];
  distritos: any[] = [];
  tiposDocumento: any[] = [];
  tiposEntrega: Maestro[] = [];
  coberturasCourier: Maestro[] = [];
  mensajeCobertura = '';

  readonly CODIGO_ENVIO_COURIER = 'DOMICILIO_COURIER';
  readonly CODIGO_ENVIO_SHALOM = 'ENVIO_SHALOM';

  estimacionEnvio: Record<string, { costo: number; tiempo: string }> = {
    DOMICILIO_COURIER: { costo: 12, tiempo: '24-48 horas' },
    ENVIO_SHALOM: { costo: 18, tiempo: '48-72 horas' }
  };

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
    private maestrosService: MaestrosService,
    private elementRef: ElementRef<HTMLElement>

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
      documentoNumero: this.fb.control('', { validators: getDocumentoRule('DNI').validators, updateOn: 'blur' }),
      correo: this.fb.control('', { validators: [Validators.required, Validators.email], updateOn: 'blur' }),
      telefono: this.fb.control('', { validators: [Validators.required, Validators.pattern(/^\d{9}$/)], updateOn: 'blur' }),

      departamento: ['', Validators.required],
      provincia: [{ value: '', disabled: false }, Validators.required],
      distrito: [{ value: '', disabled: false }, Validators.required],
      calle: this.fb.control('', { validators: [Validators.required], updateOn: 'blur' }),
      referencia: this.fb.control('', { updateOn: 'blur' }),
      ubicacionGps: [''],
      direccion: [''],
      tipoEntrega: ['', Validators.required],
      agenciaRecojo: [''],
      coberturaCourier: [false],
      fallbackMotivo: ['']
    });

    // 2. Obtiene usuario logueado
    const user = this.authService.getUser();

    // 3. Si existe, autocompleta datos básicos y documento
    if (user) {
      this.checkoutForm.patchValue({
        nombre: (user.nombre + ' ' + (user.apellido || '')).trim(),
        correo: user.email || '',
        telefono: user.telefono || '',
        documentoTipo: user.documentoTipo || 'DNI',
        documentoNumero: user.documentoNumero || user.documento || ''
      });

      // Si el usuario tiene direcciones registradas, autocompletar usando selección inteligente
      if (user.direcciones && user.direcciones.length > 0) {
        const dir = this.getBestAddressForCheckout(user.direcciones);
        this.checkoutForm.patchValue({
          departamento: dir.departamento,
          calle: dir.calle,
          referencia: dir.referencia
        });

        // IMPORTANTE: Disparar manualmente la carga de provincias para que se autoseleccione el valor
        if (dir.departamento) {
          this.cargarProvinciasYAutoSeleccionar(dir.departamento, dir.provincia, dir.distrito);
        }
      }
    }

    // 4. Carga el carrito
    this.itemsCarrito = this.cartService.obtenerItems();

    // 5. Recuperar estado del stepper desde session storage (sobrescribe autocompletado si hay algo previo)
    const savedForm = sessionStorage.getItem('checkoutForm');
    if (savedForm) {
      const parsedForm = JSON.parse(savedForm);
      this.checkoutForm.patchValue(parsedForm);
    }

    // 6. Carga inicial de Datos Maestros (Departamentos, Tipos Doc)
    this.loadingDepartamentos = true;
    this.maestrosService.obtenerDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;
        this.loadingDepartamentos = false;
        // Si ya hay un departamento seleccionado por autocompletado o cache, cargar provincias
        const currentDepto = this.checkoutForm.get('departamento')?.value;
        if (currentDepto && this.provincias.length === 0) {
          this.checkoutForm.get('departamento')?.setValue(currentDepto); // Re-dispara el valueChanges
        }
      },
      error: (err) => {
        this.loadingDepartamentos = false;
        console.error('Error cargando departamentos:', err);
      }
    });

    this.maestrosService.obtenerMaestrosPorGrupo('TIPO_DOCUMENTO').subscribe({
      next: (data) => {
        this.tiposDocumento = data ?? [];
        const actual = this.checkoutForm.get('documentoTipo')?.value;
        if (this.tiposDocumento.length > 0 && !this.tiposDocumento.some(t => t.codigo === actual)) {
          this.checkoutForm.get('documentoTipo')?.setValue(this.tiposDocumento[0].codigo);
        }
      },
      error: (err) => {
        console.error('Error cargando tipos de documento:', err);
        this.tiposDocumento = [];
      }
    });

    this.maestrosService.obtenerMaestrosPorGrupo('TIPO_ENTREGA').subscribe({
      next: (data) => {
        this.tiposEntrega = data?.length ? data : this.obtenerFallbackTipoEntrega();
      },
      error: () => {
        this.tiposEntrega = this.obtenerFallbackTipoEntrega();
      }
    });

    this.maestrosService.obtenerMaestrosPorGrupo('COBERTURA_COURIER').subscribe({
      next: (data) => {
        this.coberturasCourier = data ?? [];
      },
      error: () => {
        this.coberturasCourier = [];
      }
    });

    // Gestionar dependencias de UBIGEO (Cascada Departamentos -> Provincias)
    this.checkoutForm.get('departamento')?.valueChanges.subscribe(deptoNombre => {
      if (!deptoNombre) return;

      this.loadingProvincias = true;
      const depto = this.departamentos.find(d => d.nombre === deptoNombre);

      if (depto) {
        this.maestrosService.obtenerProvincias(depto.id).subscribe({
          next: (provs) => {
            this.provincias = provs;
            this.loadingProvincias = false;
            // Si el valor actual de provincia no está en la nueva lista, resetear
            const currentProv = this.checkoutForm.get('provincia')?.value;
            if (!this.provincias.some(p => p.nombre === currentProv)) {
              this.checkoutForm.patchValue({ provincia: '', distrito: '' }, { emitEvent: false });
            }
          },
          error: () => this.loadingProvincias = false
        });
      }
    });

    // Gestionar dependencias de UBIGEO (Cascada Provincias -> Distritos)
    this.checkoutForm.get('provincia')?.valueChanges.subscribe(provNombre => {
      if (!provNombre) return;

      this.loadingDistritos = true;
      const prov = this.provincias.find(p => p.nombre === provNombre);

      if (prov) {
        this.maestrosService.obtenerDistritos(prov.id).subscribe({
          next: (dists) => {
            this.distritos = dists;
            this.loadingDistritos = false;
            const currentDist = this.checkoutForm.get('distrito')?.value;
            if (!this.distritos.some(d => d.nombre === currentDist)) {
              this.checkoutForm.patchValue({ distrito: '' }, { emitEvent: false });
            }
          },
          error: () => this.loadingDistritos = false
        });
      }
    });

    this.checkoutForm.get('distrito')?.valueChanges.subscribe(() => {
      this.evaluarCoberturaCourier();
    });

    this.checkoutForm.get('tipoEntrega')?.valueChanges.subscribe((tipoEntrega) => {
      const agenciaRecojo = this.checkoutForm.get('agenciaRecojo');
      if (!agenciaRecojo) return;

      agenciaRecojo.clearValidators();
      if (tipoEntrega === this.CODIGO_ENVIO_SHALOM) {
        agenciaRecojo.setValidators([Validators.required, Validators.minLength(3)]);
      } else {
        agenciaRecojo.setValue('');
      }
      agenciaRecojo.updateValueAndValidity();
    });

    // Validaciones dinámicas según tipo de documento
    this.checkoutForm.get('documentoTipo')?.valueChanges.subscribe(tipo => {
      this.aplicarReglaDocumento(tipo);
    });
    this.aplicarReglaDocumento(this.checkoutForm.get('documentoTipo')?.value);

    // Guardar en session storage en cada cambio
    this.checkoutForm.valueChanges.subscribe(val => {
      sessionStorage.setItem('checkoutForm', JSON.stringify(val));
    });
  }

  private obtenerFallbackTipoEntrega(): Maestro[] {
    return [
      { grupo: 'TIPO_ENTREGA', codigo: this.CODIGO_ENVIO_COURIER, valor: 'Envío a domicilio (Courier)', estado: true },
      { grupo: 'TIPO_ENTREGA', codigo: this.CODIGO_ENVIO_SHALOM, valor: 'Envío por Shalom', estado: true }
    ];
  }

  getBestAddressForCheckout(direcciones: any[]): any {
    return direcciones.find(d => d.esFacturacion) || direcciones.find(d => d.esPrincipal) || direcciones[0];
  }

  private normalizarTexto(texto: string): string {
    return (texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }

  private evaluarCoberturaCourier(): void {
    const departamento = this.checkoutForm.get('departamento')?.value;
    const provincia = this.checkoutForm.get('provincia')?.value;
    const distrito = this.checkoutForm.get('distrito')?.value;

    if (!departamento || !provincia || !distrito) {
      return;
    }

    const ubigeoEvaluado = `${departamento}|${provincia}|${distrito}`;
    const ubigeoNormalizado = this.normalizarTexto(ubigeoEvaluado);

    const cobertura = this.coberturasCourier.find(c => {
      if (c.estado === false) return false;
      const codigo = this.normalizarTexto(c.codigo || '');
      if (!codigo) return false;
      if (codigo === 'TODOS') return true;

      const [dep, prov, dist] = codigo.split('|');
      const [depSel, provSel, distSel] = ubigeoNormalizado.split('|');

      const matchDep = !dep || dep === '*' || dep === depSel;
      const matchProv = !prov || prov === '*' || prov === provSel;
      const matchDist = !dist || dist === '*' || dist === distSel;
      return matchDep && matchProv && matchDist;
    });

    const tieneCobertura = !!cobertura;
    const fallbackMotivo = tieneCobertura
      ? ''
      : `Sin cobertura courier en ${departamento}, ${provincia}, ${distrito}`;

    this.checkoutForm.patchValue({
      coberturaCourier: tieneCobertura,
      fallbackMotivo
    }, { emitEvent: false });

    if (tieneCobertura) {
      this.checkoutForm.patchValue({ tipoEntrega: this.CODIGO_ENVIO_COURIER }, { emitEvent: true });
      this.mensajeCobertura = '¡Tenemos cobertura courier! Puedes recibir tu pedido en domicilio.';
      return;
    }

    this.checkoutForm.patchValue({ tipoEntrega: this.CODIGO_ENVIO_SHALOM }, { emitEvent: true });
    this.mensajeCobertura = 'No llegamos por courier a este ubigeo. Te sugerimos envío por Shalom para una entrega segura.';
  }

  mostrarCampoAgencia(): boolean {
    return this.checkoutForm.get('tipoEntrega')?.value === this.CODIGO_ENVIO_SHALOM;
  }

  obtenerEtiquetaTipoEntrega(codigo: string): string {
    const tipo = this.tiposEntrega.find(t => t.codigo === codigo);
    return tipo?.valor || codigo;
  }

  obtenerEstimacionEnvioSeleccionado(): { costo: number; tiempo: string } {
    const tipoEntrega = this.checkoutForm.get('tipoEntrega')?.value;
    return this.estimacionEnvio[tipoEntrega] || { costo: 0, tiempo: 'Por confirmar' };
  }

  calcularTotalConEnvio(): number {
    return this.calcularSubtotal() + this.obtenerEstimacionEnvioSeleccionado().costo;
  }

  private cargarProvinciasYAutoSeleccionar(deptoNombre: string, provNombre: string, distNombre: string) {
    this.loadingProvincias = true;
    // Intentar buscar el ID del depto
    this.maestrosService.obtenerDepartamentos().subscribe(deptos => {
      this.departamentos = deptos;
      const depto = deptos.find(d => d.nombre === deptoNombre);
      if (depto) {
        this.maestrosService.obtenerProvincias(depto.id).subscribe(provs => {
          this.provincias = provs;
          this.loadingProvincias = false;
          const prov = provs.find(p => p.nombre === provNombre);
          if (prov) {
            this.checkoutForm.patchValue({ provincia: provNombre }, { emitEvent: false });
            this.loadingDistritos = true;
            this.maestrosService.obtenerDistritos(prov.id).subscribe(dists => {
              this.distritos = dists;
              this.loadingDistritos = false;
              this.checkoutForm.patchValue({ distrito: distNombre }, { emitEvent: false });
            });
          }
        });
      }
    });
  }

  siguientePaso() {
    if (this.esPasoValido(this.pasoActual)) {
      this.pasoActual++;
    } else {
      this.marcarPasoComoTocado(this.pasoActual);
      this.focusFirstInvalidInCurrentStep();
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
        this.checkoutForm.get('calle')?.valid! &&
        this.checkoutForm.get('tipoEntrega')?.valid! &&
        this.checkoutForm.get('agenciaRecojo')?.valid!;
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
      this.checkoutForm.get('tipoEntrega')?.markAsTouched();
      this.checkoutForm.get('agenciaRecojo')?.markAsTouched();
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


  get tipoDocumentoActual(): string {
    return this.checkoutForm.get('documentoTipo')?.value || '';
  }

  get documentoErrorMessage(): string {
    return getDocumentoErrorMessage(this.tipoDocumentoActual);
  }

  getTipoDocumentoLabel(tipo: { codigo?: string; valor?: string; descripcion?: string }): string {
    return getTipoDocumentoLabel(tipo);
  }

  private aplicarReglaDocumento(tipo: string): void {
    const docInput = this.checkoutForm.get('documentoNumero');
    if (!docInput) return;

    const regla = getDocumentoRule(tipo);
    this.docMaxLength = regla.maxLength;
    this.documentoPlaceholder = regla.placeholder;
    this.documentoHelpText = regla.helpText;

    docInput.setValue('');
    docInput.setValidators(regla.validators);
    docInput.updateValueAndValidity();
  }

  enfocarDocumento(): void {
    setTimeout(() => {
      const el = document.getElementById('docNumeroInput');
      if (el) el.focus();
    }, 50);
  }

  /** Filtra el valor del campo de documento según la regla del tipo seleccionado */
  soloNumeros(event: Event): void {
    const input = event.target as HTMLInputElement;
    const regla = getDocumentoRule(this.tipoDocumentoActual);

    if (regla.numericOnly) {
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, regla.maxLength);
    } else {
      input.value = input.value.slice(0, regla.maxLength);
    }

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

  private focusFirstInvalidInCurrentStep(): void {
    const stepFields: Record<number, string[]> = {
      1: ['nombre', 'documentoTipo', 'documentoNumero', 'correo', 'telefono'],
      2: ['departamento', 'provincia', 'distrito', 'calle'],
      3: ['nombre', 'documentoNumero', 'correo', 'telefono', 'direccion']
    };

    const firstInvalid = (stepFields[this.pasoActual] || [])
      .find((name) => this.checkoutForm.get(name)?.invalid);

    if (!firstInvalid) {
      return;
    }

    const element = this.elementRef.nativeElement.querySelector<HTMLElement>(`[formControlName="${firstInvalid}"]`);
    element?.focus();
  }

  getControlAriaDescribedBy(controlName: string, helpId?: string): string {
    const ctrl = this.checkoutForm.get(controlName);
    const errorId = `${controlName}-error`;
    if (ctrl && ctrl.invalid && ctrl.touched) {
      return helpId ? `${helpId} ${errorId}` : errorId;
    }
    return helpId || '';
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
      this.checkoutForm.markAllAsTouched();
      this.focusFirstInvalidInCurrentStep();
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
      tipoEntrega: formData.tipoEntrega,
      ubigeoEvaluado: `${formData.departamento}|${formData.provincia}|${formData.distrito}`,
      fallbackMotivo: formData.fallbackMotivo,
      costoEnvioEstimado: this.obtenerEstimacionEnvioSeleccionado().costo,
      tiempoEntregaEstimado: this.obtenerEstimacionEnvioSeleccionado().tiempo,
      agenciaRecojo: formData.agenciaRecojo,
      items: this.itemsCarrito.map(item => ({
        cuentoId: item.cuento.id,
        nombreCuento: item.cuento.titulo,
        imagenUrl: item.cuento.imagenUrl,
        precioUnitario: item.cuento.precio,
        cantidad: item.cantidad,
        subtotal: item.cuento.precio * item.cantidad
      })),
      total: this.calcularTotalConEnvio(),
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
