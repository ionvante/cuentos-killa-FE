import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  @Input() currentItemName?: string;
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.buildBreadcrumb(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.buildBreadcrumb(event.urlAfterRedirects);
      });
  }

  private buildBreadcrumb(url: string) {
    this.breadcrumbs = [{ label: 'Inicio', url: '/home' }];

    // Rutas simples parsing
    const parts = url.split('?')[0].split('/').filter(p => p);

    if (parts.length > 0) {
      if (parts[0] === 'cuentos') {
        this.breadcrumbs.push({ label: 'Cuentos', url: '/cuentos' });
      } else if (parts[0] === 'cuento') {
        this.breadcrumbs.push({ label: 'Cuentos', url: '/cuentos' });
        if (this.currentItemName) {
          this.breadcrumbs.push({ label: this.currentItemName, url: '' });
        } else {
          this.breadcrumbs.push({ label: 'Detalle', url: '' });
        }
      } else if (parts[0] !== 'home') {
        const lbl = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        this.breadcrumbs.push({ label: lbl, url: '/' + parts[0] });
      }
    }
  }
}
