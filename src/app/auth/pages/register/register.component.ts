import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

export const REGISTRATION_PHONE_PATTERN = String.raw`\+?[0-9\s\x2d]{7,20}`;

export function getRegistrationErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica que el backend esté iniciado e intenta de nuevo.';
  }

  if (error.status === 409) {
    return 'El correo electrónico ya está registrado. Inicia sesión o usa otro correo.';
  }

  const message = error.error?.message;
  if (Array.isArray(message)) {
    return message.filter((item): item is string => typeof item === 'string').join('. ');
  }
  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return error.status >= 500
    ? `Error del servidor (${error.status}). Intenta de nuevo más tarde.`
    : `No se pudo completar el registro (error ${error.status}). Revisa los datos e intenta de nuevo.`;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center px-3 py-4 fade-in-up" style="background: var(--bg-deep);">

      <!-- Blobs -->
      <div style="position:fixed;top:-5%;right:-5%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,0.15),transparent 70%);pointer-events:none;z-index:0;"></div>
      <div style="position:fixed;bottom:-5%;left:-5%;width:450px;height:450px;border-radius:50%;background:radial-gradient(circle,rgba(16,185,129,0.10),transparent 70%);pointer-events:none;z-index:0;"></div>

      <div class="border-beam-wrapper w-100 fade-in-scale" style="max-width:500px;position:relative;z-index:1;">
        <div class="glass-panel" style="border-radius:1.5rem;padding:2.5rem 2rem;">

          <!-- Header -->
          <div class="text-center mb-4">
            <img src="img/logo-moto-taxi.png" alt="MotoTaxi" class="auth-brand-logo mb-3">
            <h1 class="title mb-1" style="font-size:1.75rem;">
              <span class="gradient-text">Crear Cuenta</span>
            </h1>
            <p class="text-muted mb-0" style="font-size:0.9rem;">Únete a nuestra comunidad</p>
          </div>

          @if (error) {
            <div class="alert alert-error fade-in-up" role="alert">
              <i class="fa-solid fa-circle-exclamation"></i> {{error}}
            </div>
          }

          <form #registerForm="ngForm" (ngSubmit)="register()">
            <div class="form-group">
              <i class="fa-solid fa-user"></i>
              <input class="form-control" [(ngModel)]="data.nombre" (ngModelChange)="error = ''" #nombre="ngModel"
                     name="nombre" placeholder="Nombre completo" required minlength="2" maxlength="100"
                     autocomplete="name" aria-describedby="nombre-error">
            </div>
            @if (nombre.invalid && (nombre.dirty || nombre.touched)) {
              <small id="nombre-error" class="text-danger d-block mb-3">
                @if (nombre.errors?.['required']) { Ingresa tu nombre. }
                @else { El nombre debe tener entre 2 y 100 caracteres. }
              </small>
            }

            <div class="form-group">
              <i class="fa-solid fa-envelope"></i>
              <input class="form-control" [(ngModel)]="data.email" (ngModelChange)="error = ''" #email="ngModel"
                     name="email" type="email" placeholder="Correo electrónico" required maxlength="254"
                     autocomplete="email" aria-describedby="email-error">
            </div>
            @if (email.invalid && (email.dirty || email.touched)) {
              <small id="email-error" class="text-danger d-block mb-3">
                @if (email.errors?.['required']) { Ingresa tu correo electrónico. }
                @else if (email.errors?.['email']) { Ingresa un correo electrónico válido. }
                @else { El correo no puede superar los 254 caracteres. }
              </small>
            }

            <div class="form-group">
              <i class="fa-solid fa-phone"></i>
              <input class="form-control" [(ngModel)]="data.telefono" (ngModelChange)="error = ''" #telefono="ngModel"
                     name="telefono" type="tel" placeholder="Teléfono" required [pattern]="phonePattern"
                     autocomplete="tel" aria-describedby="telefono-error">
            </div>
            @if (telefono.invalid && (telefono.dirty || telefono.touched)) {
              <small id="telefono-error" class="text-danger d-block mb-3">
                Ingresa un teléfono válido (7 a 20 caracteres: números, espacios o guiones).
              </small>
            }

            <div class="form-group">
              <i class="fa-solid fa-lock"></i>
              <input class="form-control" [(ngModel)]="data.password" (ngModelChange)="error = ''" #password="ngModel"
                     name="password" type="password" placeholder="Contraseña" required minlength="8" maxlength="100"
                     autocomplete="new-password" aria-describedby="password-error">
            </div>
            @if (password.invalid && (password.dirty || password.touched)) {
              <small id="password-error" class="text-danger d-block mb-3">
                @if (password.errors?.['required']) { Ingresa una contraseña. }
                @else if (password.errors?.['minlength']) { La contraseña debe tener al menos 8 caracteres. }
                @else { La contraseña no puede superar los 100 caracteres. }
              </small>
            }

            <div class="form-group">
              <i class="fa-solid fa-id-badge"></i>
              <select class="form-control" [(ngModel)]="data.rol" name="rol" required>
                <option value="pasajero">🛵 Quiero ser Pasajero</option>
                <option value="conductor">🏍️ Quiero ser Conductor</option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary mt-2" [disabled]="!registerForm.form.valid || loading">
              @if (loading) {
                <span>Creando cuenta...</span>
                <i class="fa-solid fa-circle-notch fa-spin"></i>
              } @else {
                <span>Crear cuenta</span>
                <i class="fa-solid fa-check"></i>
              }
            </button>
          </form>

          <div class="text-center mt-3">
            <p class="text-muted mb-0" style="font-size:0.88rem;">
              ¿Ya tienes cuenta?
              <a routerLink="/login" style="color:#A78BFA;font-weight:600;"> Inicia sesión</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  data: any = { nombre: '', email: '', telefono: '', password: '', rol: 'pasajero' };
  readonly phonePattern = REGISTRATION_PHONE_PATTERN;
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    if (this.loading) return;
    this.loading = true;
    this.error = '';
    this.auth.register(this.data).subscribe({
      next: (res) => {
        this.auth.saveAuth(res);
        if (res.user.rol === 'conductor') {
          this.router.navigate(['/driver/home']);
        } else {
          this.router.navigate(['/passenger/home']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error = getRegistrationErrorMessage(err);
        this.loading = false;
      }
    });
  }
}