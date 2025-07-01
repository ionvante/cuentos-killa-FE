import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-hero-banner',
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroBannerComponent {
  subtitle = 'Suscríbete a nuestra newsletter';
}
