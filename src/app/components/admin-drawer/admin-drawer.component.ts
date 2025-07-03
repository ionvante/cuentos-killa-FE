import { Component, EventEmitter, Input, Output } from '@angular/core';
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
    { label: 'Configuraciones', route: '/admin/config', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" stroke="#FFAD60" stroke-width="2"/><path d="M19.4 15A1.65 1.65 0 0 0 21 13.35V10.65A1.65 1.65 0 0 0 19.4 9L17.55 7.5L17 5.4A1.65 1.65 0 0 0 15.35 4H8.65A1.65 1.65 0 0 0 7 5.4L6.45 7.5L4.6 9A1.65 1.65 0 0 0 3 10.65V13.35A1.65 1.65 0 0 0 4.6 15L6.45 16.5L7 18.6A1.65 1.65 0 0 0 8.65 20H15.35A1.65 1.65 0 0 0 17 18.6L17.55 16.5L19.4 15Z" stroke="#FFAD60" stroke-width="2"/></svg>' }
    ];

  constructor(private router: Router) {}

  navigate(item: MenuItem) {
    this.router.navigate([item.route]);
    this.closed.emit();
  }
}
