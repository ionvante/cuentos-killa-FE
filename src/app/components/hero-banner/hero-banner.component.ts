import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-banner',
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroBannerComponent {

  constructor(private router: Router) { }

  /** El hero completo actúa como botón "Ver cuentos" */
  irACuentos(): void {
    this.router.navigate(['/cuentos']);
  }
}
