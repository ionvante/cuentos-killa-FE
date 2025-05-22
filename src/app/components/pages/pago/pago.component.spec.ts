import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { CommonModule } from '@angular/common'; // PagoComponent is standalone, but good for TestBed consistency if it weren't
import { RouterTestingModule } from '@angular/router/testing';

import { PagoComponent } from './pago.component';
import { PagoService } from '../../../../services/pago.service';
import { PedidoService } from '../../../../services/pedido/pedido.service';

// Mocks
class MockActivatedRoute {
  snapshot = {
    paramMap: convertToParamMap({ id: '1' }) // Default pedidoId for tests
  };
  private queryParamsSubject = new Subject<ParamMap>();
  queryParamMap = this.queryParamsSubject.asObservable();

  setQueryParamMap(params: any) {
    this.queryParamsSubject.next(convertToParamMap(params));
  }
}

class MockPagoService {
  confirmarPagoMercadoPago = jasmine.createSpy('confirmarPagoMercadoPago').and.returnValue(of({ message: 'Pago confirmado' }));
}

class MockPedidoService {
  getOrderStatus = jasmine.createSpy('getOrderStatus').and.returnValue(of({ estado: 'PENDIENTE DE PAGO' }));
  uploadVoucher = jasmine.createSpy('uploadVoucher').and.returnValue(of({ message: 'Voucher subido' }));
}

