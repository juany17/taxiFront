import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
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
              <span class="gradient-text">Nueva Contraseña</span>
            </h1>
            <p class="text-muted mb-0" style="font-size:0.9rem;">Elegí una contraseña nueva y segura.</p>
          </div>

          <!-- Token inválido / faltante -->
          @if (!token) {
            <div class="text-center fade-in-up">
              <div style="font-size:3.5rem;margin-bottom:1rem;">⚠️</div>
              <h2 class="title" style="font-size:1.1rem;color:#f59e0b;">Link inválido</h2>
              <p class="text-muted" style="font-size:0.9rem;margin-top:0.5rem;">
                Este link de recuperación no es válido o ya expiró.
              </p>
              <a routerLink="/forgot-password" class="btn btn-primary mt-2" style="display:inline-flex;width:auto;padding:0.6rem 2rem;">
                <i class="fa-solid fa-rotate-left"></i>
                <span>Solicitar nuevo link</span>
              </a>
            </div>
          }

          <!-- Éxito -->
          @if (success) {
            <div class="text-center fade-in-up">
              <div style="font-size:3.5rem;margin-bottom:1rem;">✅</div>
              <h2 class="title" style="font-size:1.2rem;color:var(--accent-primary);">¡Contraseña cambiada!</h2>
              <p class="text-muted" style="font-size:0.9rem;margin-top:0.5rem;">
                Tu contraseña fue actualizada correctamente. Ya podés iniciar sesión.
              </p>
              <a routerLink="/login" class="btn btn-primary mt-2" style="display:inline-flex;width:auto;padding:0.6rem 2rem;">
                <i class="fa-solid fa-arrow-right"></i>
                <span>Ir al login</span>
              </a>
            </div>
          }

          <!-- Formulario -->
          @if (token && !success) {
            @if (error) {
              <div class="alert alert-error fade-in-up">
                <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
              </div>
            }

            <form #resetForm="ngForm" (ngSubmit)="submit()">
              <!-- Nueva contraseña -->
              <div class="form-group">
                <i class="fa-solid fa-lock"></i>
                <input
                  class="form-control"
                  [(ngModel)]="newPassword"
                  name="newPassword"
                  [type]="showPass ? 'text' : 'password'"
                  placeholder="Nueva contraseña"
                  required
                  minlength="6"
                  autocomplete="new-password">
                <button
                  type="button"
                  (click)="showPass = !showPass"
                  style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);padding:0;">
                  <i [class]="showPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                </button>
              </div>

              <!-- Confirmar contraseña -->
              <div class="form-group">
                <i class="fa-solid fa-lock-open"></i>
                <input
                  class="form-control"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  [type]="showPass ? 'text' : 'password'"
                  placeholder="Confirmar contraseña"
                  required
                  autocomplete="new-password">
              </div>

              <!-- Indicador de fuerza -->
              @if (newPassword.length > 0) {
                <div style="margin-bottom:1rem;">
                  <div style="display:flex;gap:4px;margin-bottom:4px;">
                    @for (bar of [1,2,3,4]; track bar) {
                      <div style="flex:1;height:4px;border-radius:4px;transition:background 0.3s;"
                           [style.background]="bar <= strength ? strengthColor : 'rgba(255,255,255,0.1)'"></div>
                    }
                  </div>
                  <p style="font-size:0.78rem;color:var(--text-muted);margin:0;">
                    Fortaleza: <span [style.color]="strengthColor">{{ strengthLabel }}</span>
                  </p>
                </div>
              }

              <button
                type="submit"
                class="btn btn-primary mt-1"
                [disabled]="!resetForm.form.valid || newPassword !== confirmPassword || loading">
                @if (loading) {
                  <span>Guardando...</span>
                  <i class="fa-solid fa-spinner fa-spin"></i>
                } @else {
                  <span>Cambiar contraseña</span>
                  <i class="fa-solid fa-check"></i>
                }
              </button>

              @if (newPassword && confirmPassword && newPassword !== confirmPassword) {
                <p style="font-size:0.82rem;color:#f87171;text-align:center;margin-top:0.5rem;">
                  <i class="fa-solid fa-triangle-exclamation"></i> Las contraseñas no coinciden
                </p>
              }
            </form>

            <div class="text-center mt-3">
              <p class="text-muted mb-0" style="font-size:0.88rem;">
                <a routerLink="/login" style="color:#A78BFA;font-weight:600;">
                  <i class="fa-solid fa-arrow-left" style="font-size:0.8rem;"></i> Volver al login
                </a>
              </p>
            </div>
          }

        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  newPassword = '';
  confirmPassword = '';
  showPass = false;
  loading = false;
  success = false;
  error = '';

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  get strength(): number {
    const p = this.newPassword;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p) || /[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return score;
  }

  get strengthColor(): string {
    return ['#f87171', '#fb923c', '#facc15', '#4ade80'][this.strength - 1] ?? '#f87171';
  }

  get strengthLabel(): string {
    return ['Muy débil', 'Débil', 'Media', 'Fuerte'][this.strength - 1] ?? 'Muy débil';
  }

  submit() {
    if (!this.token || this.newPassword !== this.confirmPassword) return;

    this.loading = true;
    this.error = '';

    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        // Redirige al login después de 3 segundos
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message ?? 'El link es inválido o ya expiró. Solicitá uno nuevo.';
      }
    });
  }
}
