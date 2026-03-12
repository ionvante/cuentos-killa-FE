import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavbarComponent } from '../../../../components/navbar/navbar.component';
import { CartService } from '../../../../services/carrito.service';
import { AuthService } from '../../../../services/auth.service';
import { DrawerService } from '../../../../services/drawer.service';
import { MiniCartService } from '../../../../services/mini-cart.service';
import { CuentoService } from '../../../../services/cuento.service';
import { BehaviorSubject, of } from 'rxjs';
import { User } from '../../../../model/user.model';
import { Cuento } from '../../../../model/cuento.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let miniCartSpy: jasmine.SpyObj<MiniCartService>;
  let cuentoServiceSpy: jasmine.SpyObj<CuentoService>;

  const userSubject = new BehaviorSubject<User | null>(null);
  const itemsSubject = new BehaviorSubject<{ cuento: Cuento; cantidad: number }[]>([]);

  const mockUser: User = {
    id: 1,
    nombre: 'Ana',
    apellido: 'Killa',
    email: 'ana@killa.pe',
    telefono: '999',
    role: 'USER'
  };

  beforeEach(async () => {
    cartServiceSpy = jasmine.createSpyObj('CartService', ['obtenerItems', 'addItem'], {
      items$: itemsSubject.asObservable()
    });
    cartServiceSpy.obtenerItems.and.returnValue([]);

    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUser', 'estaAutenticado', 'cerrarSesion'], {
      usuarioLogueado$: userSubject.asObservable()
    });
    authServiceSpy.getUser.and.returnValue(null);

    miniCartSpy = jasmine.createSpyObj('MiniCartService', ['open', 'close']);
    cuentoServiceSpy = jasmine.createSpyObj('CuentoService', ['obtenerCuentos']);
    cuentoServiceSpy.obtenerCuentos.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule],
      providers: [
        { provide: CartService, useValue: cartServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MiniCartService, useValue: miniCartSpy },
        { provide: CuentoService, useValue: cuentoServiceSpy },
        DrawerService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    userSubject.next(null);
    itemsSubject.next([]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Suscripcion unificada (sin anidamiento)', () => {
    it('should update user when usuarioLogueado$ emits', fakeAsync(() => {
      userSubject.next(mockUser);
      tick();
      expect(component.user).toEqual(mockUser);
    }));

    it('should set user to null when usuarioLogueado$ emits null', fakeAsync(() => {
      userSubject.next(mockUser);
      tick();
      userSubject.next(null);
      tick();
      expect(component.user).toBeNull();
    }));

    it('should update itemsCarrito when items$ emits', fakeAsync(() => {
      const mockItems = [{ cuento: { id: 1, titulo: 'Test' } as Cuento, cantidad: 2 }];
      itemsSubject.next(mockItems);
      tick();
      expect(component.itemsCarrito).toEqual(mockItems);
    }));
  });

  describe('ngOnDestroy - sin memory leaks', () => {
    it('should have destroy$ subject', () => {
      expect((component as any).destroy$).toBeTruthy();
    });

    it('should complete destroy$ on ngOnDestroy', () => {
      const completeSpy = spyOn((component as any).destroy$, 'next').and.callThrough();
      component.ngOnDestroy();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should not receive new emissions after ngOnDestroy', fakeAsync(() => {
      component.ngOnDestroy();
      let emissionCount = 0;
      // After destroy, no more updates should happen
      userSubject.next(mockUser);
      tick();
      // user should NOT have been updated after destroy
      expect(component.user).toBeNull();
    }));
  });

  describe('cantidadTotalItems', () => {
    it('should return 0 for empty cart', () => {
      component.itemsCarrito = [];
      expect(component.cantidadTotalItems).toBe(0);
    });

    it('should sum all quantities', () => {
      component.itemsCarrito = [
        { cuento: { id: 1 } as Cuento, cantidad: 2 },
        { cuento: { id: 2 } as Cuento, cantidad: 3 }
      ];
      expect(component.cantidadTotalItems).toBe(5);
    });
  });

  describe('irACheckout', () => {
    it('should open mini-cart and navigate to /checkout when user is logged in', () => {
      component.user = mockUser;
      const routerSpy = spyOn((component as any).router, 'navigate');
      component.irACheckout();
      expect(miniCartSpy.close).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(['/checkout']);
    });

    it('should redirect to login with returnTo when user is not logged in', () => {
      component.user = null;
      const routerSpy = spyOn((component as any).router, 'navigate');
      component.irACheckout();
      expect(routerSpy).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnTo: '/checkout' }
      });
    });
  });
});
