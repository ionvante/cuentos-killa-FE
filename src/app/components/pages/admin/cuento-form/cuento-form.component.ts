import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CuentoService } from '../../../../services/cuento.service';
import { Cuento } from '../../../../model/cuento.model';

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
  imagenBase64: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cuentoService: CuentoService
  ) {}

  ngOnInit(): void {
    this.cuentoForm = this.fb.group({
      titulo: ['', Validators.required],
      autor: ['', Validators.required],
      descripcionCorta: ['', Validators.required],
      editorial: [''],
      tipoEdicion: [''],
      nroPaginas: ['', Validators.required],
      fechaPublicacion: [''],
      edadRecomendada: [''],
      stock: ['', Validators.required],
      precio: ['', Validators.required]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.cuentoId = +idParam;
      this.cuentoService.getCuentoById(this.cuentoId).subscribe(c => {
        this.cuentoForm.patchValue({
          titulo: c.titulo,
          autor: c.autor,
          descripcionCorta: c.descripcionCorta,
          editorial: c.editorial,
          tipoEdicion: c.tipoEdicion,
          nroPaginas: c.nroPaginas,
          fechaPublicacion: c.fechaPublicacion,
          edadRecomendada: c.edadRecomendada,
          stock: c.stock,
          precio: c.precio
        });
        this.imagePreview = c.imagenUrl;
      });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.imagenBase64 = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  guardar(): void {
    if (this.cuentoForm.invalid) return;
    const cuentoData: Partial<Cuento> = {
      ...this.cuentoForm.value
    };
    if (this.imagenBase64) {
      cuentoData.imagenUrl = this.imagenBase64;
    }

    const request$ = this.isEditMode && this.cuentoId
      ? this.cuentoService.actualizarCuento(this.cuentoId, cuentoData)
      : this.cuentoService.crearCuento(cuentoData);

    request$.subscribe(() => this.router.navigate(['/admin/cuentos']));
  }

  cancelar(): void {
    this.router.navigate(['/admin/cuentos']);
  }
}
