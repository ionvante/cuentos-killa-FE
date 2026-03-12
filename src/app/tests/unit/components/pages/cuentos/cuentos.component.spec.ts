import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { CuentosComponent } from '../../../../../components/pages/cuentos/cuentos.component';
import { CuentoService } from '../../../../../services/cuento.service';
import { CartService } from '../../../../../services/carrito.service';
import { MaestrosService } from '../../../../../services/maestros.service';
import { CUENTO_MAESTRO_GRUPOS } from '../../../../../shared/cuento-maestros';
import { Cuento } from '../../../../../model/cuento.model';

describe('CuentosComponent', () => {
  let component: CuentosComponent;
  let fixture: ComponentFixture<CuentosComponent>;

  let mockCuentoService: jasmine.SpyObj<CuentoService>;
  let mockCartService: jasmine.SpyObj<CartService>;
  let mockMaestrosService: jasmine.SpyObj<MaestrosService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const queryParamsSubject = new BehaviorSubject<{ [key: string]: string }>({});

  beforeEach(async () => {
    mockCuentoService = jasmine.createSpyObj('CuentoService', ['obtenerCuentos']);
    mockCartService = jasmine.createSpyObj('CartService', ['addItem']);
    mockMaestrosService = jasmine.createSpyObj('MaestrosService', ['obtenerMaestrosPorGrupo']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Mock base returns
    mockCuentoService.obtenerCuentos.and.returnValue(of([]));
    mockMaestrosService.obtenerMaestrosPorGrupo.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [CuentosComponent],
      imports: [RouterTestingModule, FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CuentoService, useValue: mockCuentoService },
        { provide: CartService, useValue: mockCartService },
        { provide: MaestrosService, useValue: mockMaestrosService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: {
              subscribe: (fn: (value: any) => void) => queryParamsSubject.subscribe(params => {
                fn({ get: (key: string) => params[key] || null });
              })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CuentosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('UT-01: ngOnInit carga cuentos sin setTimeout (inmediato)', fakeAsync(() => {
    const mockCuentos: Cuento[] = [
      { 
        id: 1, 
        titulo: 'Cuento 1', 
        autor: 'Autor 1', 
        precio: 10, 
        fechaIngreso: '2024-01-01', 
        categoria: 'A', 
        edadRecomendada: '5-7', 
        descripcionCorta: 'Desc', 
        imagenUrl: 'img.jpg',
        editorial: 'Ed',
        tipoEdicion: 'S',
        nroPaginas: 10,
        fechaPublicacion: '2024-01-01',
        stock: 10
      } as unknown as Cuento
    ];
    mockCuentoService.obtenerCuentos.and.returnValue(of(mockCuentos));

    expect(component.isLoading).toBeTrue();
    
    // Invocamos ngOnInit, como usa observables síncronos el isLoading debería ser false justo después de inicializar
    fixture.detectChanges(); // Ejecuta ngOnInit internamente
    tick(); // Procesamos las resoluciones de observables

    expect(mockCuentoService.obtenerCuentos).toHaveBeenCalled();
    expect(component.cuentos.length).toBe(1);
    expect(component.cuentos[0].titulo).toBe('Cuento 1');
    expect(component.isLoading).toBeFalse();
  }));

  it('UT-02: normalizarCuento no asigna rating numérico arbitrario si no hay en el modelo', fakeAsync(() => {
    const mockCuentos: Cuento[] = [
      { 
        id: 1, 
        titulo: 'Sin Rating', 
        autor: 'Autor 1', 
        precio: 10, 
        fechaIngreso: '2024-01-01', 
        categoria: 'A', 
        edadRecomendada: '5-7', 
        descripcionCorta: 'Desc', 
        imagenUrl: 'img.jpg',
        editorial: 'Ed',
        tipoEdicion: 'S',
        nroPaginas: 10,
        fechaPublicacion: '2024-01-01',
        stock: 10
      } as unknown as Cuento
    ];
    mockCuentoService.obtenerCuentos.and.returnValue(of(mockCuentos));

    fixture.detectChanges();
    tick();

    expect(component.cuentos.length).toBe(1);
    // El rating debe preservarse como undefined para que CuentoCardComponent sepa que no hay estrellas
    expect(component.cuentos[0].rating).toBeUndefined();
  }));
});