describe('PagoComponent', () => {
  let component: PagoComponent;
  let fixture: ComponentFixture<PagoComponent>;
  let mockActivatedRoute: MockActivatedRoute;
  let mockPagoService: MockPagoService;
  let mockPedidoService: MockPedidoService;
  let windowSpy: any;

  beforeEach(async () => {
    mockActivatedRoute = new MockActivatedRoute();
    mockPagoService = new MockPagoService();
    mockPedidoService = new MockPedidoService();

    await TestBed.configureTestingModule({
      imports: [
        PagoComponent, // Component is standalone, so it brings its own CommonModule etc.
        RouterTestingModule // For routerLink, router-outlet etc. if used, good to have
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PagoService, useValue: mockPagoService },
        { provide: PedidoService, useValue: mockPedidoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PagoComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges(); // We'll call this in each test or after setting queryParams

    // Spy on window.alert
    spyOn(window, 'alert').and.stub();
    // Spy on console.log and console.error
    spyOn(console, 'log').and.stub();
    spyOn(console, 'error').and.stub();

    // For window.location.href
    // Store the original window.location
    const originalLocation = window.location;
    // Create a spy for window.location.href
    windowSpy = spyOnProperty(window, 'location', 'get').and.returnValue(
      // @ts-ignore
      { ...originalLocation, href: '' } 
    );
    // We need to be able to set href, so we also spy on the 'set' accessor if possible,
    // or re-assign `window.location` if necessary and possible in test env.
    // For simplicity here, we'll check the value assigned to `window.location.href`.
    // A more robust way is to use a spy object for location.
  });

  it('should create', () => {
    fixture.detectChanges(); // Initial binding
    expect(component).toBeTruthy();
  });

  it('should fetch order status on init', () => {
    fixture.detectChanges();
    expect(mockPedidoService.getOrderStatus).toHaveBeenCalledWith(1); // pedidoId is '1' from ActivatedRoute mock
    expect(component.orderStatus).toBe('PENDIENTE DE PAGO');
  });

  describe('ngOnInit - Mercado Pago Callback', () => {
    it('should confirm payment if collection_status is "approved" and external_reference matches pedidoId', fakeAsync(() => {
      mockActivatedRoute.setQueryParamMap({
        status: 'approved', // General status, can be used
        collection_status: 'approved', // Specific status for Mercado Pago
        external_reference: '1'
      });
      fixture.detectChanges(); // Trigger ngOnInit and queryParamMap subscription
      tick(); // Process observables

      expect(mockPagoService.confirmarPagoMercadoPago).toHaveBeenCalledWith(1);
      expect(component.orderStatus).toBe('Pago Verificado');
      expect(window.alert).toHaveBeenCalledWith('¡Pago con Mercado Pago confirmado exitosamente! Estado del pedido actualizado a Pago Verificado.');
      expect(mockPedidoService.getOrderStatus).toHaveBeenCalledTimes(2); // Initial + after MP confirmation
    }));

    it('should handle error if confirmarPagoMercadoPago fails', fakeAsync(() => {
      mockPagoService.confirmarPagoMercadoPago.and.returnValue(throwError(() => new Error('Confirmation Failed')));
      mockActivatedRoute.setQueryParamMap({
        collection_status: 'approved',
        external_reference: '1'
      });
      fixture.detectChanges();
      tick();

      expect(mockPagoService.confirmarPagoMercadoPago).toHaveBeenCalledWith(1);
      expect(window.alert).toHaveBeenCalledWith('Error al confirmar el pago con Mercado Pago. Por favor, contacta a soporte.');
      expect(component.orderStatus).not.toBe('Pago Verificado'); // or check it remains initial/fetched one
      expect(mockPedidoService.getOrderStatus).toHaveBeenCalledTimes(2); // Initial + after MP error
    }));

    it('should alert and fetch status if payment status is not "approved" but external_reference matches', fakeAsync(() => {
      mockActivatedRoute.setQueryParamMap({
        status: 'pending', // General status from MP
        collection_status: 'pending', // More specific status
        external_reference: '1'
      });
      fixture.detectChanges();
      tick();

      expect(mockPagoService.confirmarPagoMercadoPago).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('El pago con Mercado Pago está pending.');
      expect(mockPedidoService.getOrderStatus).toHaveBeenCalledTimes(2); // Initial + after MP pending
    }));
    
    it('should NOT confirm payment if external_reference does not match pedidoId', fakeAsync(() => {
      mockActivatedRoute.setQueryParamMap({
        collection_status: 'approved',
        external_reference: '2' // Mismatched ID
      });
      fixture.detectChanges();
      tick();

      expect(mockPagoService.confirmarPagoMercadoPago).not.toHaveBeenCalled();
      expect(component.orderStatus).toBe('PENDIENTE DE PAGO'); // Stays initial
    }));

    it('should NOT confirm payment if collection_status is not "approved"', fakeAsync(() => {
      mockActivatedRoute.setQueryParamMap({
        collection_status: 'rejected',
        external_reference: '1'
      });
      fixture.detectChanges();
      tick();

      expect(mockPagoService.confirmarPagoMercadoPago).not.toHaveBeenCalled();
       // The component logic also checks for 'status' if 'collection_status' isn't 'approved'.
       // If status is also not 'approved' (e.g. 'rejected'), it alerts.
      expect(window.alert).toHaveBeenCalledWith('El pago con Mercado Pago está rejected.');
      expect(component.orderStatus).toBe('PENDIENTE DE PAGO'); // Stays initial
    }));

    it('should not call confirmarPagoMercadoPago if no relevant query params are present', fakeAsync(() => {
      mockActivatedRoute.setQueryParamMap({}); // No MP params
      fixture.detectChanges();
      tick();

      expect(mockPagoService.confirmarPagoMercadoPago).not.toHaveBeenCalled();
      expect(component.orderStatus).toBe('PENDIENTE DE PAGO');
    }));
  });

  describe('pagarConMercadoPago', () => {
    it('should redirect to the correct Mercado Pago URL', () => {
      component.pedidoId = 5; // Set a pedidoId for the component instance
      fixture.detectChanges();
      
      component.pagarConMercadoPago();
      // @ts-ignore
      expect(window.location.href).toBe('http://localhost:8080/api/mercado-pago/pagar/5');
    });
  });
  
  // Example test for onVoucherSelected and uploadVoucher (not part of this subtask but good for completeness)
  describe('Voucher Upload', () => {
    it('onVoucherSelected should set selectedFile', () => {
      const mockFile = new File([''], 'voucher.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [mockFile] } };
      component.onVoucherSelected(event);
      expect(component.selectedFile).toBe(mockFile);
    });

    it('uploadVoucher should call pedidoService.uploadVoucher if a file is selected', () => {
      const mockFile = new File([''], 'voucher.jpg', { type: 'image/jpeg' });
      component.selectedFile = mockFile;
      component.pedidoId = 1;
      mockPedidoService.uploadVoucher.and.returnValue(of({ message: 'Voucher uploaded successfully' }));
      
      component.uploadVoucher();
      
      expect(mockPedidoService.uploadVoucher).toHaveBeenCalledWith(1, mockFile);
      expect(window.alert).toHaveBeenCalledWith('Voucher subido exitosamente. El estado del pedido se actualizará en breve.');
      expect(component.orderStatus).toBe('Confirmación de Pago Enviada'); // Temporary status
      expect(mockPedidoService.getOrderStatus).toHaveBeenCalledTimes(1); // Assuming initial fetch + this one
    });

    it('uploadVoucher should alert if no file is selected', () => {
      component.selectedFile = null;
      component.uploadVoucher();
      expect(window.alert).toHaveBeenCalledWith('Por favor, selecciona un archivo de voucher.');
      expect(mockPedidoService.uploadVoucher).not.toHaveBeenCalled();
    });
  });

});
