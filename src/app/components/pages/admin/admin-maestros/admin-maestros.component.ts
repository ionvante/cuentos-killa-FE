import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { MaestrosService } from '../../../../services/maestros.service';
import { Maestro, MaestroAuditLog } from '../../../../model/maestro.model';

interface GrupoAyuda {
  titulo: string;
  uso: string;
}

@Component({
  selector: 'app-admin-maestros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-maestros.component.html',
  styleUrl: './admin-maestros.component.scss'
})
export class AdminMaestrosComponent implements OnInit {
  maestros: Maestro[] = [];
  maestroForm!: FormGroup;
  showModal = false;
  editando = false;
  idEditando?: number;
  auditoriaDisponible = false;

  gruposConocidos: string[] = [];

  readonly gruposSemillaRecomendados = [
    'TIPO_DOCUMENTO',
    'CUENTO_CATEGORIA',
    'RANGO_EDAD',
    'TIPO_EDICION',
    'TIPO_DIRECCION',
    'TIPO_ENTREGA'
  ];

  readonly ayudasPorGrupo: Record<string, GrupoAyuda> = {
    TIPO_DOCUMENTO: {
      titulo: 'Dónde se usa',
      uso: 'Registro de usuario, checkout y perfil para validar documento de identidad.'
    },
    CUENTO_CATEGORIA: {
      titulo: 'Dónde se usa',
      uso: 'Administración de cuentos y filtros del catálogo público.'
    },
    RANGO_EDAD: {
      titulo: 'Dónde se usa',
      uso: 'Formulario de cuentos para estandarizar edad recomendada y búsquedas.'
    },
    TIPO_EDICION: {
      titulo: 'Dónde se usa',
      uso: 'Formulario de cuentos para controlar el tipo de edición comercializada.'
    },
    TIPO_DIRECCION: {
      titulo: 'Dónde se usa',
      uso: 'Perfil de usuario y direcciones guardadas usadas en checkout.'
    },
    TIPO_ENTREGA: {
      titulo: 'Dónde se usa',
      uso: 'Checkout y pedidos para definir modalidad de envío.'
    }
  };

  filtroGrupo: string = '';
  auditoriaSeleccionada: MaestroAuditLog[] = [];

  constructor(
    private maestrosService: MaestrosService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarMaestros();
    this.detectarSoporteAuditoria();
  }

  initForm(): void {
    this.maestroForm = this.fb.group({
      grupo: ['', [Validators.required]],
      codigo: ['', [Validators.required]],
      valor: ['', Validators.required],
      descripcion: [''],
      estado: [true, Validators.required],
      enUso: [false]
    }, { validators: this.unicidadGrupoCodigoValidator.bind(this) });
  }

  get filteredMaestros() {
    if (!this.filtroGrupo) {
      return this.maestros;
    }
    return this.maestros.filter(m => m.grupo === this.filtroGrupo);
  }

  get ayudaGrupoSeleccionado(): GrupoAyuda | null {
    const grupo = this.maestroForm.get('grupo')?.value;
    if (!grupo) {
      return null;
    }
    return this.ayudasPorGrupo[String(grupo).trim().toUpperCase()] ?? null;
  }

  cargarMaestros(): void {
    this.maestrosService.obtenerTodosMaestros().subscribe({
      next: (data: Maestro[]) => {
        this.maestros = data;
        this.actualizarGruposConocidos(data);
        this.maestroForm.updateValueAndValidity({ emitEvent: false });
      },
      error: (err: any) => {
        console.error('Error cargando maestros', err);
        this.maestros = [];
        this.actualizarGruposConocidos([]);
      }
    });
  }

  actualizarGruposConocidos(data: Maestro[]): void {
    const gruposUnicos = new Set(
      [...this.gruposSemillaRecomendados, ...data.map(m => m.grupo)]
        .filter(Boolean)
        .map(grupo => grupo.trim().toUpperCase())
    );

    this.gruposConocidos = Array.from(gruposUnicos).sort();
  }

  abrirModal(): void {
    this.editando = false;
    this.idEditando = undefined;
    this.auditoriaSeleccionada = [];
    this.maestroForm.reset({ estado: true, enUso: false });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
  }

  editar(maestro: Maestro): void {
    this.editando = true;
    this.idEditando = maestro.id;
    this.maestroForm.patchValue({
      ...maestro,
      grupo: maestro.grupo?.trim().toUpperCase(),
      codigo: maestro.codigo?.trim().toUpperCase(),
      enUso: Boolean(maestro.enUso)
    });
    this.showModal = true;
    this.cargarAuditoria(maestro.id);
  }

