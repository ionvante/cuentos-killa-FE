import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCuentosComponent } from './admin-cuentos.component';

describe('AdminCuentosComponent', () => {
  let component: AdminCuentosComponent;
  let fixture: ComponentFixture<AdminCuentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminCuentosComponent],
      imports: [HttpClientTestingModule, RouterTestingModule]
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
