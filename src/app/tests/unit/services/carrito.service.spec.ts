import { TestBed } from '@angular/core/testing';
import { CartService, CART_KEY } from '../../../services/carrito.service';
import { ToastService } from '../../../services/toast.service';
import { MiniCartService } from '../../../services/mini-cart.service';
import { Cuento } from '../../../model/cuento.model';

describe('CartService', () => {
  let service: CartService;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let miniCartSpy: jasmine.SpyObj<MiniCartService>;

  const mockCuento: Cuento = {
    id: 1,
    titulo: 'El cuento de Killa',
    autor: 'Autor Test',
    precio: 15.0,
    imagenUrl: 'img.jpg',
    categoria: 'AVENTURA',
    edadRecomendada: '5-7',
    habilitado: true,
    fechaIngreso: '2024-01-01'
  } as unknown as Cuento;

  beforeEach(() => {
    localStorage.clear();
    toastSpy = jasmine.createSpyObj('ToastService', ['show']);
    miniCartSpy = jasmine.createSpyObj('MiniCartService', ['open', 'close']);

    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: ToastService, useValue: toastSpy },
        { provide: MiniCartService, useValue: miniCartSpy }
      ]
    });
    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('CART_KEY constant', () => {
    it('should export CART_KEY as "killa_cart"', () => {
      expect(CART_KEY).toBe('killa_cart');
    });
  });

  describe('Constructor - localStorage persistence key', () => {
    it('should read cart from "killa_cart" key on init', () => {
      const stored = JSON.stringify([{ cuento: mockCuento, cantidad: 2 }]);
      localStorage.setItem('killa_cart', stored);

      // Re-initialize service to trigger constructor
      const freshService = new CartService(toastSpy, miniCartSpy);
      const items = freshService.obtenerItems();
      expect(items.length).toBe(1);
      expect(items[0].cuento.id).toBe(mockCuento.id);
      expect(items[0].cantidad).toBe(2);
    });

    it('should NOT read from legacy "carrito" key', () => {
      const stored = JSON.stringify([{ cuento: mockCuento, cantidad: 1 }]);
      localStorage.setItem('carrito', stored);

      const freshService = new CartService(toastSpy, miniCartSpy);
      expect(freshService.obtenerItems().length).toBe(0);
    });

    it('should NOT read from legacy "cart" key', () => {
      const stored = JSON.stringify([{ cuento: mockCuento, cantidad: 1 }]);
      localStorage.setItem('cart', stored);

      const freshService = new CartService(toastSpy, miniCartSpy);
      expect(freshService.obtenerItems().length).toBe(0);
    });
  });

  describe('actualizarCarrito', () => {
    it('should write to "killa_cart" key in localStorage', () => {
      service.addItem(mockCuento);
      const stored = localStorage.getItem('killa_cart');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
      expect(parsed[0].cuento.id).toBe(mockCuento.id);
    });

    it('should NOT write to legacy "carrito" key', () => {
      service.addItem(mockCuento);
      expect(localStorage.getItem('carrito')).toBeNull();
    });

    it('should update items$ BehaviorSubject', (done) => {
      service.items$.subscribe(items => {
        if (items.length > 0) {
          expect(items[0].cuento.id).toBe(mockCuento.id);
          done();
        }
      });
      service.addItem(mockCuento);
    });
  });

  describe('addItem', () => {
    it('should add a new item to the cart', () => {
      service.addItem(mockCuento);
      expect(service.obtenerItems().length).toBe(1);
    });

    it('should increment quantity if item already exists', () => {
      service.addItem(mockCuento);
      service.addItem(mockCuento);
      const items = service.obtenerItems();
      expect(items.length).toBe(1);
      expect(items[0].cantidad).toBe(2);
    });

    it('should open the mini-cart after adding', () => {
      service.addItem(mockCuento);
      expect(miniCartSpy.open).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove the item from the cart', () => {
      service.addItem(mockCuento);
      service.removeItem(mockCuento.id);
      expect(service.obtenerItems().length).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items', () => {
      service.addItem(mockCuento);
      service.clearCart();
      expect(service.obtenerItems().length).toBe(0);
    });

    it('should remove "killa_cart" from localStorage', () => {
      service.addItem(mockCuento);
      service.clearCart();
      expect(localStorage.getItem('killa_cart')).toBeNull();
    });
  });

  describe('calcularSubtotalGeneral', () => {
    it('should return 0 for empty cart', () => {
      expect(service.calcularSubtotalGeneral()).toBe(0);
    });

    it('should calculate total correctly', () => {
      service.addItem(mockCuento, 2);
      // precio = 15.0, cantidad = 2 → subtotal = 30
      expect(service.calcularSubtotalGeneral()).toBe(30);
    });
  });

  describe('incrementarCantidad / decrementarCantidad', () => {
    it('should increment quantity of existing item', () => {
      service.addItem(mockCuento);
      service.incrementarCantidad(mockCuento.id);
      expect(service.obtenerItems()[0].cantidad).toBe(2);
    });

    it('should decrement quantity of existing item', () => {
      service.addItem(mockCuento, 2);
      service.decrementarCantidad(mockCuento.id);
      expect(service.obtenerItems()[0].cantidad).toBe(1);
    });

    it('should remove item when quantity reaches 0', () => {
      service.addItem(mockCuento, 1);
      service.decrementarCantidad(mockCuento.id);
      expect(service.obtenerItems().length).toBe(0);
    });
  });
});
