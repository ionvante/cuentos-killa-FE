import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MaestrosService } from '../../../services/maestros.service';

describe('MaestrosService', () => {
  let service: MaestrosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(MaestrosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
