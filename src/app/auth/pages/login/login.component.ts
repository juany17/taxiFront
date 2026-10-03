import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center px-3 fade-in-up" style="background: var(--bg-deep);">

      <!-- Decorative blobs -->
      <div style="position:fixed;top:-10%;left:-10%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,0.18),transparent 70%);pointer-events:none;z-index:0;"></div>
      <div style="position:fixed;bottom:-10%;right:-10%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(245,158,11,0.10),transparent 70%);pointer-events:none;z-index:0;"></div>

      <div class="border-beam-wrapper w-100 fade-in-scale" style="max-width:440px;position:relative;z-index:1;">
        <div class="glass-panel" style="border-radius:1.5rem;padding:2.5rem 2rem;">

          <!-- Header -->
          <div class="text-center mb-4">
            <img src="img/logo-moto-taxi.png" alt="MotoTaxi" class="auth-brand-logo mb-3">
            <h1 class="title mb-1" style="font-size:1.75rem;">
              <span class="gradient-text">Iniciar Sesión</span>
            </h1>
            <p class="text-muted mb-0" style="font-size:0.9rem;">Bienvenido de vuelta</p>
          </div>

          @if (error) {
            <div class="alert alert-error fade-in-up">
              <i class="fa-solid fa-circle-exclamation"></i> {{error}}
            </div>
          }

          <form #loginForm="ngForm" (ngSubmit)="login()">
            <div class="form-group">
              <i class="fa-solid fa-envelope"></i>
              <input class="form-control" [(ngModel)]="email" name="email" type="email"
                     placeholder="Correo electrónico" required autocomplete="email">
            </div>

            <div class="form-group">
              <i class="fa-solid fa-lock"></i>
              <input class="form-control" [(ngModel)]="pass" name="pass" type="password"
                     placeholder="Contraseña" required autocomplete="current-password">
            </div>

            <div class="text-end mb-2" style="margin-top:-0.25rem;">
              <a routerLink="/forgot-password" style="font-size:0.82rem;color:#A78BFA;font-weight:500;">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" class="btn btn-primary mt-2" [disabled]="!loginForm.form.valid">
              <span>Entrar</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </form>

          <div class="text-center mt-3">
            <p class="text-muted mb-0" style="font-size:0.88rem;">
              ¿No tienes cuenta?
              <a routerLink="/register" style="color:#A78BFA;font-weight:600;"> Regístrate aquí</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  pass = '';
  error = '';

  constructor(private auth: AuthService, private router: Router, private socket: SocketService) {}

  login() {
    this.auth.login(this.email, this.pass).subscribe({
      next: (res) => {
        this.auth.getMe(res.token).subscribe({
          next: (user) => {
            this.auth.saveAuth({ token: res.token, user });
            // El socket se abre antes del login: hay que darle el token nuevo
            // para que el gateway acepte la conexion.
            this.socket.refreshAuthToken(res.token);
            if (user.rol === 'conductor') {
              this.router.navigate(['/driver/home']);
            } else if (user.rol === 'admin') {
              this.router.navigate(['/admin/home']);
            } else {
              this.router.navigate(['/passenger/home']);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.error = err.error?.message
              ? `Error al obtener usuario: ${err.error.message}`
              : `Error al obtener usuario (${err.status || 'sin respuesta'})`;
          }
        });
      },
      error: () => this.error = 'Credenciales inválidas. Por favor intenta nuevamente.'
    });
  }
}
