import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaestrosService } from '../../../../services/maestros.service';
import { Maestro } from '../../../../model/maestro.model';

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

  gruposConocidos: string[] = [];

  filtroGrupo: string = '';
  loadingMaestros = false;
  guardando = false;
  formSubmitAttempted = false;

  constructor(
    private maestrosService: MaestrosService,
    private fb: FormBuilder,
    private elementRef: ElementRef<HTMLElement>
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarMaestros();
  }

  initForm(): void {
    this.maestroForm = this.fb.group({
      grupo: ['', Validators.required],
      codigo: ['', Validators.required],
      valor: ['', Validators.required],
      descripcion: [''],
      estado: [true, Validators.required]
    });
  }

  get filteredMaestros() {
    if (!this.filtroGrupo) {
      return this.maestros;
    }
    return this.maestros.filter(m => m.grupo === this.filtroGrupo);
  }

  cargarMaestros(): void {
    // Al no tener el backend de momento, inicializamos el array o mostramos loader.
    this.loadingMaestros = true;
    this.maestrosService.obtenerTodosMaestros().subscribe({
      next: (data: Maestro[]) => {
        this.loadingMaestros = false;
        this.maestros = data;
        // Extraer dinámicamente los grupos únicos y ordenarlos alfabéticamente
        const gruposUnicos = new Set(data.map(m => m.grupo));
        this.gruposConocidos = Array.from(gruposUnicos).sort();
      },
      error: (err: any) => {
        this.loadingMaestros = false;
        console.error('Error cargando maestros', err);
        // Fallback temporal si el api no existe
        this.maestros = [];
        this.gruposConocidos = [];
      }
    });
  }

  abrirModal(): void {
    this.formSubmitAttempted = false;
    this.editando = false;
    this.idEditando = undefined;
    this.maestroForm.reset({ estado: true });
    this.showModal = true;
    setTimeout(() => this.focusField('grupo'));
  }

  cerrarModal(): void {
    this.showModal = false;
    this.formSubmitAttempted = false;
    this.guardando = false;
  }

  editar(maestro: Maestro): void {
    this.editando = true;
    this.idEditando = maestro.id;
    this.maestroForm.patchValue(maestro);
    this.showModal = true;
    setTimeout(() => this.focusField('grupo'));
  }

  guardar(): void {
    this.formSubmitAttempted = true;
    if (this.maestroForm.invalid) {
      this.maestroForm.markAllAsTouched();
      this.focusFirstInvalidControl();
      return;
    }

    this.guardando = true;

    const maestroData: Maestro = this.maestroForm.value;

    if (this.editando && this.idEditando) {
      this.maestrosService.actualizarMaestro(this.idEditando, maestroData).subscribe({
        next: () => {
          this.guardando = false;
          this.cargarMaestros();
          this.cerrarModal();
        },
        error: (err: any) => {
          this.guardando = false;
          console.error(err);
        }
      });
    } else {
      this.maestrosService.crearMaestro(maestroData).subscribe({
        next: () => {
          this.guardando = false;
          this.cargarMaestros();
          this.cerrarModal();
        },
        error: (err: any) => {
          this.guardando = false;
          console.error(err);
        }
      });
    }
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de inhabilitar/eliminar este registro maestro?')) {
      this.maestrosService.eliminarMaestro(id).subscribe({
        next: () => this.cargarMaestros(),
        error: (err: any) => console.error(err)
      });
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showModal) {
      this.cerrarModal();
    }
  }

  private focusFirstInvalidControl(): void {
    const firstInvalid = Object.keys(this.maestroForm.controls).find((name) => this.maestroForm.get(name)?.invalid);
    if (firstInvalid) {
      this.focusField(firstInvalid);
    }
  }

  private focusField(controlName: string): void {
    const target = this.elementRef.nativeElement.querySelector<HTMLElement>(`[formControlName="${controlName}"]`);
    target?.focus();
  }

}
