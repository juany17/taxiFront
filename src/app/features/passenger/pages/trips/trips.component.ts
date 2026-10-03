import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TripService } from '../../../../core/services/trip.service';
import { SocketService } from '../../../../core/services/socket.service';
import { Trip } from '../../../../models';
import { FeedbackFormComponent } from '../../../feedback/feedback-form.component';

@Component({
  selector: 'app-passenger-trips',
  standalone: true,
  imports: [RouterLink, FeedbackFormComponent],
  template: `
    <div class="app-container fade-in-up">
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
            <a routerLink="/passenger/trips" class="nav-link active" aria-label="Mis viajes" title="Mis viajes">
              <i class="fa-solid fa-clock-rotate-left"></i><span class="passenger-nav-label">Mis viajes</span>
            </a>
          </div>
        </div>
      </nav>

      <main class="main-content">
        <div class="mb-4" style="display: flex; justify-content: space-between; align-items: center;">
          <h2 class="title mb-0">Mis Viajes</h2>
          <a routerLink="/passenger/request-trip" class="btn btn-primary" style="width: auto;">
            <i class="fa-solid fa-plus"></i> Nuevo Viaje
          </a>
        </div>

        @if (liveNotification) {
          <div class="alert alert-success fade-in-up mb-4" style="font-size: 1.1rem; padding: 1.25rem;">
            <i class="fa-solid fa-bell fa-bounce" style="margin-right: 0.5rem;"></i>
            {{ liveNotification }}
          </div>
        }
        
        @if (trips().length === 0) {
          <div class="glass-panel text-center" style="padding: 4rem 2rem;">
            <i class="fa-solid fa-route" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
            <h3 class="font-bold mb-2">No tienes viajes aún</h3>
            <p class="text-muted mb-4">Cuando solicites un mototaxi, aparecerá aquí.</p>
            <a routerLink="/passenger/request-trip" class="btn btn-primary" style="width: auto; margin: 0 auto;">
              Pedir mi primer viaje
            </a>
          </div>
        } @else {
          <div class="cards-grid">
            @for (trip of trips(); track trip.id) {
              <div class="card" [style.border-left]="trip.status === 'aceptado' ? '5px solid var(--primary)' : '1px solid rgba(255,255,255,0.15)'">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                  <span class="badge" [class]="getBadgeClass(trip.status)">
                    {{ trip.status }}
                  </span>
                  <span class="font-bold" style="font-size: 1.25rem; color: #6EE7B7;">\${{ trip.fare }}</span>
                </div>
                
                @if (trip.status === 'aceptado' && trip.driver) {
                  <div class="alert alert-success mb-3" style="text-align: left; padding: 0.75rem;">
                    <strong style="display: block; font-size: 0.95rem;">
                      <i class="fa-solid fa-helmet-safety"></i> Conductor en camino: {{ trip.driver.nombre }}
                    </strong>
                    <span style="font-size: 0.85rem;">Teléfono: {{ trip.driver.telefono }}</span>
                  </div>
                }

                @if (trip.driver) {
                  <div class="trip-driver-info">
                    <div class="trip-driver-title">
                      <i class="fa-solid fa-helmet-safety"></i>
                      <strong>Información del conductor</strong>
                    </div>
                    <div class="trip-driver-details">
                      <span><i class="fa-solid fa-user"></i> {{ trip.driver.nombre }}</span>
                      @if (trip.vehicle) {
                        <span><i class="fa-solid fa-motorcycle"></i> {{ trip.vehicle.marca }} {{ trip.vehicle.modelo }}</span>
                        <span><i class="fa-solid fa-id-card"></i> Patente: {{ trip.vehicle.placa }}</span>
                      }
                    </div>
                  </div>
                }

                <div class="card-row">
                  <i class="fa-solid fa-location-dot" style="color: var(--primary);"></i>
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Origen</div>
                    <div style="font-weight: 500; color: var(--text-main);">{{ trip.origin_address }}</div>
                  </div>
                </div>
                
                <div class="card-row mb-0">
                  <i class="fa-solid fa-flag-checkered" style="color: var(--success);"></i>
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Destino</div>
                    <div style="font-weight: 500; color: var(--text-main);">{{ trip.destination_address }}</div>
                  </div>
                </div>
                @if (trip.status === 'finalizado') {
                  <app-feedback-form [tripId]="trip.id"></app-feedback-form>
                }
              </div>
            }
          </div>
        }
      </main>

      @if (reviewPromptTrip()) {
        <div class="review-modal-backdrop" role="dialog" aria-modal="true">
          <div class="review-modal">
            <button class="review-modal-close" type="button" (click)="dismissReviewPrompt()" aria-label="Omitir calificación">&times;</button>
            <div class="review-modal-icon"><i class="fa-solid fa-star"></i></div>
            <h2 class="title">¿Cómo fue tu viaje?</h2>
            <p class="text-muted">Califica a {{ reviewPromptTrip()!.driver?.nombre || 'tu conductor' }}. Puedes hacerlo ahora u omitirlo.</p>
            <app-feedback-form [tripId]="reviewPromptTrip()!.id" [reviewOnly]="true"></app-feedback-form>
            <button type="button" class="review-skip-button" (click)="dismissReviewPrompt()">Omitir por ahora</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .main-content { display: flex; flex-direction: column; align-items: center; }
    .main-content > * { width: 100%; max-width: 1000px; }
    .cards-grid { width: 100%; }
    .card { width: 100%; max-width: 760px; margin: 0 auto 1rem; }
    .trip-driver-info { margin: 1rem 0; padding: 0.9rem 1rem; border-radius: 12px; background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.25); }
    .trip-driver-title { display: flex; align-items: center; gap: 0.5rem; color: #C4B5FD; margin-bottom: 0.65rem; }
    .trip-driver-details { display: flex; flex-wrap: wrap; gap: 0.65rem 1rem; color: var(--text-main); font-size: 0.9rem; }
    .trip-driver-details span { display: inline-flex; align-items: center; gap: 0.35rem; }
    .trip-driver-details i { color: var(--text-muted); }
    .review-modal-backdrop { position: fixed; inset: 0; z-index: 1100; display: flex; align-items: center; justify-content: center; padding: 1rem; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); }
    .review-modal { position: relative; width: min(100%, 560px); max-height: 90vh; overflow-y: auto; padding: 2rem; text-align: center; background: #1A1730; border: 1px solid var(--glass-border); border-radius: 1.25rem; box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6); color: var(--text-main); }
    .review-modal .title { margin-bottom: 0.5rem; color: #FFFFFF; }
    .review-modal-icon { display: flex; align-items: center; justify-content: center; width: 58px; height: 58px; margin: 0 auto 1rem; border-radius: 50%; color: white; background: linear-gradient(135deg, var(--warning), #FBBF24); font-size: 1.5rem; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.35); }
    .review-modal-close { position: absolute; top: 0.85rem; right: 1rem; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.08); border-radius: 50%; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 1.2rem; cursor: pointer; transition: var(--transition); }
    .review-modal-close:hover { background: rgba(255,255,255,0.15); color: #FFFFFF; }
    .review-skip-button { margin-top: 1rem; border: 0; background: transparent; color: var(--text-muted); cursor: pointer; text-decoration: underline; font-size: 0.9rem; }
    .review-skip-button:hover { color: #FFFFFF; }
    @media (max-width: 560px) { .review-modal { padding: 1.5rem 1rem; } .trip-driver-details { flex-direction: column; gap: 0.45rem; } }
  `],
})
export class PassengerTripsComponent implements OnInit, OnDestroy {
  private tripService = inject(TripService);
  private socketService = inject(SocketService);
  private route = inject(ActivatedRoute);

