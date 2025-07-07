import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPedidosComponent } from './admin-pedidos.component';
import { PedidoService } from '../../../../services/pedido.service';
import { InputDialogComponent } from '../../../input-dialog/input-dialog.component';
import { ModalComponent } from '../../../app-modal/modal.component';

describe('AdminPedidosComponent', () => {
  let component: AdminPedidosComponent;
  let fixture: ComponentFixture<AdminPedidosComponent>;
  let pedidoServiceSpy: jasmine.SpyObj<PedidoService>;

  beforeEach(async () => {
    pedidoServiceSpy = jasmine.createSpyObj('PedidoService', ['updateOrderStatus']);

    await TestBed.configureTestingModule({
      imports: [AdminPedidosComponent, InputDialogComponent, ModalComponent],
      providers: [{ provide: PedidoService, useValue: pedidoServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open dialog on rechazarPago and call service on confirm', () => {
    component.selectedPedido = { id: 1 } as any;
    component.rechazarPago();
    expect(component.showReasonDialog).toBeTrue();
    component.confirmarRechazo('no valido');
    expect(pedidoServiceSpy.updateOrderStatus).toHaveBeenCalledWith(1, 'PAGO_RECHAZADO', 'no valido');
  });

  it('should not call service when canceling', () => {
    component.selectedPedido = { id: 2 } as any;
    component.rechazarPago();
    component.cancelarRechazo();
    expect(component.showReasonDialog).toBeFalse();
    expect(pedidoServiceSpy.updateOrderStatus).not.toHaveBeenCalled();
  });

  describe('trackByPedidoId', () => {
    it('should return Id when present', () => {
      const pedido: any = { Id: 10 };
      expect(component.trackByPedidoId(0, pedido)).toBe(10);
    });

    it('should fall back to id when Id is undefined', () => {
      const pedido: any = { id: 5 };
      expect(component.trackByPedidoId(1, pedido)).toBe(5);
    });
  });
});
