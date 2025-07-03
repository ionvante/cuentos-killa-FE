import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
    { label: 'Dashboard', route: '/admin/dashboard', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4H10V10H4V4Z" stroke="#FFAD60" stroke-width="2"/><path d="M14 4H20V10H14V4Z" stroke="#FFAD60" stroke-width="2"/><path d="M4 14H10V20H4V14Z" stroke="#FFAD60" stroke-width="2"/><path d="M14 14H20V20H14V14Z" stroke="#FFAD60" stroke-width="2"/></svg>' },
    { label: 'Cuentos', route: '/admin/cuentos', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4H20V20L12 16L4 20V4Z" stroke="#FFAD60" stroke-width="2"/></svg>' },
    { label: 'Pedidos', route: '/admin/pedidos', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9V20H18V9" stroke="#FFAD60" stroke-width="2"/><path d="M3 5H21V9H3V5Z" stroke="#FFAD60" stroke-width="2"/></svg>' },
    { label: 'Usuarios', route: '/admin/usuarios', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#FFAD60" stroke-width="2"/><path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22" stroke="#FFAD60" stroke-width="2"/></svg>' },
    { label: 'Config', route: '/admin/config', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#FFAD60" stroke-width="2"/><path d="M19.4 15A7.96 7.96 0 0020 12C20 11.3 19.9 10.6 19.7 10M4.6 9A7.96 7.96 0 004 12C4 12.7 4.1 13.4 4.3 14M15 4.6A7.96 7.96 0 0012 4C11.3 4 10.6 4.1 10 4.3M9 19.4A7.96 7.96 0 0012 20C12.7 20 13.4 19.9 14 19.7" stroke="#FFAD60" stroke-width="2"/></svg>' }
  ];
  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  sanitize(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  navigate(item: MenuItem) {
    this.router.navigate([item.route]);
    this.closed.emit();
  }
}