  guardar(): void {
    this.marcarControlesComoTocados();
    if (this.maestroForm.invalid) return;

    const maestroData = this.obtenerPayloadFormulario();

    const duplicado = this.buscarDuplicado(maestroData.grupo, maestroData.codigo, this.idEditando);
    if (duplicado) {
      this.maestroForm.setErrors({ duplicadoGrupoCodigo: true });
      return;
    }

    if (this.editando && this.idEditando) {
      this.maestrosService.actualizarMaestro(this.idEditando, maestroData).subscribe({
        next: () => {
          this.cargarMaestros();
          this.cerrarModal();
        },
        error: (err: any) => this.manejarErrorPersistencia(err)
      });
      return;
    }

    this.maestrosService.crearMaestro(maestroData).subscribe({
      next: () => {
        this.cargarMaestros();
        this.cerrarModal();
      },
      error: (err: any) => this.manejarErrorPersistencia(err)
    });
  }

  eliminar(maestro: Maestro): void {
    const accion = maestro.enUso ? 'inactivar' : 'eliminar';
    if (confirm(`¿Estás seguro de ${accion} este registro maestro?`)) {
      this.maestrosService.eliminarMaestro(maestro.id!).subscribe({
        next: () => this.cargarMaestros(),
        error: (err: any) => this.manejarErrorPersistencia(err)
      });
    }
  }

  aplicarGrupoSemilla(grupo: string): void {
    this.maestroForm.patchValue({ grupo });
    this.maestroForm.get('grupo')?.markAsTouched();
    this.maestroForm.updateValueAndValidity();
  }

  private marcarControlesComoTocados(): void {
    Object.values(this.maestroForm.controls).forEach(control => control.markAsTouched());
  }

  private obtenerPayloadFormulario(): Maestro {
    const values = this.maestroForm.value;
    return {
      ...values,
      grupo: String(values.grupo ?? '').trim().toUpperCase(),
      codigo: String(values.codigo ?? '').trim().toUpperCase(),
      valor: String(values.valor ?? '').trim(),
      descripcion: String(values.descripcion ?? '').trim(),
      estado: Boolean(values.estado),
      enUso: Boolean(values.enUso)
    };
  }

  private unicidadGrupoCodigoValidator(control: AbstractControl): ValidationErrors | null {
    const grupoRaw = control.get('grupo')?.value;
    const codigoRaw = control.get('codigo')?.value;

    if (!grupoRaw || !codigoRaw) {
      return null;
    }

    const grupo = String(grupoRaw).trim().toUpperCase();
    const codigo = String(codigoRaw).trim().toUpperCase();

    return this.buscarDuplicado(grupo, codigo, this.idEditando)
      ? { duplicadoGrupoCodigo: true }
      : null;
  }

  private buscarDuplicado(grupo: string, codigo: string, idActual?: number): Maestro | undefined {
    return this.maestros.find(maestro =>
      maestro.grupo?.trim().toUpperCase() === grupo
      && maestro.codigo?.trim().toUpperCase() === codigo
      && maestro.id !== idActual
    );
  }

  private manejarErrorPersistencia(err: any): void {
    const status = err?.status;
    const message = String(err?.error?.message ?? '').toLowerCase();
    if (status === 409 || message.includes('duplic') || message.includes('unique')) {
      this.maestroForm.setErrors({ duplicadoGrupoCodigo: true });
    }

    if (status === 400 && (message.includes('en uso') || message.includes('in use'))) {
      this.maestroForm.setErrors({ registroEnUso: true });
    }

    console.error(err);
  }

  private detectarSoporteAuditoria(): void {
    this.maestrosService.soportaAuditoria().subscribe({
      next: soporta => {
        this.auditoriaDisponible = soporta;
      },
      error: () => {
        this.auditoriaDisponible = false;
      }
    });
  }

  private cargarAuditoria(id?: number): void {
    if (!id || !this.auditoriaDisponible) {
      this.auditoriaSeleccionada = [];
      return;
    }

    this.maestrosService.obtenerAuditoria(id).subscribe({
      next: data => {
        this.auditoriaSeleccionada = data;
      },
      error: () => {
        this.auditoriaSeleccionada = [];
      }
    });
  }
}
