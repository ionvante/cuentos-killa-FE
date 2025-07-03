import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../../../../services/config.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-config-item-form',
  templateUrl: './config-item-form.component.html',
  styleUrls: ['./config-item-form.component.scss']
})
export class ConfigItemFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  categoryId!: number;
  itemId?: number;
  errorMensaje: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: ConfigService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.categoryId = +(this.route.snapshot.paramMap.get('id') || 0);
    this.form = this.fb.group({
      id2: [0, Validators.required],
      label: ['', Validators.required],
      data: ['', Validators.required],
      sensitive: [false]
    });
    const itemId = this.route.snapshot.paramMap.get('itemId');
    if (itemId) {
      this.isEdit = true;
      this.itemId = +itemId;
      this.service.getItem(this.categoryId, this.itemId).subscribe({
        next: i => this.form.patchValue(i),
        error: () => this.errorMensaje = 'No se pudo cargar el ítem'
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) return;
    const data = this.form.value;
    const req$ = this.isEdit && this.itemId != null ?
      this.service.updateItem(this.categoryId, this.itemId, data) :
      this.service.createItem(this.categoryId, data);
    req$.subscribe({
      next: () => {
        this.toast.show('Guardado');
        this.router.navigate(['/admin/config', this.categoryId, 'items']);
      },
      error: () => this.toast.show('Error al guardar')
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/config', this.categoryId, 'items']);
  }
}
