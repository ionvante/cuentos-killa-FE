import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-form-error',
    imports: [CommonModule],
    template: `
    <div class="form-error-container" [attr.id]="errorId || null" aria-live="polite" *ngIf="shouldShowErrors()">
      <span class="error-msg">{{ getErrorMessage() }}</span>
    </div>
  `,
    styles: [`
    .form-error-container {
      color: #d32f2f;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      min-height: 1.25rem; /* Evita saltos de diseño */
    }
  `]
})
export class FormErrorComponent {
    @Input() control!: AbstractControl | null;
    @Input() isSubmitted: boolean = false;
    @Input() fieldLabel: string = 'Este campo';
    @Input() errorId?: string;

    shouldShowErrors(): boolean {
        return !!this.control && this.control.invalid && (this.control.touched || this.control.dirty || this.isSubmitted);
    }

    getErrorMessage(): string {
        if (!this.control?.errors) {
            return '';
        }

        if (this.control.hasError('required')) {
            return `Completa ${this.fieldLabel.toLowerCase()} para continuar.`;
        }

        if (this.control.hasError('email')) {
            return 'Ingresa un correo válido, por ejemplo nombre@correo.com.';
        }

        if (this.control.hasError('minlength')) {
            return `Escribe al menos ${this.control.errors['minlength']?.requiredLength} caracteres.`;
        }

        if (this.control.hasError('maxlength')) {
            return `Reduce el texto a máximo ${this.control.errors['maxlength']?.requiredLength} caracteres.`;
        }

        if (this.control.hasError('pattern')) {
            return 'Revisa el formato e intenta nuevamente.';
        }

        return 'Revisa este campo para continuar.';
    }
}
