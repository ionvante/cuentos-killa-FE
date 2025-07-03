import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AdminDashboardComponent } from './admin-dashboard.component';
import { CuentoService } from '../../../../services/cuento.service';
import { PedidoService } from '../../../../services/pedido.service';
import { UserService } from '../../../../services/user.service';
import { Cuento } from '../../../../model/cuento.model';
import { Pedido } from '../../../../model/pedido.model';
import { User } from '../../../../model/user.model';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let cuentoServiceSpy: jasmine.SpyObj<CuentoService>;
  let pedidoServiceSpy: jasmine.SpyObj<PedidoService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    cuentoServiceSpy = jasmine.createSpyObj('CuentoService', ['obtenerCuentos']);
    pedidoServiceSpy = jasmine.createSpyObj('PedidoService', ['getOrders']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['obtenerUsuarios']);

    await TestBed.configureTestingModule({
      declarations: [AdminDashboardComponent],
      providers: [
        { provide: CuentoService, useValue: cuentoServiceSpy },
        { provide: PedidoService, useValue: pedidoServiceSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update counters with data from services', () => {
    cuentoServiceSpy.obtenerCuentos.and.returnValue(of([{} as Cuento, {} as Cuento]));
    pedidoServiceSpy.getOrders.and.returnValue(of([{} as Pedido]));
    userServiceSpy.obtenerUsuarios.and.returnValue(of([{} as User, {} as User, {} as User]));

    fixture.detectChanges();

    expect(component.cuentosPublicados).toBe(2);
    expect(component.pedidosEnProceso).toBe(1);
    expect(component.usuariosRegistrados).toBe(3);
    expect(component.usuarios.length).toBe(3);
    expect(component.cuentosTrend.length).toBeGreaterThanOrEqual(5);
    expect(component.pedidosTrend.length).toBeGreaterThanOrEqual(5);
    expect(component.usuariosTrend.length).toBeGreaterThanOrEqual(5);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMensaje).toBeNull();
  });

  it('should handle service errors', () => {
    cuentoServiceSpy.obtenerCuentos.and.returnValue(throwError(() => new Error('error')));
    pedidoServiceSpy.getOrders.and.returnValue(of([]));
    userServiceSpy.obtenerUsuarios.and.returnValue(of([]));

    fixture.detectChanges();

    expect(component.errorMensaje).toBe('Error al cargar estadísticas. Reintentar');
    expect(component.isLoading).toBeFalse();
  });
});
