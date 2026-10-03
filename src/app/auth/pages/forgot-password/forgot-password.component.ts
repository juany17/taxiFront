import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
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
              <span class="gradient-text">Recuperar Contraseña</span>
            </h1>
            <p class="text-muted mb-0" style="font-size:0.9rem;">
              Ingresá tu email y te enviamos un link para restablecer tu contraseña.
            </p>
          </div>

          <!-- Estado: enviado -->
          @if (sent) {
            <div class="text-center fade-in-up">
              <div style="font-size:3.5rem;margin-bottom:1rem;">📧</div>
              <h2 class="title" style="font-size:1.2rem;color:var(--accent-primary);">¡Email enviado!</h2>
              <p class="text-muted" style="font-size:0.9rem;margin-top:0.5rem;">
                Si <strong>{{ email }}</strong> está registrado, vas a recibir un email con instrucciones en los próximos minutos.
              </p>
              <p class="text-muted" style="font-size:0.82rem;">Revisá también tu carpeta de spam.</p>
              <a routerLink="/login" class="btn btn-primary mt-2" style="display:inline-flex;width:auto;padding:0.6rem 2rem;">
                <i class="fa-solid fa-arrow-left"></i>
                <span>Volver al login</span>
              </a>
            </div>
          }

          <!-- Formulario -->
          @if (!sent) {
            @if (error) {
              <div class="alert alert-error fade-in-up">
                <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
              </div>
            }

            <form #forgotForm="ngForm" (ngSubmit)="submit()">
              <div class="form-group">
                <i class="fa-solid fa-envelope"></i>
                <input
                  class="form-control"
                  [(ngModel)]="email"
                  name="email"
                  type="email"
                  placeholder="Correo electrónico"
                  required
                  autocomplete="email">
              </div>

              <button
                type="submit"
                class="btn btn-primary mt-2"
                [disabled]="!forgotForm.form.valid || loading">
                @if (loading) {
                  <span>Enviando...</span>
                  <i class="fa-solid fa-spinner fa-spin"></i>
                } @else {
                  <span>Enviar link de recuperación</span>
                  <i class="fa-solid fa-paper-plane"></i>
                }
              </button>
            </form>

            <div class="text-center mt-3">
              <p class="text-muted mb-0" style="font-size:0.88rem;">
                ¿Recordaste la contraseña?
                <a routerLink="/login" style="color:#A78BFA;font-weight:600;"> Volver al login</a>
              </p>
            </div>
          }

        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  sent = false;
  error = '';

  constructor(private auth: AuthService) {}

  submit() {
    this.loading = true;
    this.error = '';

    this.auth.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.sent = true;
      },
      error: () => {
        this.loading = false;
        // Mostramos mensaje genérico igual que si funcionó (seguridad)
        this.sent = true;
      }
    });
  }
}
