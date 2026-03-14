import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-api-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="message" class="api-error" role="alert" aria-live="assertive">
      <span class="icon" aria-hidden="true">⚠️</span>
      <span class="message">{{ message }}</span>
    </div>
  `,
  styles: [`
    .api-error {
      background-color: #fee2e2;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      border: 1px solid #f87171;
    }
    .icon {
      font-size: 1.125rem;
    }
  `]
})
export class ApiErrorComponent {
  @Input() message: string | null = null;
}
