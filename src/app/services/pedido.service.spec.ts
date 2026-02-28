import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PedidoService } from './pedido.service';
import { Pedido } from '../model/pedido.model'; // Asegúrate que la ruta es correcta

describe('PedidoService', () => {
  let service: PedidoService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/orders'; // Base API URL from service

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PedidoService]
    });
    service = TestBed.inject(PedidoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOrders', () => {
    it('should return a list of orders on successful GET request', () => {
      const mockPedidos: Pedido[] = [
        { id: 1, fecha: '2023-01-15', nombre: 'Cliente A', correo: 'a@example.com', direccion: 'Dir A', telefono: '123', items: [], total: 100, estado: 'ENTREGADO', userId: 1, correoUsuario: 'a@example.com' },
        { id: 2, fecha: '2023-01-16', nombre: 'Cliente B', correo: 'b@example.com', direccion: 'Dir B', telefono: '456', items: [], total: 200, estado: 'PENDIENTE', userId: 2, correoUsuario: 'b@example.com' }
      ];

      service.getOrders().subscribe(pedidos => {
        expect(pedidos.length).toBe(2);
        expect(pedidos).toEqual(mockPedidos);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPedidos);
    });

    it('should handle errors when fetching orders', () => {
      const errorMessage = 'Error fetching orders';
      service.getOrders().subscribe({
        next: () => fail('should have failed with an error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Server Error');
        }
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ message: errorMessage }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getOrderById', () => {
    it('should return a single order on successful GET request', () => {
      const mockPedido: Pedido = { id: 1, fecha: '2023-01-15', nombre: 'Cliente A', correo: 'a@example.com', direccion: 'Dir A', telefono: '123', items: [], total: 100, estado: 'ENTREGADO', userId: 1, correoUsuario: 'a@example.com' };
      const pedidoId = 1;

      service.getOrderById(pedidoId).subscribe(pedido => {
        expect(pedido).toEqual(mockPedido);
      });

      const req = httpMock.expectOne(`${apiUrl}/${pedidoId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPedido);
    });

    it('should handle errors when fetching a single order', () => {
      const pedidoId = 1;
      const errorMessage = 'Error fetching order';
      service.getOrderById(pedidoId).subscribe({
        next: () => fail('should have failed with an error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${pedidoId}`);
      expect(req.request.method).toBe('GET');
      req.flush({ message: errorMessage }, { status: 404, statusText: 'Not Found' });
    });
  });

  // Tests for registrarPedido, uploadVoucher, getOrderStatus can be added here if not already present
  // For now, focusing on the new methods as per the subtask.
});
