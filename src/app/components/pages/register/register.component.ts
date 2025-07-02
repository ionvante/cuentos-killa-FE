import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LazyLoadImageDirective } from '../../../directives/lazy-load-image.directive';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LazyLoadImageDirective],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      password: ['', Validators.required],
      confirmarPassword: ['', Validators.required]
    });
  }

  registrar(): void {
    if (this.registerForm.invalid) return;

    const { password, confirmarPassword, ...rest } = this.registerForm.value;
    if (password !== confirmarPassword) {
      this.error = 'Las contrase\u00f1as no coinciden';
      return;
    }

    const data = { ...rest, password, role: 'USER' };

    this.authService.register(data).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => {
        console.error('Error al registrar usuario', err);
        this.error = 'No se pudo registrar el usuario';
      }
    });
  }
}
