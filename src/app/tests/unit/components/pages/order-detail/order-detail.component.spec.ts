import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { OrderDetailComponent } from '../../../../../components/pages/order-detail/order-detail.component';
import { PedidoService } from '../../../../../services/pedido.service';
import { Pedido, PedidoItem } from '../../../../../model/pedido.model';
import { CommonModule } from '@angular/common'; // For pipes
import { ToastService } from '../../../../../services/toast.service';
import { MaestrosService } from '../../../../../services/maestros.service';

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let mockPedidoService: jasmine.SpyObj<PedidoService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any; // Using 'any' for simplicity in setting snapshot
  let toastSpy: jasmine.SpyObj<ToastService>;
  let maestrosSpy: jasmine.SpyObj<any>;

  const mockPedidoId = 1;
  const mockPedidoData: Pedido = {
    Id: mockPedidoId,
    fecha: '2023-01-15T10:00:00Z',
    nombre: 'Cliente A',
    correo: 'a@a.com',
    direccion: 'Dir A',
    telefono: '123',
    items: [
      { cuentoId: 1, nombreCuento: 'Cuento 1', imagenUrl: 'img1.jpg', precioUnitario: 10, cantidad: 1, subtotal: 10 },
      { cuentoId: 2, nombreCuento: 'Cuento 2', imagenUrl: 'img2.jpg', precioUnitario: 15, cantidad: 2, subtotal: 30 }
    ],
    total: 40,
    estado: 'PAGO_PENDIENTE',
    userId: 1,
    correoUsuario: 'a@a.com'
  };

  beforeEach(async () => {
    mockPedidoService = jasmine.createSpyObj('PedidoService', ['getOrderById', 'getOrders']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: mockPedidoId.toString() })
      }
    };
    toastSpy = jasmine.createSpyObj('ToastService', ['show']);
    maestrosSpy = jasmine.createSpyObj('MaestrosService', ['obtenerMaestrosPorGrupo']);
    maestrosSpy.obtenerMaestrosPorGrupo.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        OrderDetailComponent,
        RouterTestingModule,
        CommonModule // For DatePipe, CurrencyPipe
      ],
      providers: [
        { provide: PedidoService, useValue: mockPedidoService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ToastService, useValue: toastSpy },
        { provide: MaestrosService, useValue: maestrosSpy }
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
      mockPedidoService.getOrders.and.returnValue(of([mockPedidoData]));
      expect(component.isLoading).toBe(true);
      component.ngOnInit();
      tick();
      expect(mockPedidoService.getOrderById).toHaveBeenCalledWith(mockPedidoId);
      expect(component.isLoading).toBe(false);
    }));

    it('should assign pedido data on successful fetch', fakeAsync(() => {
      mockPedidoService.getOrderById.and.returnValue(of(mockPedidoData));
      mockPedidoService.getOrders.and.returnValue(of([mockPedidoData]));
      component.ngOnInit();
      tick();
      expect(component.pedido).toEqual(mockPedidoData);
      expect(component.errorMensaje).toBeNull();
    }));

    it('should set errorMensaje and isLoading to false if service call fails', fakeAsync(() => {
      const errorResponse = { status: 404, message: 'Not Found' };
      mockPedidoService.getOrderById.and.returnValue(throwError(() => errorResponse));
      mockPedidoService.getOrders.and.returnValue(of([]));
      component.ngOnInit();
      tick();
      expect(component.isLoading).toBe(false);
      expect(component.errorMensaje).toBe('No se pudo cargar el detalle del pedido. Verifique el ID o intente más tarde.');
      expect(component.pedido).toBeNull();
    }));

    it('should set errorMensaje if idParam is not found in route', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({}); // No ID
      component.ngOnInit();
      tick();
      expect(component.isLoading).toBe(false);
      expect(component.errorMensaje).toBe('ID de pedido no encontrado en la URL.');
      expect(component.pedido).toBeNull();
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
    it('should navigate to /pago/:id when pedido exists', () => {
      component.pedido = mockPedidoData;
      component.pagarAhora();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/pago', mockPedidoData.Id]);
    });

    it('should do nothing if pedido is null', () => {
      component.pedido = null;
      component.pagarAhora();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('isPagoPendiente', () => {
    it('should return true if estado is PAGO_ENDIENTE', () => {
      component.pedido = { ...mockPedidoData, estado: 'PAGO_PENDIENTE' };
      expect(component.isPagoPendiente()).toBeTrue();
    });

    it('should return false if estado is not PAGO_PENDIENTE', () => {
      component.pedido = { ...mockPedidoData, estado: 'ENTREGADO' };
      expect(component.isPagoPendiente()).toBeFalse();
    });
    it('should return false if pedido is undefined', () => {
      component.pedido = null;
      expect(component.isPagoPendiente()).toBeFalse();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(fakeAsync(() => {
      mockPedidoService.getOrderById.and.returnValue(of(mockPedidoData));
      mockPedidoService.getOrders.and.returnValue(of([mockPedidoData]));
      component.ngOnInit();
      tick();
      fixture.detectChanges();
    }));

    it('should display "Pedido #ID" title', () => {
      const titleElement = fixture.debugElement.query(By.css('.pedido-content h2'));
      expect(titleElement.nativeElement.textContent).toContain(`Pedido #${mockPedidoData.Id}`);
    });

    it('should display general order information', () => {
      const infoGrid = fixture.debugElement.query(By.css('.info-grid.user-info'));
      expect(infoGrid.nativeElement.textContent).toContain(mockPedidoData.nombre);
    });

    it('should display order items', () => {
      const itemCards = fixture.debugElement.queryAll(By.css('.items-section .item-row'));
      expect(itemCards.length).toBe(mockPedidoData.items.length);

      const firstItemCard = itemCards[0].nativeElement;
      const firstItemData = mockPedidoData.items[0];
      expect(firstItemCard.textContent).toContain(firstItemData.nombreCuento);
      expect(firstItemCard.textContent).toContain(`x${firstItemData.cantidad}`);
      // Add checks for precioUnitario, subtotal, imagenUrl
    });

    it('should display "Proceder al Pago" button if order status is PAGO_PENDIENTE', () => {
      component.pedido = { ...mockPedidoData, estado: 'PAGO_PENDIENTE' };
      fixture.detectChanges();
      const pagarButton = fixture.debugElement.query(By.css('.btn-action.primary'));
      expect(pagarButton).toBeTruthy();
      expect(pagarButton.nativeElement.textContent).toContain('Proceder al Pago');
    });

    it('should NOT display "Proceder al Pago" button if order status is not PAGO_PENDIENTE', () => {
      component.pedido = { ...mockPedidoData, estado: 'ENTREGADO' };
      fixture.detectChanges();
      const pagarButton = fixture.debugElement.query(By.css('.btn-action.primary'));
      expect(pagarButton).toBeNull();
    });

    it('should call pagarAhora when "Proceder al Pago" button is clicked', () => {
      spyOn(component, 'pagarAhora');
      component.pedido = { ...mockPedidoData, estado: 'PAGO_PENDIENTE' };
      fixture.detectChanges();
      const pagarButton = fixture.debugElement.query(By.css('.btn-action.primary'));
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
