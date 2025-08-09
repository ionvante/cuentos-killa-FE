import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-drawer.component.html',
  styleUrls: ['./admin-drawer.component.scss']
})
export class AdminDrawerComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Cuentos', route: '/admin/cuentos', icon: 'cuentos' },
    { label: 'Pedidos', route: '/admin/pedidos', icon: 'pedidos' },
    { label: 'Usuarios', route: '/admin/usuarios', icon: 'usuarios' },
    { label: 'Config', route: '/admin/config', icon: 'config' }
  ];
  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  iconUrl(icon: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icon}.svg`);
  }

  navigate(item: MenuItem) {
    this.router.navigate([item.route]);
    this.closed.emit();
  }
}
