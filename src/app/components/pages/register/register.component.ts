import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MaestrosService } from '../../../services/maestros.service';
import { LazyLoadImageDirective } from '../../../directives/lazy-load-image.directive';
import { FormErrorComponent } from '../../shared/form-error.component';
import { ToastService } from '../../../services/toast.service';
import { getDocumentoErrorMessage, getDocumentoRule, getTipoDocumentoLabel } from '../../../utils/documento-utils';

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
  docMaxLength = 8;
  documentoPlaceholder = '12345678';
  documentoHelpText = 'DNI: 8 dígitos numéricos.';

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
      documentoNumero: ['', getDocumentoRule('DNI').validators],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', Validators.required]
    });

    this.maestrosService.obtenerMaestrosPorGrupo('TIPO_DOCUMENTO').subscribe({
      next: tipos => {
        this.tiposDocumento = tipos ?? [];
        const actual = this.registerForm.get('documentoTipo')?.value;
        if (this.tiposDocumento.length > 0 && !this.tiposDocumento.some((t: any) => t.codigo === actual)) {
          this.registerForm.get('documentoTipo')?.setValue(this.tiposDocumento[0].codigo);
        }
      },
      error: () => this.tiposDocumento = []
    });

    this.registerForm.get('documentoTipo')?.valueChanges.subscribe((tipo: string) => {
      this.aplicarReglaDocumento(tipo);
    });

    this.aplicarReglaDocumento(this.registerForm.get('documentoTipo')?.value);
  }

  getTipoDocumentoLabel(tipo: { codigo?: string; valor?: string; descripcion?: string }): string {
    return getTipoDocumentoLabel(tipo);
  }

  private aplicarReglaDocumento(tipo: string): void {
    const regla = getDocumentoRule(tipo);
    const control = this.registerForm.get('documentoNumero');

    this.docMaxLength = regla.maxLength;
    this.documentoPlaceholder = regla.placeholder;
    this.documentoHelpText = regla.helpText;

    control?.setValidators(regla.validators);
    control?.setValue('');
    control?.updateValueAndValidity();
  }


  get documentoErrorMessage(): string {
    return getDocumentoErrorMessage(this.registerForm.get('documentoTipo')?.value);
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
