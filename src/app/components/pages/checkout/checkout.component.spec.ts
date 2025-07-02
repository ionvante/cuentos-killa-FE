import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { CheckoutComponent } from './checkout.component';
import { CartService } from '../../../services/carrito.service';
import { PedidoService } from '../../../services/pedido.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let pedidoServiceSpy: jasmine.SpyObj<PedidoService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    cartServiceSpy = jasmine.createSpyObj('CartService', ['obtenerItems', 'clearCart']);
    pedidoServiceSpy = jasmine.createSpyObj('PedidoService', ['registrarPedido']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUser']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent, RouterTestingModule],
      providers: [
        { provide: CartService, useValue: cartServiceSpy },
        { provide: PedidoService, useValue: pedidoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    authServiceSpy.getUser.and.returnValue(null);
    cartServiceSpy.obtenerItems.and.returnValue([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call servicio when cart is empty', () => {
    component.checkoutForm.setValue({
      nombre: 'John Doe',
      correo: 'john@example.com',
      direccion: 'Calle 1',
      telefono: '123456789'
    });

    component.itemsCarrito = [];
    component.registrarPedido();

    expect(toastServiceSpy.show).toHaveBeenCalled();
    expect(pedidoServiceSpy.registrarPedido).not.toHaveBeenCalled();
  });
});
