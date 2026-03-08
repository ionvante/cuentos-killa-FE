import { Component, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../../services/carrito.service';
import { PedidoService } from '../../../services/pedido.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Pedido } from '../../../model/pedido.model';
import { User } from '../../../model/user.model';
import { Router } from '@angular/router';
import { MaestrosService } from '../../../services/maestros.service';
import {
  getDocumentoErrorMessage,
  getDocumentoRule,
  getTipoDocumentoLabel,
  resolveTipoDocumento
} from '../../../utils/documento-utils';
import { FormErrorComponent } from '../../shared/form-error.component';
import { FormHelpComponent } from '../../shared/form-help.component';
import { Maestro } from '../../../model/maestro.model';
import { normalizeUser } from '../../../utils/user-normalizer';

@Component({
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

  pasoActual = 1;
  isLoading = false;
  gpsLoading = false;
  loadingDepartamentos = false;
  loadingProvincias = false;
  loadingDistritos = false;

  isRegisteredUser = false;
  bloquearNombre = false;
  bloquearDocumento = false;

  docMaxLength = 8;
  documentoPlaceholder = '12345678';
  documentoHelpText = 'DNI: 8 digitos numericos.';

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
    this.user = normalizeUser(this.authService.getUser() as any);
  }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.autocompletarDatosUsuarioRegistrado();

    this.itemsCarrito = this.cartService.obtenerItems();

    this.restaurarEstadoFormulario();
    this.cargarDatosMaestros();
    this.configurarDependenciasUbigeo();
    this.configurarTipoEntrega();
    this.configurarDocumento();

    this.checkoutForm.valueChanges.subscribe((val) => {
      const estadoGuardado: any = {
        correo: val.correo,
        telefono: val.telefono,
        calle: val.calle,
        referencia: val.referencia,
        ubicacionGps: val.ubicacionGps
      };

      if (!this.isRegisteredUser) {
        estadoGuardado.nombre = val.nombre;
        estadoGuardado.documentoTipo = val.documentoTipo;
        estadoGuardado.documentoNumero = val.documentoNumero;
      }

      sessionStorage.setItem('checkoutForm', JSON.stringify(estadoGuardado));
    });
  }

  private inicializarFormulario(): void {
    this.checkoutForm = this.fb.group({
      nombre: this.fb.control('', { validators: [Validators.required], updateOn: 'blur' }),
      documentoTipo: ['DNI', Validators.required],
      documentoNumero: this.fb.control('', { validators: getDocumentoRule('DNI').validators, updateOn: 'blur' }),
      correo: this.fb.control('', { validators: [Validators.required, Validators.email], updateOn: 'blur' }),
      telefono: this.fb.control('', { validators: [Validators.required, Validators.pattern(/^\d{9}$/)], updateOn: 'blur' }),

      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      calle: this.fb.control('', { validators: [Validators.required], updateOn: 'blur' }),
      referencia: this.fb.control('', { updateOn: 'blur' }),
      ubicacionGps: [''],
      direccion: [''],
      tipoEntrega: ['', Validators.required],
      agenciaRecojo: [''],
      coberturaCourier: [false],
      fallbackMotivo: ['']
    });
  }

  private autocompletarDatosUsuarioRegistrado(): void {
    const user = this.user;
    if (!user) return;

    const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim();

    this.checkoutForm.patchValue({
      nombre: nombreCompleto,
      correo: user.email || '',
      telefono: user.telefono || '',
      documentoTipo: user.documentoTipo || 'DNI',
      documentoNumero: user.documentoNumero || user.documento || ''
    }, { emitEvent: false });

    this.isRegisteredUser = !!(user.id || user.email);
    this.bloquearNombre = this.isRegisteredUser;
    this.bloquearDocumento = this.isRegisteredUser;
  }

  private restaurarEstadoFormulario(): void {
    const savedForm = sessionStorage.getItem('checkoutForm');
    if (!savedForm) return;

    try {
      const parsedForm = JSON.parse(savedForm);
      const estado: any = {
        correo: parsedForm.correo ?? this.checkoutForm.get('correo')?.value,
        telefono: parsedForm.telefono ?? this.checkoutForm.get('telefono')?.value,
        calle: parsedForm.calle ?? '',
        referencia: parsedForm.referencia ?? '',
        ubicacionGps: parsedForm.ubicacionGps ?? ''
      };

      if (!this.isRegisteredUser) {
        estado.nombre = parsedForm.nombre ?? '';
        estado.documentoTipo = parsedForm.documentoTipo ?? this.checkoutForm.get('documentoTipo')?.value;
        estado.documentoNumero = parsedForm.documentoNumero ?? '';
      }

      this.checkoutForm.patchValue(estado, { emitEvent: false });
    } catch {
      sessionStorage.removeItem('checkoutForm');
    }
  }

  private cargarDatosMaestros(): void {
    this.loadingDepartamentos = true;
    this.maestrosService.obtenerDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data ?? [];
        this.loadingDepartamentos = false;
      },
      error: () => {
        this.loadingDepartamentos = false;
        this.departamentos = [];
      }
    });

    this.maestrosService.obtenerMaestrosPorGrupo('TIPO_DOCUMENTO').subscribe({
      next: (data) => {
        this.tiposDocumento = data ?? [];
        this.sincronizarTipoDocumentoConMaestro();
      },
      error: () => {
        this.tiposDocumento = [];
        this.aplicarReglaDocumento(this.checkoutForm.get('documentoTipo')?.value, false);
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
  }

  private sincronizarTipoDocumentoConMaestro(): void {
    const controlTipo = this.checkoutForm.get('documentoTipo');
    if (!controlTipo || this.tiposDocumento.length === 0) {
      this.aplicarReglaDocumento(controlTipo?.value, false);
      return;
    }

    const actual = controlTipo.value;

    const exacto = this.tiposDocumento.find((t) => String(t.codigo) === String(actual));
    if (exacto) {
      this.aplicarReglaDocumento(exacto.codigo, false);
      return;
    }

    const actualCanonico = resolveTipoDocumento(actual);
    const porAlias = this.tiposDocumento.find((t) => {
      const tipoCatalogo = t?.codigo || t?.valor || t?.descripcion || '';
      return resolveTipoDocumento(tipoCatalogo) === actualCanonico;
    });

    if (porAlias) {
      controlTipo.setValue(porAlias.codigo, { emitEvent: false });
      this.aplicarReglaDocumento(porAlias.codigo, false);
      return;
    }

    controlTipo.setValue(this.tiposDocumento[0].codigo, { emitEvent: false });
    this.aplicarReglaDocumento(this.tiposDocumento[0].codigo, false);
  }

  private configurarDependenciasUbigeo(): void {
    this.checkoutForm.get('departamento')?.valueChanges.subscribe((deptoNombre) => {
      const provinciaActual = this.checkoutForm.get('provincia')?.value;
      const distritoActual = this.checkoutForm.get('distrito')?.value;

      this.provincias = [];
      this.distritos = [];
      this.checkoutForm.patchValue(
        { provincia: '', distrito: '', tipoEntrega: '', coberturaCourier: false, fallbackMotivo: '' },
        { emitEvent: false }
      );
      this.mensajeCobertura = '';

      if (!deptoNombre) return;

      const depto = this.departamentos.find((d) => d.nombre === deptoNombre);
      if (!depto) return;

      this.loadingProvincias = true;
      this.maestrosService.obtenerProvincias(depto.id).subscribe({
        next: (provs) => {
          this.provincias = provs ?? [];
          this.loadingProvincias = false;

          if (provinciaActual && this.provincias.some((p) => p.nombre === provinciaActual)) {
            this.checkoutForm.patchValue({ provincia: provinciaActual }, { emitEvent: false });
            this.cargarDistritosPorProvinciaNombre(provinciaActual, distritoActual);
          }
        },
        error: () => {
          this.loadingProvincias = false;
          this.provincias = [];
        }
      });
    });

    this.checkoutForm.get('provincia')?.valueChanges.subscribe((provNombre) => {
      const distritoActual = this.checkoutForm.get('distrito')?.value;

      this.distritos = [];
      this.checkoutForm.patchValue(
        { distrito: '', tipoEntrega: '', coberturaCourier: false, fallbackMotivo: '' },
        { emitEvent: false }
      );
      this.mensajeCobertura = '';

      if (!provNombre) return;
      this.cargarDistritosPorProvinciaNombre(provNombre, distritoActual);
    });

    this.checkoutForm.get('distrito')?.valueChanges.subscribe(() => {
      this.checkoutForm.patchValue({ tipoEntrega: '' }, { emitEvent: false });
      this.evaluarCoberturaCourier();
    });
  }

  private cargarDistritosPorProvinciaNombre(provNombre: string, distritoPreferido?: string): void {
    const prov = this.provincias.find((p) => p.nombre === provNombre);
    if (!prov) return;

    this.loadingDistritos = true;
    this.maestrosService.obtenerDistritos(prov.id).subscribe({
      next: (dists) => {
        this.distritos = dists ?? [];
        this.loadingDistritos = false;

        if (distritoPreferido && this.distritos.some((d) => d.nombre === distritoPreferido)) {
          this.checkoutForm.patchValue({ distrito: distritoPreferido }, { emitEvent: false });
        }
      },
      error: () => {
        this.loadingDistritos = false;
        this.distritos = [];
      }
    });
  }

  private configurarTipoEntrega(): void {
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
      this.actualizarMensajeCobertura();
    });
  }

  private configurarDocumento(): void {
    this.checkoutForm.get('documentoTipo')?.valueChanges.subscribe((tipo) => {
      this.aplicarReglaDocumento(tipo, true);
    });

    this.aplicarReglaDocumento(this.checkoutForm.get('documentoTipo')?.value, false);
  }

  private obtenerFallbackTipoEntrega(): Maestro[] {
    return [
      { grupo: 'TIPO_ENTREGA', codigo: this.CODIGO_ENVIO_COURIER, valor: 'Envio a domicilio (Courier)', estado: true },
      { grupo: 'TIPO_ENTREGA', codigo: this.CODIGO_ENVIO_SHALOM, valor: 'Envio por Shalom', estado: true }
    ];
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
      this.checkoutForm.patchValue({ coberturaCourier: false, fallbackMotivo: '' }, { emitEvent: false });
      this.actualizarMensajeCobertura();
      return;
    }

    const ubigeoEvaluado = `${departamento}|${provincia}|${distrito}`;
    const ubigeoNormalizado = this.normalizarTexto(ubigeoEvaluado);

    const cobertura = this.coberturasCourier.find((c) => {
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

    this.checkoutForm.patchValue({ coberturaCourier: tieneCobertura, fallbackMotivo }, { emitEvent: false });
    this.actualizarMensajeCobertura();
  }

  private actualizarMensajeCobertura(): void {
    const tipoEntrega = this.checkoutForm.get('tipoEntrega')?.value;
    const tieneCobertura = !!this.checkoutForm.get('coberturaCourier')?.value;

    if (tipoEntrega === this.CODIGO_ENVIO_COURIER) {
      this.mensajeCobertura =
        'El cobro del delivery dependera si esta o no en la zona de cobertura de la empresa repartidora. Los horarios de reparto son coordinados de forma ajena a nuestro control.';
      return;
    }

    if (tipoEntrega === this.CODIGO_ENVIO_SHALOM) {
      this.mensajeCobertura = tieneCobertura
        ? 'Si eliges envio por Shalom, selecciona la agencia para coordinar el recojo.'
        : 'No llegamos por courier a este ubigeo. Te sugerimos envio por Shalom para una entrega segura.';
      return;
    }

    this.mensajeCobertura = '';
  }

  mostrarCampoAgencia(): boolean {
    return this.checkoutForm.get('tipoEntrega')?.value === this.CODIGO_ENVIO_SHALOM;
  }

  obtenerEtiquetaTipoEntrega(codigo: string): string {
    const tipo = this.tiposEntrega.find((t) => t.codigo === codigo);
    return tipo?.valor || codigo;
  }

  obtenerEstimacionEnvioSeleccionado(): { costo: number; tiempo: string } {
    const tipoEntrega = this.checkoutForm.get('tipoEntrega')?.value;
    return this.estimacionEnvio[tipoEntrega] || { costo: 0, tiempo: 'Por confirmar' };
  }

  calcularTotalConEnvio(): number {
    return this.calcularSubtotal() + this.obtenerEstimacionEnvioSeleccionado().costo;
  }

  siguientePaso(): void {
    if (this.esPasoValido(this.pasoActual)) {
      this.pasoActual++;
    } else {
      this.marcarPasoComoTocado(this.pasoActual);
      this.focusFirstInvalidInCurrentStep();
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  esPasoValido(paso: number): boolean {
    if (paso === 1) {
      return (
        this.checkoutForm.get('nombre')?.valid === true &&
        this.checkoutForm.get('documentoTipo')?.valid === true &&
        this.checkoutForm.get('documentoNumero')?.valid === true &&
        this.checkoutForm.get('correo')?.valid === true &&
        this.checkoutForm.get('telefono')?.valid === true
      );
    }

    if (paso === 2) {
      return (
        this.checkoutForm.get('departamento')?.valid === true &&
        this.checkoutForm.get('provincia')?.valid === true &&
        this.checkoutForm.get('distrito')?.valid === true &&
        this.checkoutForm.get('calle')?.valid === true &&
        this.checkoutForm.get('tipoEntrega')?.valid === true &&
        this.checkoutForm.get('agenciaRecojo')?.valid === true
      );
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
      return;
    }

    if (paso === 2) {
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
      this.toast.show('Tu navegador no soporta geolocalizacion.');
      return;
    }

    this.gpsLoading = true;

    const gpsTimeout = setTimeout(() => {
      if (this.gpsLoading) {
        this.gpsLoading = false;
        this.toast.show('Tiempo de espera agotado. Revisa permisos o ingresa la direccion manualmente.');
      }
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(gpsTimeout);
        this.checkoutForm.patchValue({
          ubicacionGps: `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`
        });
        this.gpsLoading = false;
        this.toast.show('Ubicacion obtenida correctamente');
      },
      (error) => {
        clearTimeout(gpsTimeout);
        this.gpsLoading = false;
        if (error.code === error.PERMISSION_DENIED) {
          this.toast.show('Permiso de ubicacion denegado.');
        } else {
          this.toast.show('No se pudo obtener la ubicacion.');
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

  private aplicarReglaDocumento(tipo: string, limpiarNumero = true): void {
    const docInput = this.checkoutForm.get('documentoNumero');
    if (!docInput) return;

    const regla = getDocumentoRule(tipo);
    this.docMaxLength = regla.maxLength;
    this.documentoPlaceholder = regla.placeholder;
    this.documentoHelpText = regla.helpText;

    if (limpiarNumero && !this.bloquearDocumento) {
      docInput.setValue('');
    }

    docInput.setValidators(regla.validators);
    docInput.updateValueAndValidity();
  }

  enfocarDocumento(): void {
    if (this.bloquearDocumento) return;

    setTimeout(() => {
      const el = document.getElementById('docNumeroInput');
      if (el) el.focus();
    }, 50);
  }

  soloNumeros(event: Event): void {
    if (this.bloquearDocumento) return;

    const input = event.target as HTMLInputElement;
    const regla = getDocumentoRule(this.tipoDocumentoActual);

    if (regla.numericOnly) {
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, regla.maxLength);
    } else {
      input.value = input.value.slice(0, regla.maxLength);
    }

    this.checkoutForm.get('documentoNumero')?.setValue(input.value);
  }

  obtenerDireccionResumen(): string {
    const calle = (this.checkoutForm.get('calle')?.value || '').trim();
    const distrito = (this.checkoutForm.get('distrito')?.value || '').trim();
    const provincia = (this.checkoutForm.get('provincia')?.value || '').trim();
    const departamento = (this.checkoutForm.get('departamento')?.value || '').trim();

    const partes = [calle, distrito, provincia, departamento].filter((p) => !!p);
    return partes.length ? partes.join(', ') : 'Sin direccion registrada';
  }

  obtenerReferenciaResumen(): string {
    return (this.checkoutForm.get('referencia')?.value || '').trim();
  }

  private composeDireccion(): void {
    this.checkoutForm.patchValue({ direccion: this.obtenerDireccionResumen() });
  }

  calcularSubtotal(): number {
    return this.itemsCarrito.reduce((acc, item) => acc + item.cuento.precio * item.cantidad, 0);
  }

  private focusFirstInvalidInCurrentStep(): void {
    const stepFields: Record<number, string[]> = {
      1: ['nombre', 'documentoTipo', 'documentoNumero', 'correo', 'telefono'],
      2: ['departamento', 'provincia', 'distrito', 'calle', 'tipoEntrega', 'agenciaRecojo'],
      3: ['nombre', 'documentoNumero', 'correo', 'telefono', 'direccion']
    };

    const firstInvalid = (stepFields[this.pasoActual] || []).find((name) => this.checkoutForm.get(name)?.invalid);
    if (!firstInvalid) return;

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

    const nombre = this.checkoutForm.get('nombre');
    const docNum = this.checkoutForm.get('documentoNumero');
    const correo = this.checkoutForm.get('correo');
    const telefono = this.checkoutForm.get('telefono');
    const direccion = this.checkoutForm.get('direccion');
    const tipoEntrega = this.checkoutForm.get('tipoEntrega');

    if (!nombre?.value || !docNum?.value || !correo?.valid || !telefono?.valid || !direccion?.value || !tipoEntrega?.value) {
      this.checkoutForm.markAllAsTouched();
      this.focusFirstInvalidInCurrentStep();
      return;
    }

    if (this.itemsCarrito.length === 0) {
      this.toast.show('Tu carrito esta vacio');
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const formData = this.checkoutForm.value;

    const pedido: Pedido = {
      Id: 0,
      fecha: new Date().toISOString(),
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
      items: this.itemsCarrito.map((item) => ({
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
        this.router.navigate(['/pago', resp.id]);
      },
      error: (err) => {
        console.error('Error al registrar pedido:', err);
        this.toast.show('Ocurrio un error al registrar el pedido');
        this.isLoading = false;
      }
    });
  }
}
