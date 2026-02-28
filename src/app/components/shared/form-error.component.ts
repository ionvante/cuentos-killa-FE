import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-form-error',
    imports: [CommonModule],
    template: `
    <div class="form-error-container" aria-live="polite" *ngIf="shouldShowErrors()">
      <span class="error-msg" *ngIf="control?.hasError('required')">Este campo es requerido.</span>
      <span class="error-msg" *ngIf="control?.hasError('email')">Formato de correo inválido.</span>
      <span class="error-msg" *ngIf="control?.hasError('minlength')">Debe tener al menos {{control?.errors?.['minlength']?.requiredLength}} caracteres.</span>
      <span class="error-msg" *ngIf="control?.hasError('maxlength')">No puede pasar de {{control?.errors?.['maxlength']?.requiredLength}} caracteres.</span>
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

    shouldShowErrors(): boolean {
        return !!this.control && this.control.invalid && (this.control.touched || this.control.dirty || this.isSubmitted);
    }
}
