import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPedidosComponent } from './admin-pedidos.component';

describe('AdminPedidosComponent', () => {
  let component: AdminPedidosComponent;
  let fixture: ComponentFixture<AdminPedidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPedidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
