import { Component, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TripService } from '../../../../core/services/trip.service';
import { Trip } from '../../../../models';
import { FeedbackFormComponent } from '../../../feedback/feedback-form.component';
import { DriverNavbarComponent } from '../../components/driver-navbar.component';

@Component({
  selector: 'app-driver-active-trip',
  standalone: true,
  imports: [RouterLink, FeedbackFormComponent, DriverNavbarComponent],
  template: `
    <div class="app-container fade-in-up">
      <app-driver-navbar></app-driver-navbar>

      <main class="main-content center-content" style="min-height: calc(100vh - 70px);">
        @if (trip()) {
          <div class="glass-panel" style="max-width: 500px; width: 100%; position: relative; overflow: hidden;">
            
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; background: var(--primary);"></div>

            <div class="text-center mb-4">
              <span class="badge badge-accepted mb-2">VIAJE EN CURSO</span>
              <h2 class="title">Viaje Activo</h2>
            </div>
            
            <div class="card" style="box-shadow: none;">
              <div class="card-row">
                <i class="fa-solid fa-location-dot"></i>
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Recoger en</div>
                  <div style="font-size: 1.1rem; color: var(--text-main); font-weight: 500;">{{ trip()!.origin_address }}</div>
                </div>
              </div>
              
              <div style="margin-left: 8px; border-left: 2px dashed rgba(255,255,255,0.2); height: 20px; margin-bottom: 0.5rem;"></div>

              <div class="card-row">
                <i class="fa-solid fa-flag-checkered" style="color: var(--success);"></i>
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Llevar a</div>
                  <div style="font-size: 1.1rem; color: var(--text-main); font-weight: 500;">{{ trip()!.destination_address }}</div>
                </div>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; border-bottom: 1px solid var(--glass-border); margin-bottom: 1.5rem;">
              <span style="font-size: 1.1rem; color: var(--text-muted);">Tarifa a cobrar:</span>
              <span class="font-bold" style="font-size: 2rem; color: #6EE7B7;">\${{ trip()!.fare }}</span>
            </div>

            @if (trip()!.status === 'aceptado') {
              <button (click)="complete()" class="btn btn-primary" style="padding: 1.25rem; font-size: 1.25rem;">
                <i class="fa-solid fa-flag"></i> Finalizar Viaje
              </button>
            }
            @if (trip()!.status === 'finalizado') {
              <div class="alert alert-success mt-4 mb-0">
                <i class="fa-solid fa-check-circle"></i> Viaje finalizado exitosamente
              </div>
              <a routerLink="/driver/home" class="btn btn-outline mt-3">
                Volver al inicio
              </a>
              <app-feedback-form [tripId]="trip()!.id"></app-feedback-form>
            }
          </div>
        } @else {
          <div class="text-center">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 3rem; color: var(--primary);"></i>
            <p class="mt-3">Cargando detalles del viaje...</p>
          </div>
        }
      </main>
    </div>
  `
})
export class DriverActiveTripComponent {
  trip = signal<Trip | null>(null);

  constructor(
    private tripService: TripService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tripService.getTrip(id).subscribe(t => this.trip.set(t));
    }
  }

  complete() {
    const id = this.trip()!.id;
    this.tripService.completeTrip(id).subscribe({
      next: () => this.router.navigate(['/driver/home']),
      error: () => alert('Error al finalizar')
    });
  }
}