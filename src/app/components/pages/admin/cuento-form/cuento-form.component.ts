import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CuentoService } from '../../../../services/cuento.service';
import { Cuento } from '../../../../model/cuento.model';
import { MaestrosService } from '../../../../services/maestros.service';
import { Maestro } from '../../../../model/maestro.model';
import {
  CUENTO_MAESTRO_GRUPOS,
  normalizarCodigoCategoria,
  normalizarCodigoEdad,
  normalizarCodigoTipoEdicion
} from '../../../../shared/cuento-maestros';

@Component({
  selector: 'app-cuento-form',
  templateUrl: './cuento-form.html',
  styleUrls: ['./cuento-form.scss']
})
export class CuentoFormComponent implements OnInit {
  cuentoForm!: FormGroup;
  isEditMode = false;
  cuentoId?: number;
  imagePreview: string | null = null;
  selectedFile?: File;
  errorMensaje: string | null = null;
  categorias: Maestro[] = [];
  edades: Maestro[] = [];
  tiposEdicion: Maestro[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cuentoService: CuentoService,
    private maestrosService: MaestrosService
  ) { }

  ngOnInit(): void {
    this.cuentoForm = this.fb.group({
      titulo: ['', Validators.required],
      autor: ['', Validators.required],
      descripcionCorta: ['', Validators.required],
      categoria: ['', Validators.required],
      editorial: [''],
      tipoEdicion: [''],
      nroPaginas: ['', Validators.required],
      fechaPublicacion: [''],
      edadRecomendada: [''],
      stock: ['', Validators.required],
      precio: ['', Validators.required]
    });

    this.cargarMaestros();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.cuentoId = +idParam;
      this.cuentoService.getCuentoById(this.cuentoId).subscribe({
        next: c => {
          this.cuentoForm.patchValue({
            titulo: c.titulo,
            autor: c.autor,
            descripcionCorta: c.descripcionCorta,
            categoria: c.categoria ?? '',
            editorial: c.editorial,
            tipoEdicion: c.tipoEdicion,
            nroPaginas: c.nroPaginas,
            fechaPublicacion: c.fechaPublicacion,
            edadRecomendada: c.edadRecomendada,
            stock: c.stock,
            precio: c.precio
          });
          this.imagePreview = c.imagenUrl;
          this.sincronizarValor('categoria', this.categorias, normalizarCodigoCategoria);
          this.sincronizarValor('tipoEdicion', this.tiposEdicion, normalizarCodigoTipoEdicion);
          this.sincronizarValor('edadRecomendada', this.edades, normalizarCodigoEdad);
        },
        error: err => {
          console.error('Error al obtener el cuento:', err);
          this.errorMensaje = 'No se pudo cargar la información del cuento';
        }
      });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string; // Solo para vista previa
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  guardar(): void {
    if (this.cuentoForm.invalid) {
      this.cuentoForm.markAllAsTouched();
      this.errorMensaje = 'Completa los campos obligatorios antes de guardar.';
      return;
    }

    const cuentoData: Partial<Cuento> = {
      ...this.cuentoForm.value,
      categoria: normalizarCodigoCategoria(this.cuentoForm.value.categoria, this.categorias),
      tipoEdicion: normalizarCodigoTipoEdicion(this.cuentoForm.value.tipoEdicion, this.tiposEdicion),
      edadRecomendada: normalizarCodigoEdad(this.cuentoForm.value.edadRecomendada, this.edades)
    };

    if (!cuentoData.categoria) {
      this.cuentoForm.get('categoria')?.setErrors({ required: true });
      this.errorMensaje = 'Debes seleccionar una categoría válida.';
      return;
    }

    this.errorMensaje = null;

    const request$ = this.isEditMode && this.cuentoId
      ? this.cuentoService.actualizarCuento(this.cuentoId, cuentoData, this.selectedFile)
      : this.cuentoService.crearCuento(cuentoData, this.selectedFile);

    request$.subscribe({
      next: () => this.router.navigate(['/admin/cuentos']),
      error: err => {
        console.error('Error al guardar el cuento:', err);
        this.errorMensaje = 'Ocurrió un error al guardar el cuento';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/cuentos']);
  }

  private cargarMaestros(): void {
    this.maestrosService.obtenerMaestrosPorGrupo(CUENTO_MAESTRO_GRUPOS.categoria).subscribe({
      next: data => {
        this.categorias = data;
        this.sincronizarValor('categoria', this.categorias, normalizarCodigoCategoria);
      },
      error: () => {
        this.maestrosService.obtenerMaestrosPorGrupo(CUENTO_MAESTRO_GRUPOS.categoriaLegacy).subscribe({
          next: data => {
            this.categorias = data;
            this.sincronizarValor('categoria', this.categorias, normalizarCodigoCategoria);
          }
        });
      }
    });

    this.maestrosService.obtenerMaestrosPorGrupo(CUENTO_MAESTRO_GRUPOS.edad).subscribe({
      next: data => {
        this.edades = data;
        this.sincronizarValor('edadRecomendada', this.edades, normalizarCodigoEdad);
      }
    });

    this.maestrosService.obtenerMaestrosPorGrupo(CUENTO_MAESTRO_GRUPOS.tipoEdicion).subscribe({
      next: data => {
        this.tiposEdicion = data;
        this.sincronizarValor('tipoEdicion', this.tiposEdicion, normalizarCodigoTipoEdicion);
      }
    });
  }

  private sincronizarValor(
    campo: 'categoria' | 'edadRecomendada' | 'tipoEdicion',
    maestros: Maestro[],
    normalizador: (valor: string | null | undefined, maestros: Maestro[]) => string
  ): void {
    const actual = this.cuentoForm.get(campo)?.value;
    const normalizado = normalizador(actual, maestros);
    if (actual && normalizado && actual !== normalizado) {
      this.cuentoForm.patchValue({ [campo]: normalizado });
    }
  }
}
