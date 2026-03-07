import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { CheckoutComponent } from './checkout.component';
import { CartService } from '../../../services/carrito.service';
import { PedidoService } from '../../../services/pedido.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { MaestrosService } from '../../../services/maestros.service';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let pedidoServiceSpy: jasmine.SpyObj<PedidoService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let maestrosServiceSpy: jasmine.SpyObj<MaestrosService>;

  beforeEach(async () => {
    cartServiceSpy = jasmine.createSpyObj('CartService', ['obtenerItems', 'clearCart']);
    pedidoServiceSpy = jasmine.createSpyObj('PedidoService', ['registrarPedido']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUser']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    maestrosServiceSpy = jasmine.createSpyObj('MaestrosService', ['obtenerDepartamentos', 'obtenerMaestrosPorGrupo', 'obtenerProvincias', 'obtenerDistritos']);

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent, RouterTestingModule],
      providers: [
        { provide: CartService, useValue: cartServiceSpy },
        { provide: PedidoService, useValue: pedidoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: MaestrosService, useValue: maestrosServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    authServiceSpy.getUser.and.returnValue(null);
    cartServiceSpy.obtenerItems.and.returnValue([]);
    maestrosServiceSpy.obtenerDepartamentos.and.returnValue(of([]));
    maestrosServiceSpy.obtenerMaestrosPorGrupo.and.returnValue(of([{ grupo: 'TIPO_DOCUMENTO', codigo: 'DNI', valor: 'DNI', estado: true }]));
    maestrosServiceSpy.obtenerProvincias.and.returnValue(of([]));
    maestrosServiceSpy.obtenerDistritos.and.returnValue(of([]));
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
      calle: 'Av Principal 123'
    });

    component.itemsCarrito = [];
    component.registrarPedido();

    expect(toastServiceSpy.show).toHaveBeenCalled();
    expect(pedidoServiceSpy.registrarPedido).not.toHaveBeenCalled();
  });
});
