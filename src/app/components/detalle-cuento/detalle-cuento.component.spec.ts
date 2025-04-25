import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCuentoComponent } from './detalle-cuento.component';

describe('DetalleCuentoComponent', () => {
  let component: DetalleCuentoComponent;
  let fixture: ComponentFixture<DetalleCuentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCuentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleCuentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
