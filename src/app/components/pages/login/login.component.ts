import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnTo = this.route.snapshot.queryParamMap.get('returnTo') || '/';

    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  iniciarSesion(): void {
    if (this.loginForm.invalid) return;

    const { correo, password } = this.loginForm.value;

    // Aquí deberías reemplazar con tu lógica real de autenticación
    if (correo === 'test@killa.com' && password === '123456') {
      const usuario = {
        nombre: 'Daniel',
        correo,
        telefono: '999999999'
      };

      localStorage.setItem('userData', JSON.stringify(usuario));
      this.router.navigateByUrl(this.returnTo);
    } else {
      this.error = 'Credenciales inválidas';
    }
  }
}