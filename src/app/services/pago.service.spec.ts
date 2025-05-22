import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PagoService } from './pago.service';

describe('PagoService', () => {
  let service: PagoService;
  let httpMock: HttpTestingController;
  let apiUrl = 'http://localhost:8080/api/orders';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PagoService]
    });
    service = TestBed.inject(PagoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Make sure that there are no outstanding requests.
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('confirmarPagoMercadoPago', () => {
    it('should make a POST request to the correct URL and return data on success', () => {
      const pedidoId = 123;
      const mockResponse = { status: 'success', message: 'Pago confirmado' };

      service.confirmarPagoMercadoPago(pedidoId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${pedidoId}/confirmar-pago-mercadopago`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({}); // Expecting an empty body as per implementation
      req.flush(mockResponse);
    });

    it('should handle HTTP errors correctly', () => {
      const pedidoId = 456;
      const errorMessage = 'Error confirming payment';
      const mockErrorResponse = { status: 500, statusText: 'Server Error' };

      service.confirmarPagoMercadoPago(pedidoId).subscribe(
        response => fail('should have failed with an error'),
        error => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Server Error');
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/${pedidoId}/confirmar-pago-mercadopago`);
      expect(req.request.method).toBe('POST');
      req.flush(errorMessage, mockErrorResponse);
    });
  });
});
