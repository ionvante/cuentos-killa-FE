import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService} from '../../../services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
    private authService:AuthService,
    @Optional() private dialogRef?: MatDialogRef<LoginComponent> // 👈 usando @Optional()

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

      // CIERRA el modal
      this.dialogRef?.close(); // 👈 Solo si existe
      },
      error: (err) => {
        this.error=err;
        console.error('Error al iniciar sesión',err);
      }
    });
}
}