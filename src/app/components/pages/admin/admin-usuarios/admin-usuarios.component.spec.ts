import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminUsuariosComponent } from './admin-usuarios.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AdminUsuariosComponent', () => {
  let component: AdminUsuariosComponent;
  let fixture: ComponentFixture<AdminUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [AdminUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
