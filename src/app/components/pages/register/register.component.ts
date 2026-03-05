import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MaestrosService } from '../../../services/maestros.service';
import { LazyLoadImageDirective } from '../../../directives/lazy-load-image.directive';
import { FormErrorComponent } from '../../shared/form-error.component';
import { ToastService } from '../../../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LazyLoadImageDirective, FormErrorComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  error = '';
  isSubmitted = false;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  tiposDocumento: any[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private maestrosService: MaestrosService,
    private router: Router,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      documentoTipo: ['DNI'],
      documentoNumero: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', Validators.required]
    });

    this.maestrosService.obtenerMaestrosPorGrupo('TIPO_DOCUMENTO').subscribe({
      next: tipos => this.tiposDocumento = tipos,
      error: () => this.tiposDocumento = [
        { codigo: 'DNI', descripcion: 'DNI' },
        { codigo: 'CE', descripcion: 'Carnet de Extranjería' },
        { codigo: 'RUC', descripcion: 'RUC' }
      ]
    });
  }

  get passwordMismatch(): boolean {
    const p = this.registerForm.get('password')?.value;
    const c = this.registerForm.get('confirmarPassword')?.value;
    return c && p !== c;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  registrar(): void {
    this.isSubmitted = true;
    this.error = '';

    if (this.registerForm.invalid) return;

    if (this.passwordMismatch) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;
    const { confirmarPassword, ...formData } = this.registerForm.value;
    const data = { ...formData, role: 'USER' };

    this.authService.register(data).subscribe({
      next: () => {
        this.toast.show('¡Cuenta creada exitosamente! Inicia sesión para continuar.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err?.status === 429) {
          this.error = 'Demasiados intentos. Espera 1 minuto antes de intentar de nuevo.';
        } else if (err?.status === 409 || err?.error?.message?.includes('existe')) {
          this.error = 'Este correo ya está registrado. ¿Deseas iniciar sesión?';
        } else {
          this.error = err?.error?.message || 'No se pudo crear la cuenta. Intenta más tarde.';
        }
      }
    });
  }
}
