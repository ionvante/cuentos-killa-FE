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
    pedidoServiceSpy = jasmine.createSpyObj('PedidoService', ['rejectVoucher']);

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
    expect(pedidoServiceSpy.rejectVoucher).toHaveBeenCalledWith(1, 'no valido');
  });

  it('should not call service when canceling', () => {
    component.selectedPedido = { id: 2 } as any;
    component.rechazarPago();
    component.cancelarRechazo();
    expect(component.showReasonDialog).toBeFalse();
    expect(pedidoServiceSpy.rejectVoucher).not.toHaveBeenCalled();
  });
});
