import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService} from '../../../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
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
        const usuario = res.usuario;
        console.log(usuario);
        this.authService.guardarToken(res.token);
        this.authService.guardarUsuario(usuario); // o res.user, según tu backend
        
        const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
        // Redirección dinámica según el rol
      if (returnTo) {
        this.router.navigateByUrl(returnTo);
      } else if (usuario.rol === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/home']);
      }
      },
      error: (err) => {
        this.error = 'Correo o contraseña inválidos.';
        console.error(err);
      }
    });
}
}