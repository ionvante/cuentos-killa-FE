import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService} from '../../../services/auth.service';
import { LazyLoadImageDirective } from '../../../directives/lazy-load-image.directive';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LazyLoadImageDirective],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  loginForm!: FormGroup;
  error: string = '';
  returnTo: string = '/';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService:AuthService

  ) {}

  ngOnInit(): void {
    this.returnTo = this.route.snapshot.queryParamMap.get('returnTo') || '/';

    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  iniciarSesion(): void {
    const { correo, password } = this.loginForm.value;

    this.authService.login(correo, password).subscribe({
      next: (res) => {
        const usuario = res.user;
        console.log('Login exitoso', usuario.role||usuario.nombre||usuario.email||usuario.documento);
        this.authService.guardarToken(res.token);
        this.authService.guardarUsuario(usuario); // o res.user, según tu backend
        
        const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
        // Redirección dinámica según el rol        
      if (returnTo) {
        this.router.navigateByUrl(returnTo);
      } else if (usuario.role === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/home']);
      }

      // Notifica al contenedor para cerrar el modal si aplica
      this.close.emit();
      },
      error: (err) => {
        this.error=err;
        console.error('Error al iniciar sesión',err);
      }
    });
}
}