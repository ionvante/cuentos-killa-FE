import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-hero-banner',
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroBannerComponent {
  subtitle = 'Suscríbete y obtén 10 % de descuento en tu primera compra';

  suscribirse(email: string) {
    console.log('Suscribir', email);
  }
}
