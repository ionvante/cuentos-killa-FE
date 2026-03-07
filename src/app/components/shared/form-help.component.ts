import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-form-help',
  imports: [CommonModule],
  template: `
    <small class="form-help" [attr.id]="id" *ngIf="text">{{ text }}</small>
  `,
  styles: [`
    .form-help {
      display: block;
      margin-top: 0.25rem;
      color: #5f6b7a;
      font-size: 0.82rem;
      line-height: 1.35;
    }
  `]
})
export class FormHelpComponent {
  @Input() text = '';
  @Input() id = '';
}
