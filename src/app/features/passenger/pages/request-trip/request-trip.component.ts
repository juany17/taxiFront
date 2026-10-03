import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../../../core/services/trip.service';

@Component({
  selector: 'app-request-trip',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="app-container fade-in-up">
      <!-- Navbar -->
      <nav class="navbar passenger-page-navbar">
        <div class="navbar-container">
          <a routerLink="/passenger/home" class="navbar-brand">
            <img src="img/logo-moto-taxi.png" alt="MotoTaxi" class="brand-logo">
            <span class="badge badge-accepted" style="font-size:0.6rem;margin-left:0.35rem;">Pasajero</span>
          </a>
          <div class="navbar-nav passenger-nav-links">
            <a routerLink="/passenger/home" class="nav-link" aria-label="Inicio" title="Inicio">
              <i class="fa-solid fa-house"></i><span class="passenger-nav-label">Inicio</span>
            </a>
            <a routerLink="/passenger/trips" class="nav-link" aria-label="Mis viajes" title="Mis viajes">
              <i class="fa-solid fa-clock-rotate-left"></i><span class="passenger-nav-label">Mis viajes</span>
            </a>
          </div>
        </div>
      </nav>

      <main class="main-content center-content" style="min-height:calc(100vh - 70px);">
        <div class="border-beam-wrapper w-100" style="max-width:520px;">
          <div class="glass-panel" style="border-radius:1.5rem;padding:2.5rem 2rem;">

            <!-- Header -->
            <div class="text-center mb-4">
              <div class="icon-box-lg mx-auto mb-3" style="background:linear-gradient(135deg,var(--primary),#A78BFA);color:white;border-radius:1.25rem;box-shadow:0 10px 30px rgba(124,58,237,0.4);">
                <i class="fa-solid fa-motorcycle"></i>
              </div>
              <h1 class="title mb-1" style="font-size:1.75rem;">
                <span class="gradient-text">¿A dónde vamos?</span>
              </h1>
              <p class="text-muted mb-0" style="font-size:0.9rem;">Ingresa tu origen y destino para encontrar un conductor.</p>
            </div>

            <form (ngSubmit)="submit()" #tripForm="ngForm">
              <!-- Origen -->
              <div class="form-group">
                <i class="fa-solid fa-location-dot" style="color:#A78BFA;"></i>
                <input class="form-control" [(ngModel)]="data.origin_address" name="origin_address"
                       placeholder="Dirección de origen (ej. Av. Mitre 123)" required>
              </div>

              <!-- Connector line -->
              <div style="margin-left:1.2rem;border-left:2px dashed rgba(255,255,255,0.12);height:18px;margin-bottom:1.35rem;"></div>

              <!-- Destino -->
              <div class="form-group mb-4">
                <i class="fa-solid fa-flag-checkered" style="color:#6EE7B7;"></i>
                <input class="form-control" [(ngModel)]="data.destination_address" name="destination_address"
                       placeholder="Dirección de destino (ej. Plaza Central)" required>
              </div>

              @if (error) {
                <div class="alert alert-error">
                  <i class="fa-solid fa-circle-exclamation"></i> {{error}}
                </div>
              }
              @if (success) {
                <div class="alert alert-success">
                  <i class="fa-solid fa-circle-check"></i> ¡Viaje solicitado con éxito! Redirigiendo...
                </div>
              }

              <button type="submit" class="btn btn-primary" [disabled]="!tripForm.form.valid || loading" style="font-size:1.05rem;padding:0.85rem;">
                @if (loading) {
                  <i class="fa-solid fa-circle-notch fa-spin"></i> Solicitando conductor...
                } @else {
                  <i class="fa-solid fa-motorcycle"></i> Solicitar Mototaxi
                }
              </button>
            </form>

          </div>
        </div>
      </main>
    </div>
  `
})
export class RequestTripComponent {
  data: any = { origin_address: '', destination_address: '' };
  error = '';
  success = false;
  loading = false;
  tripId = '';

  constructor(private tripService: TripService, private router: Router) {}

  submit() {
    this.loading = true;
    this.error = '';
    // Mock coordinates for now
    this.data.origin_lat = -24.18;
    this.data.origin_lng = -65.30;
    this.data.destination_lat = -24.17;
    this.data.destination_lng = -65.29;

    this.tripService.createTrip(this.data).subscribe({
      next: (trip) => {
        this.success = true;
        this.tripId = trip.id;
        this.router.navigate(['/passenger/home'], { queryParams: { tripId: trip.id } });
      },
      error: () => {
        this.error = 'Error al crear viaje. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }
}