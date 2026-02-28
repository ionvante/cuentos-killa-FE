import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { OrderListComponent } from './order-list.component';
import { PedidoService } from '../../../services/pedido.service';
import { Pedido } from '../../../model/pedido.model';
import { Router } from '@angular/router';
import { DatePipe, CurrencyPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let mockPedidoService: jasmine.SpyObj<PedidoService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockPedidosData: Pedido[] = [
    { id: 1, fecha: '2023-01-15T10:00:00Z', nombre: 'Cliente A', correo: 'a@a.com', direccion: 'Dir A', telefono: '123', items: [], total: 100, estado: 'ENTREGADO', userId: 1, correoUsuario: 'a@a.com' },
    { id: 2, fecha: '2023-01-16T11:00:00Z', nombre: 'Cliente B', correo: 'b@b.com', direccion: 'Dir B', telefono: '456', items: [], total: 200, estado: 'PAGO_PENDIENTE', userId: 2, correoUsuario: 'b@b.com' }
  ];

  beforeEach(async () => {
    mockPedidoService = jasmine.createSpyObj('PedidoService', ['getOrders', 'downloadInvoice']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        OrderListComponent,
        RouterTestingModule, // Provides basic router stubs
        CommonModule,
        FormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: PedidoService, useValue: mockPedidoService },
        { provide: Router, useValue: mockRouter },
        // DatePipe and CurrencyPipe are usually provided by CommonModule,
        // but sometimes need to be explicitly provided in tests if not working.
        // For now, relying on CommonModule.
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    mockPedidoService.getOrders.and.returnValue(of(mockPedidosData));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call pedidoService.getOrders and set isLoading to true initially, then false', fakeAsync(() => {
      mockPedidoService.getOrders.and.returnValue(of(mockPedidosData));

      expect(component.isLoading).toBe(true); // Check initial state before ngOnInit
      component.ngOnInit(); // Trigger ngOnInit
      tick(); // Simulate passage of time for async operations like observables

      expect(mockPedidoService.getOrders).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    }));

    it('should assign pedidos on successful data fetch', fakeAsync(() => {
      mockPedidoService.getOrders.and.returnValue(of(mockPedidosData));
      component.ngOnInit();
      tick();
      expect(component.pedidos.length).toBe(2);
      expect(component.pedidos).toEqual(mockPedidosData);
      expect(component.errorMensaje).toBeNull();
    }));

    it('should set errorMensaje and isLoading to false if service call fails', fakeAsync(() => {
      const errorResponse = { status: 500, message: 'Server Error' };
      mockPedidoService.getOrders.and.returnValue(throwError(() => errorResponse));
      component.ngOnInit();
      tick();
      expect(component.isLoading).toBe(false);
      expect(component.errorMensaje).toBe('No se pudieron cargar los pedidos. Intente más tarde.');
      expect(component.pedidos.length).toBe(0);
    }));
  });

  describe('verDetalle', () => {
    it('should navigate to the order detail page with the correct pedidoId', () => {
      const pedidoId = 123;
      component.verDetalle(pedidoId);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/pedidos', pedidoId]);
    });
  });

  describe('Template Rendering', () => {
    it('should display "Pedidos" title', () => {
      fixture.detectChanges(); // Trigger change detection
      const titleElement = fixture.debugElement.query(By.css('h2'));
      expect(titleElement.nativeElement.textContent).toContain('Pedidos');
    });

    it('should display "Cargando pedidos..." when isLoading is true', () => {
      component.isLoading = true;
      fixture.detectChanges();
      const loadingElement = fixture.debugElement.query(By.css('.loading-indicator p'));
      expect(loadingElement.nativeElement.textContent).toContain('Cargando pedidos...');
    });

    it('should display error message when errorMensaje is set', () => {
      component.isLoading = false;
      component.errorMensaje = 'Test Error Message';
      fixture.detectChanges();
      const errorElement = fixture.debugElement.query(By.css('.error-mensaje p'));
      expect(errorElement.nativeElement.textContent).toContain('Test Error Message');
    });

    it('should display "Aún no tienes pedidos." when pedidos is empty and not loading and no error', () => {
      component.isLoading = false;
      component.pedidos = [];
      component.errorMensaje = null;
      fixture.detectChanges();
      const noOrdersElement = fixture.debugElement.query(By.css('.no-orders-mensaje p'));
      expect(noOrdersElement.nativeElement.textContent).toContain('Aún no tienes pedidos.');
      const exploreButton = fixture.debugElement.query(By.css('.no-orders-mensaje button'));
      expect(exploreButton).toBeTruthy();
      expect(exploreButton.nativeElement.textContent).toContain('Explorar Cuentos');
    });

    it('should render order cards when pedidos has data', fakeAsync(() => {
      mockPedidoService.getOrders.and.returnValue(of(mockPedidosData));
      component.ngOnInit();
      tick();
      fixture.detectChanges(); // Update view with fetched data

      const orderRows = fixture.debugElement.queryAll(By.css('.order-row'));
      expect(orderRows.length).toBe(2);

      const firstRow = orderRows[0];
      expect(firstRow.query(By.css('.card-header h3')).nativeElement.textContent).toContain(`Pedido #${mockPedidosData[0].id}`);

      const datePipe = new DatePipe('en-US');
      const expectedDate = datePipe.transform(mockPedidosData[0].fecha, 'dd/MM/yyyy');
      expect(firstRow.query(By.css('.date')).nativeElement.textContent).toContain(expectedDate);

      const expectedEstado = component.getEstadoVisible(mockPedidosData[0].estado);
      expect(firstRow.query(By.css('.estado')).nativeElement.textContent).toContain(expectedEstado);

      // Use CurrencyPipe for formatting total as in component
      const currencyPipe = new CurrencyPipe('en-US', 'USD'); // Adjust locale and currency code as needed
      const expectedTotal = currencyPipe.transform(mockPedidosData[0].total, 'USD', 'symbol', '1.2-2');
      expect(firstRow.nativeElement.textContent).toContain(`Total: ${expectedTotal}`);
    }));

    it('should call irAPago when primary action button is clicked', fakeAsync(() => {
      spyOn(component, 'irAPago');
      mockPedidoService.getOrders.and.returnValue(of(mockPedidosData));
      component.ngOnInit();
      tick();
      fixture.detectChanges();

      const payBtn = fixture.debugElement.query(By.css('.acciones .btn-primary'));
      payBtn.triggerEventHandler('click', null);
      expect(component.irAPago).toHaveBeenCalledWith(mockPedidosData[0].id as number);
    }));
  });
});
