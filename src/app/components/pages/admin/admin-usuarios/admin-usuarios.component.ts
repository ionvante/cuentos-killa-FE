import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../model/user.model';

@Component({
  selector: 'app-admin-usuarios',
  // standalone: true,
  // imports: [],
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.scss']
})
export class AdminUsuariosComponent implements OnInit {
  usuarios: User[] = [];
  isLoading = true;
  errorMensaje: string | null = null;
  isMobile = false;

  constructor(private userService: UserService, private router: Router) {}

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 600;
  }

  ngOnInit(): void {
    this.onResize();
    this.userService.obtenerUsuarios().subscribe({
      next: data => {
        this.usuarios = data;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error fetching users:', err);
        this.errorMensaje = 'No se pudieron cargar los usuarios';
        this.isLoading = false;
      }
    });
  }

  toggleHabilitar(user: User): void {
    const nuevoEstado = !user.habilitado;
    const id = user.id || 0;
    this.userService.cambiarEstado(id, nuevoEstado).subscribe({
      next: updated => {
        user.habilitado = updated.habilitado;
      },
      error: err => console.error('Error updating user state', err)
    });
  }

  enviarCorreo(user: User): void {
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:${user.email}`;
    }
  }

  hacerAdmin(user: User): void {
    const id = user.id || 0;
    this.userService.convertirEnAdmin(id).subscribe({
      next: updated => {
        user.role = updated.role;
      },
      error: err => console.error('Error converting user to admin', err)
    });
  }

  verPedidos(user: User): void {
    this.router.navigate(['/admin/pedidos'], { queryParams: { userId: user.id } });
  }

  trackById(_: number, u: User): number | undefined {
    return u.id;
  }
}
