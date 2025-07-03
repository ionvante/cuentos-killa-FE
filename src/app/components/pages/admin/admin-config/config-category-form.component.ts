import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../../../../services/config.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-config-category-form',
  templateUrl: './config-category-form.component.html',
  styleUrls: ['./config-category-form.component.scss']
})
export class ConfigCategoryFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  id?: number;
  errorMensaje: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: ConfigService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required]
    });
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.id = +idParam;
      this.service.getCategory(this.id).subscribe({
        next: c => this.form.patchValue(c),
        error: () => this.errorMensaje = 'No se pudo cargar la categoría'
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) return;
    const data = this.form.value;
    const req$ = this.isEdit && this.id ?
      this.service.updateCategory(this.id, data) :
      this.service.createCategory(data);
    req$.subscribe({
      next: () => {
        this.toast.show('Guardado');
        this.router.navigate(['/admin/config']);
      },
      error: () => this.toast.show('Error al guardar')
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/config']);
  }
}
