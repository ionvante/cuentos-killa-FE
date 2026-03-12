import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { CheckoutComponent } from '../../../../../components/pages/checkout/checkout.component';
import { CartService } from '../../../../../services/carrito.service';
import { PedidoService } from '../../../../../services/pedido.service';
import { AuthService } from '../../../../../services/auth.service';
import { ToastService } from '../../../../../services/toast.service';
import { MaestrosService } from '../../../../../services/maestros.service';
import { ClienteService } from '../../../../../services/cliente.service';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let pedidoServiceSpy: jasmine.SpyObj<PedidoService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let maestrosServiceSpy: jasmine.SpyObj<MaestrosService>;
  let clienteServiceSpy: jasmine.SpyObj<ClienteService>;

  beforeEach(async () => {
    cartServiceSpy = jasmine.createSpyObj('CartService', ['obtenerItems', 'clearCart']);
    pedidoServiceSpy = jasmine.createSpyObj('PedidoService', ['registrarPedido']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUser']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    maestrosServiceSpy = jasmine.createSpyObj('MaestrosService', ['obtenerDepartamentos', 'obtenerMaestrosPorGrupo', 'obtenerProvincias', 'obtenerDistritos']);
    clienteServiceSpy = jasmine.createSpyObj('ClienteService', ['getProfile', 'getAddresses', 'createAddress']);

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent, RouterTestingModule],
      providers: [
        { provide: CartService, useValue: cartServiceSpy },
        { provide: PedidoService, useValue: pedidoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: MaestrosService, useValue: maestrosServiceSpy },
        { provide: ClienteService, useValue: clienteServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;

    authServiceSpy.getUser.and.returnValue(null);
    cartServiceSpy.obtenerItems.and.returnValue([]);

    maestrosServiceSpy.obtenerDepartamentos.and.returnValue(of([{ id: '15', nombre: 'Lima' }]));
    maestrosServiceSpy.obtenerMaestrosPorGrupo.and.callFake((grupo: string) => {
      if (grupo === 'TIPO_DOCUMENTO') {
        return of([{ codigo: 'DNI', valor: 'DNI', grupo: 'TIPO_DOCUMENTO', estado: true }]);
      }
      if (grupo === 'TIPO_ENTREGA') {
        return of([
          { codigo: 'DOMICILIO_COURIER', valor: 'Courier', grupo: 'TIPO_ENTREGA', estado: true },
          { codigo: 'ENVIO_SHALOM', valor: 'Shalom', grupo: 'TIPO_ENTREGA', estado: true }
        ]);
      }
      if (grupo === 'COBERTURA_COURIER') {
        return of([{ codigo: 'LIMA|LIMA|MIRAFLORES', valor: 'Cobertura', grupo: 'COBERTURA_COURIER', estado: true }]);
      }
      return of([]);
    });

    maestrosServiceSpy.obtenerProvincias.and.returnValue(of([{ id: '1501', nombre: 'Lima' }]));
    maestrosServiceSpy.obtenerDistritos.and.returnValue(of([{ id: '150122', nombre: 'Miraflores' }]));
    clienteServiceSpy.getProfile.and.returnValue(of(null as any));
    clienteServiceSpy.getAddresses.and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call servicio when cart is empty', () => {
    component.checkoutForm.patchValue({
      nombre: 'John Doe',
      documentoTipo: 'DNI',
      documentoNumero: '12345678',
      correo: 'john@example.com',
      telefono: '123456789',
      departamento: 'Lima',
      provincia: 'Lima',
      distrito: 'Miraflores',
      calle: 'Av Principal 123',
      tipoEntrega: 'DOMICILIO_COURIER'
    });

    component.itemsCarrito = [];
    component.registrarPedido();

    expect(toastServiceSpy.show).toHaveBeenCalled();
    expect(pedidoServiceSpy.registrarPedido).not.toHaveBeenCalled();
  });

  it('should calculate courier coverage for selected ubigeo', () => {
    component.checkoutForm.patchValue({
      departamento: 'Lima',
      provincia: 'Lima',
      distrito: 'Miraflores'
    });

    expect(component.checkoutForm.get('coberturaCourier')?.value).toBeTrue();
    expect(component.checkoutForm.get('fallbackMotivo')?.value).toBe('');
  });

  it('should set fallback reason when ubigeo has no coverage', () => {
    maestrosServiceSpy.obtenerMaestrosPorGrupo.and.callFake((grupo: string) => {
      if (grupo === 'TIPO_DOCUMENTO') return of([{ codigo: 'DNI', valor: 'DNI', grupo: 'TIPO_DOCUMENTO', estado: true }]);
      if (grupo === 'TIPO_ENTREGA') {
        return of([
          { codigo: 'DOMICILIO_COURIER', valor: 'Courier', grupo: 'TIPO_ENTREGA', estado: true },
          { codigo: 'ENVIO_SHALOM', valor: 'Shalom', grupo: 'TIPO_ENTREGA', estado: true }
        ]);
      }
      if (grupo === 'COBERTURA_COURIER') return of([]);
      return of([]);
    });

    component.ngOnInit();
    component.checkoutForm.patchValue({
      departamento: 'Cusco',
      provincia: 'Cusco',
      distrito: 'Santiago'
    });

    expect(component.checkoutForm.get('coberturaCourier')?.value).toBeFalse();
    expect(component.checkoutForm.get('fallbackMotivo')?.value).toContain('Sin cobertura courier');
  });

  it('should autocompletar documento cuando user llega con alias de campos', () => {
    authServiceSpy.getUser.and.returnValue({
      id: 10,
      nombre: 'Ana',
      apellido: 'Pérez',
      correo: 'ana@example.com',
      celular: '999888777',
      tipoDocumento: 'cedula',
      numeroDocumento: 'A123456'
    } as any);

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.checkoutForm.get('documentoTipo')?.value).toBe('CEDULA');
    expect(component.checkoutForm.get('documentoNumero')?.value).toBe('A123456');
  });
});
