import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { OrderDetailComponent } from './order-detail.component';
import { PedidoService } from '../../../services/pedido.service';
import { Pedido, PedidoItem } from '../../../model/pedido.model';
import { CommonModule } from '@angular/common'; // For pipes

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let mockPedidoService: jasmine.SpyObj<PedidoService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any; // Using 'any' for simplicity in setting snapshot

  const mockPedidoId = 1;
  const mockPedidoData: Pedido = {
    id: mockPedidoId,
    fecha: '2023-01-15T10:00:00Z',
    nombre: 'Cliente A',
    correo: 'a@a.com',
    direccion: 'Dir A',
    telefono: '123',
    items: [
      { nombreCuento: 'Cuento 1', imagenUrl: 'img1.jpg', precioUnitario: 10, cantidad: 1, subtotal: 10 },
      { nombreCuento: 'Cuento 2', imagenUrl: 'img2.jpg', precioUnitario: 15, cantidad: 2, subtotal: 30 }
    ],
    total: 40,
    estado: 'PAGO_PENDIENTE',
    userId: 1,
    correoUsuario: 'a@a.com'
  };

  beforeEach(async () => {
    mockPedidoService = jasmine.createSpyObj('PedidoService', ['getOrderById']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: mockPedidoId.toString() })
      }
    };

    await TestBed.configureTestingModule({
      declarations: [OrderDetailComponent],
      imports: [
        RouterTestingModule,
        CommonModule // For DatePipe, CurrencyPipe
      ],
      providers: [
        { provide: PedidoService, useValue: mockPedidoService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call pedidoService.getOrderById with correct ID and set isLoading correctly', fakeAsync(() => {
      mockPedidoService.getOrderById.and.returnValue(of(mockPedidoData));
      expect(component.isLoading).toBe(true);
      component.ngOnInit();
      tick();
      expect(mockPedidoService.getOrderById).toHaveBeenCalledWith(mockPedidoId);
      expect(component.isLoading).toBe(false);
    }));

    it('should assign pedido data on successful fetch', fakeAsync(() => {
      mockPedidoService.getOrderById.and.returnValue(of(mockPedidoData));
      component.ngOnInit();
      tick();
      expect(component.pedido).toEqual(mockPedidoData);
      expect(component.errorMensaje).toBeNull();
    }));

    it('should set errorMensaje and isLoading to false if service call fails', fakeAsync(() => {
      const errorResponse = { status: 404, message: 'Not Found' };
      mockPedidoService.getOrderById.and.returnValue(throwError(() => errorResponse));
      component.ngOnInit();
      tick();
      expect(component.isLoading).toBe(false);
      expect(component.errorMensaje).toBe('No se pudo cargar el detalle del pedido. Verifique el ID o intente más tarde.');
      expect(component.pedido).toBeUndefined();
    }));

    it('should set errorMensaje if idParam is not found in route', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({}); // No ID
      component.ngOnInit();
      tick();
      expect(component.isLoading).toBe(false);
      expect(component.errorMensaje).toBe('ID de pedido no encontrado en la URL.');
      expect(mockPedidoService.getOrderById).not.toHaveBeenCalled();
    }));
  });

  describe('volverAPedidos', () => {
    it('should navigate to /pedidos', () => {
      component.volverAPedidos();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/pedidos']);
    });
  });

  describe('pagarAhora', () => {
    it('should log a message and show an alert', () => {
      spyOn(console, 'log');
      spyOn(window, 'alert');
      component.pedido = mockPedidoData; // Ensure pedido is set
      component.pagarAhora();
      expect(console.log).toHaveBeenCalledWith('Intento de pago para el pedido:', mockPedidoData.id);
      expect(window.alert).toHaveBeenCalledWith('Funcionalidad de pago aún no implementada. Serás redirigido a una página de simulación.');
    });
  });
  
  describe('isPagoPendiente', () => {
    it('should return true if estado is PAGO_ENDIENTE', () => {
      component.pedido = { ...mockPedidoData, estado: 'PAGO_PENDIENTE' };
      expect(component.isPagoPendiente()).toBeTrue();
    });
    it('should return true if estado is PENDIENTE (case insensitive)', () => {
      component.pedido = { ...mockPedidoData, estado: 'pendiente' };
      expect(component.isPagoPendiente()).toBeTrue();
    });
    it('should return false if estado is not PAGO_PENDIENTE', () => {
      component.pedido = { ...mockPedidoData, estado: 'ENTREGADO' };
      expect(component.isPagoPendiente()).toBeFalse();
    });
     it('should return false if pedido is undefined', () => {
      component.pedido = undefined;
      expect(component.isPagoPendiente()).toBeFalse();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(fakeAsync(() => {
      mockPedidoService.getOrderById.and.returnValue(of(mockPedidoData));
      component.ngOnInit();
      tick();
      fixture.detectChanges();
    }));

    it('should display "Detalle del Pedido #ID" title', () => {
      const titleElement = fixture.debugElement.query(By.css('.pedido-content h2'));
      expect(titleElement.nativeElement.textContent).toContain(`Detalle del Pedido #${mockPedidoData.id}`);
    });

    it('should display general order information', () => {
      const infoGrid = fixture.debugElement.query(By.css('.pedido-info-general .info-grid'));
      expect(infoGrid.nativeElement.textContent).toContain(`ID del Pedido: ${mockPedidoData.id}`);
      // Add more checks for other fields like fecha, estado, total, etc. using pipes if needed
      expect(infoGrid.nativeElement.textContent).toContain(`Estado: ${mockPedidoData.estado}`);
      expect(infoGrid.nativeElement.textContent).toContain(`Nombre: ${mockPedidoData.nombre}`);
    });

    it('should display order items', () => {
      const itemCards = fixture.debugElement.queryAll(By.css('.pedido-items .item-card'));
      expect(itemCards.length).toBe(mockPedidoData.items.length);
      
      const firstItemCard = itemCards[0].nativeElement;
      const firstItemData = mockPedidoData.items[0];
      expect(firstItemCard.textContent).toContain(firstItemData.nombreCuento);
      expect(firstItemCard.textContent).toContain(`Cantidad: ${firstItemData.cantidad}`);
      // Add checks for precioUnitario, subtotal, imagenUrl
    });

    it('should display "Pagar ahora" button if order status is PAGO_PENDIENTE', () => {
      component.pedido = { ...mockPedidoData, estado: 'PAGO_PENDIENTE' };
      fixture.detectChanges();
      const pagarButton = fixture.debugElement.query(By.css('.btn-pagar'));
      expect(pagarButton).toBeTruthy();
      expect(pagarButton.nativeElement.textContent).toContain('Pagar ahora');
    });

    it('should NOT display "Pagar ahora" button if order status is not PAGO_PENDIENTE', () => {
      component.pedido = { ...mockPedidoData, estado: 'ENTREGADO' };
      fixture.detectChanges();
      const pagarButton = fixture.debugElement.query(By.css('.btn-pagar'));
      expect(pagarButton).toBeNull();
    });
    
    it('should call pagarAhora when "Pagar ahora" button is clicked', () => {
      spyOn(component, 'pagarAhora');
      component.pedido = { ...mockPedidoData, estado: 'PAGO_PENDIENTE' };
      fixture.detectChanges();
      const pagarButton = fixture.debugElement.query(By.css('.btn-pagar'));
      pagarButton.triggerEventHandler('click', null);
      expect(component.pagarAhora).toHaveBeenCalled();
    });

    it('should display "Volver a mis pedidos" button and it should call volverAPedidos', () => {
      spyOn(component, 'volverAPedidos');
      const backButton = fixture.debugElement.query(By.css('.btn-volver'));
      expect(backButton).toBeTruthy();
      expect(backButton.nativeElement.textContent).toContain('Volver a mis pedidos');
      backButton.triggerEventHandler('click', null);
      expect(component.volverAPedidos).toHaveBeenCalled();
    });
  });
});
