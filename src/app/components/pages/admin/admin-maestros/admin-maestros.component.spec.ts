import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AdminMaestrosComponent } from './admin-maestros.component';
import { MaestrosService } from '../../../../services/maestros.service';

class MaestrosServiceMock {
  obtenerTodosMaestros = jasmine.createSpy().and.returnValue(of([]));
  crearMaestro = jasmine.createSpy().and.returnValue(of({}));
  actualizarMaestro = jasmine.createSpy().and.returnValue(of({}));
  eliminarMaestro = jasmine.createSpy().and.returnValue(of({}));
  soportaAuditoria = jasmine.createSpy().and.returnValue(of(false));
  obtenerAuditoria = jasmine.createSpy().and.returnValue(of([]));
}

describe('AdminMaestrosComponent', () => {
  let component: AdminMaestrosComponent;
  let fixture: ComponentFixture<AdminMaestrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMaestrosComponent],
      providers: [{ provide: MaestrosService, useClass: MaestrosServiceMock }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AdminMaestrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fail validation when grupo+codigo already exists', () => {
    component.maestros = [{
      id: 1,
      grupo: 'TIPO_DOCUMENTO',
      codigo: 'DNI',
      valor: 'Documento Nacional de Identidad',
      estado: true
    }];

    component.maestroForm.patchValue({
      grupo: 'tipo_documento',
      codigo: 'dni',
      valor: 'Documento'
    });

    component.maestroForm.updateValueAndValidity();

    expect(component.maestroForm.errors?.['duplicadoGrupoCodigo']).toBeTrue();
  });
});
