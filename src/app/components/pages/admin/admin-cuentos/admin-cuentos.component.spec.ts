import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCuentosComponent } from './admin-cuentos.component';

describe('AdminCuentosComponent', () => {
  let component: AdminCuentosComponent;
  let fixture: ComponentFixture<AdminCuentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCuentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCuentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