  trips = signal<Trip[]>([]);
  liveNotification = '';
  reviewPromptTrip = signal<Trip | null>(null);
  private subs: Subscription[] = [];

  ngOnInit() {
    this.loadMyTrips();

    // Escuchar actualizaciones de estado de viaje en tiempo real
    this.subs.push(
      this.socketService.onTripStatusChanged().subscribe((updatedTrip) => {
        this.updateTripInList(updatedTrip);
        if (updatedTrip.status === 'aceptado') {
          const driverName = updatedTrip.driver?.nombre || 'Un mototaxista';
          this.liveNotification = `⚡ ¡${driverName} ha aceptado tu viaje y está en camino!`;
        } else if (updatedTrip.status === 'finalizado') {
          this.liveNotification = `🏁 El viaje hacia ${updatedTrip.destination_address} ha finalizado. ¡Gracias por usar MotoTaxi!`;
          this.reviewPromptTrip.set(updatedTrip);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadMyTrips() {
    this.tripService.getMyTrips().subscribe({
      next: (list) => {
        this.trips.set(list);
        list.forEach((t) => this.socketService.joinTripRoom(t.id));
        const routeTripId = this.route.snapshot.paramMap.get('id');
        const routeTrip = routeTripId ? list.find((trip) => trip.id === routeTripId) : undefined;
        if (routeTrip?.status === 'finalizado') this.reviewPromptTrip.set(routeTrip);
      },
      error: () => console.error('Error fetching trips'),
    });
  }

  dismissReviewPrompt() {
    const trip = this.reviewPromptTrip();
    if (trip) sessionStorage.setItem(`review-prompt-${trip.id}`, 'dismissed');
    this.reviewPromptTrip.set(null);
  }

  private updateTripInList(updatedTrip: Trip) {
    this.trips.update((list) =>
      list.map((t) => (t.id === updatedTrip.id ? { ...t, ...updatedTrip } : t))
    );
  }

  getBadgeClass(status: string): string {
    if (status === 'pendiente') return 'badge-pending';
    if (status === 'aceptado') return 'badge-accepted';
    if (status === 'finalizado') return 'badge-completed';
    return 'badge-pending';
  }
}