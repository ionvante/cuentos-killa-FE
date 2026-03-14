import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MaestrosService } from '../../../services/maestros.service';
import { LazyLoadImageDirective } from '../../../directives/lazy-load-image.directive';
import { FormErrorComponent } from '../../shared/form-error.component';
import { ApiErrorComponent } from '../../shared/api-error/api-error.component';
import { FormHelpComponent } from '../../shared/form-help.component';
import { ToastService } from '../../../services/toast.service';
import { getDocumentoErrorMessage, getDocumentoRule, getTipoDocumentoLabel } from '../../../utils/documento-utils';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LazyLoadImageDirective, FormErrorComponent, ApiErrorComponent, FormHelpComponent],
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
  loadingTiposDocumento = false;
  docMaxLength = 8;
  documentoPlaceholder = '12345678';
  documentoHelpText = 'DNI: 8 dígitos numéricos.';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private maestrosService: MaestrosService,
    private router: Router,
    private toast: ToastService,
    private route: ActivatedRoute,
    private elementRef: ElementRef<HTMLElement>
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
    }, { validators: this.passwordMatchValidator });

    this.loadingTiposDocumento = true;
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

  private passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmarPassword = control.get('confirmarPassword');

    if (password && confirmarPassword && password.value && confirmarPassword.value && password.value !== confirmarPassword.value) {
      setTimeout(() => confirmarPassword.setErrors({ passwordMismatch: true }), 0);
      return { passwordMismatch: true };
    } else {
      if (confirmarPassword?.hasError('passwordMismatch')) {
        const errors = { ...confirmarPassword.errors };
        delete errors['passwordMismatch'];
        setTimeout(() => confirmarPassword.setErrors(Object.keys(errors).length ? errors : null), 0);
      }
    }
    return null;
  };

  get passwordMismatch(): boolean {
    return this.registerForm.hasError('passwordMismatch');
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

    if (this.registerForm.invalid) {
      this.focusFirstInvalidControl();
      return;
    }

    if (this.passwordMismatch) {
      this.error = 'Las contraseñas no coinciden. Verifica ambos campos para continuar.';
      this.focusField('confirmarPassword');
      return;
    }

    this.isLoading = true;
    const { confirmarPassword, ...formData } = this.registerForm.value;
    const data = {
      ...formData,
      role: 'USER'
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.toast.show('¡Cuenta creada exitosamente! Inicia sesión para continuar.');
        const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
        if (returnTo) {
          this.router.navigate(['/login'], { queryParams: { returnTo } });
        } else {
          this.router.navigate(['/login']);
        }
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

  private focusFirstInvalidControl(): void {
    const firstKey = Object.keys(this.registerForm.controls).find((key) => this.registerForm.get(key)?.invalid);
    if (firstKey) {
      this.focusField(firstKey);
    }
  }

  private focusField(controlName: string): void {
    const target = this.elementRef.nativeElement.querySelector<HTMLElement>(`[formControlName="${controlName}"]`);
    target?.focus();
  }

}
