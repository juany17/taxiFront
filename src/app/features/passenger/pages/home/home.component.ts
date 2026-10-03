import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TripService } from '../../../../core/services/trip.service';
import { SocketService } from '../../../../core/services/socket.service';
import { Trip } from '../../../../models';
import { Subscription } from 'rxjs';
import { FeedbackFormComponent } from '../../../feedback/feedback-form.component';

export type PassengerTripDialogState = 'waiting' | 'accepted' | 'review';

export function getPassengerTripDialogState(status: Trip['status']): PassengerTripDialogState {
  if (status === 'aceptado') return 'accepted';
  if (status === 'finalizado') return 'review';
  return 'waiting';
}

export function shouldApplyPassengerTripStatus(current: Trip['status'], incoming: Trip['status']): boolean {
  const statusOrder: Record<Trip['status'], number> = {
    pendiente: 0,
    aceptado: 1,
    finalizado: 2,
  };
  return statusOrder[incoming] >= statusOrder[current];
}

@Component({
  selector: 'app-passenger-home',
  standalone: true,
  imports: [RouterLink, FeedbackFormComponent],
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
            <a routerLink="/passenger/home" class="nav-link active" aria-label="Inicio" title="Inicio">
              <i class="fa-solid fa-house"></i><span class="passenger-nav-label">Inicio</span>
            </a>
            <a routerLink="/passenger/trips" class="nav-link" aria-label="Mis viajes" title="Mis viajes">
              <i class="fa-solid fa-clock-rotate-left"></i><span class="passenger-nav-label">Mis viajes</span>
            </a>
            <button class="nav-link" (click)="logout()" aria-label="Salir" title="Salir"
                    style="border:1px solid transparent;background:transparent;cursor:pointer;">
              <i class="fa-solid fa-right-from-bracket"></i><span class="passenger-nav-label">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      <main class="main-content">
        <!-- Hero greeting banner -->
        <div class="glass-panel text-center mb-4 fade-in-up" style="background:linear-gradient(135deg,rgba(124,58,237,0.18),rgba(59,130,246,0.08));border-color:rgba(124,58,237,0.3);padding:2.5rem 2rem;">
          <div style="font-size:3rem;margin-bottom:0.5rem;">🛵</div>
          <h1 class="title mb-1">Hola, <span class="gradient-text">{{ auth.currentUser()?.nombre }}</span> 👋</h1>
          <p class="subtitle mb-0">¿A dónde te llevamos hoy? Solicita un viaje al instante.</p>
        </div>

        <!-- Action cards -->
        <div class="row g-3">
          <div class="col-12 col-md-6 fade-in-up stagger-1">
            <div class="card text-center d-flex flex-column align-items-center py-4 h-100">
              <div class="icon-box-lg mb-3" style="background:linear-gradient(135deg,var(--primary),#A78BFA);color:white;border-radius:1.25rem;box-shadow:0 8px 25px rgba(124,58,237,0.4);animation:float 4s ease-in-out infinite;">
                <i class="fa-solid fa-location-dot"></i>
              </div>
              <h2 style="font-size:1.2rem;font-weight:700;color:var(--text-main);margin-bottom:0.5rem;">Pedir un Viaje</h2>
              <p class="text-muted mb-4" style="font-size:0.88rem;">Solicita un mototaxi al instante y viaja rápido y seguro por la ciudad.</p>
              <a routerLink="/passenger/request-trip" class="btn btn-primary" style="width:auto;padding:0.65rem 2rem;">
                Comenzar <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>
          <div class="col-12 col-md-6 fade-in-up stagger-2">
            <div class="card text-center d-flex flex-column align-items-center py-4 h-100">
              <div class="icon-box-lg mb-3" style="background:rgba(59,130,246,0.18);color:#93C5FD;border-radius:1.25rem;animation:float 4s ease-in-out infinite;animation-delay:1s;">
                <i class="fa-solid fa-clock-rotate-left"></i>
              </div>
              <h2 style="font-size:1.2rem;font-weight:700;color:var(--text-main);margin-bottom:0.5rem;">Historial de Viajes</h2>
              <p class="text-muted mb-4" style="font-size:0.88rem;">Revisa el estado de tus viajes actuales o el historial de los anteriores.</p>
              <a routerLink="/passenger/trips" class="btn btn-outline" style="width:auto;padding:0.65rem 2rem;">
                Ver Historial <i class="fa-solid fa-list"></i>
              </a>
            </div>
          </div>
        </div>
      </main>

      @if (tripDialogState() && trackedTrip()) {
        <div class="passenger-trip-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="passenger-trip-modal-title">
          <section class="passenger-trip-modal">
            @if (tripDialogState() === 'waiting') {
              <div class="trip-modal-icon trip-modal-icon-waiting"><i class="fa-solid fa-motorcycle fa-bounce"></i></div>
              <h2 id="passenger-trip-modal-title">Buscando conductor</h2>
              <p>Tu pedido fue enviado. Espera mientras un taxista acepta el viaje.</p>
              <div class="trip-modal-route">
                <span><strong>Origen:</strong> {{ trackedTrip()!.origin_address }}</span>
                <span><strong>Destino:</strong> {{ trackedTrip()!.destination_address }}</span>
              </div>
              <div class="trip-modal-progress" aria-label="Esperando conductor"><span></span></div>
            } @else if (tripDialogState() === 'accepted') {
              <div class="trip-modal-icon trip-modal-icon-accepted"><i class="fa-solid fa-circle-check"></i></div>
              <h2 id="passenger-trip-modal-title">¡Tu pedido fue tomado!</h2>
              <p>El conductor ya aceptó. Por favor, espera su llegada.</p>
              @if (trackedTrip()!.driver) {
                <div class="trip-modal-driver">
                  <strong>{{ trackedTrip()!.driver!.nombre }}</strong>
                  @if (trackedTrip()!.driver!.telefono) {
                    <span>{{ trackedTrip()!.driver!.telefono }}</span>
                  }
                  @if (trackedTrip()!.vehicle) {
                    <span>{{ trackedTrip()!.vehicle!.marca }} {{ trackedTrip()!.vehicle!.modelo }} · Patente {{ trackedTrip()!.vehicle!.placa }}</span>
                  }
                </div>
              }
              <button type="button" class="btn btn-primary trip-modal-button" (click)="closeStatusDialog()">Entendido</button>
            } @else {
              <button type="button" class="trip-modal-close" (click)="dismissReviewDialog()" aria-label="Omitir calificación">&times;</button>
              <div class="trip-modal-icon trip-modal-icon-review"><i class="fa-solid fa-star"></i></div>
              <h2 id="passenger-trip-modal-title">¿Cómo fue tu viaje?</h2>
              <p>Tu viaje finalizó. Califica a {{ trackedTrip()!.driver?.nombre || 'tu conductor' }} y déjanos tu opinión.</p>
              <app-feedback-form [tripId]="trackedTrip()!.id" [reviewOnly]="true" (submitted)="onReviewSubmitted()"></app-feedback-form>
              <button type="button" class="trip-modal-skip" (click)="dismissReviewDialog()">Omitir por ahora</button>
            }
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .passenger-trip-modal-backdrop { position: fixed; inset: 0; z-index: 1200; display: flex; align-items: center; justify-content: center; padding: 1rem; background: rgba(0, 0, 0, 0.68); backdrop-filter: blur(6px); }
    .passenger-trip-modal { position: relative; width: min(100%, 500px); max-height: 90vh; overflow-y: auto; padding: 2rem; border: 1px solid var(--glass-border); border-radius: 1rem; background: #1A1730; color: var(--text-main); text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45); }
    .passenger-trip-modal h2 { margin: 0 0 0.65rem; color: #fff; font-size: 1.45rem; }
    .passenger-trip-modal > p { margin-bottom: 1.25rem; color: var(--text-muted); }
    .trip-modal-icon { display: grid; place-items: center; width: 60px; height: 60px; margin: 0 auto 1rem; border-radius: 50%; color: #fff; font-size: 1.5rem; }
    .trip-modal-icon-waiting { background: rgba(124, 58, 237, 0.22); color: #C4B5FD; }
    .trip-modal-icon-accepted { background: rgba(16, 185, 129, 0.16); color: #6EE7B7; }
    .trip-modal-icon-review { background: rgba(245, 158, 11, 0.18); color: #FBBF24; }
    .trip-modal-route, .trip-modal-driver { display: grid; gap: 0.6rem; margin: 1rem 0; padding: 1rem; border: 1px solid var(--glass-border); border-radius: 0.75rem; background: rgba(255, 255, 255, 0.04); text-align: left; overflow-wrap: anywhere; }
    .trip-modal-progress { height: 4px; margin-top: 1.5rem; overflow: hidden; border-radius: 999px; background: rgba(255, 255, 255, 0.12); }
    .trip-modal-progress span { display: block; width: 35%; height: 100%; border-radius: inherit; background: var(--primary); animation: searchProgress 1.5s ease-in-out infinite; }
    .trip-modal-button { width: 100%; }
    .trip-modal-close { position: absolute; top: 0.75rem; right: 0.75rem; width: 2.25rem; height: 2.25rem; border: 1px solid var(--glass-border); border-radius: 50%; background: rgba(255, 255, 255, 0.06); color: var(--text-muted); font-size: 1.3rem; cursor: pointer; }
    .trip-modal-skip { margin-top: 0.75rem; border: 0; background: transparent; color: var(--text-muted); cursor: pointer; text-decoration: underline; }
    @keyframes searchProgress { 0% { transform: translateX(-110%); } 100% { transform: translateX(300%); } }
    @media (max-width: 480px) { .passenger-trip-modal { padding: 1.5rem 1rem; } .passenger-trip-modal h2 { font-size: 1.25rem; } }
    @media (prefers-reduced-motion: reduce) { .trip-modal-progress span { animation: none; width: 100%; } }
  `]
})
export class PassengerHomeComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private tripService = inject(TripService);
  private socketService = inject(SocketService);
  private subscriptions = new Subscription();
  private trackedTripId: string | null = null;
  trackedTrip = signal<Trip | null>(null);
  tripDialogState = signal<PassengerTripDialogState | null>(null);

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.subscriptions.add(
      this.socketService.onTripStatusChanged().subscribe((updatedTrip) => {
        if (updatedTrip.id !== this.trackedTripId) return;
        this.applyTrackedTripUpdate(updatedTrip);
      }),
    );

    this.subscriptions.add(
      this.route.queryParamMap.subscribe((params) => {
        const tripId = params.get('tripId');
        if (!tripId || tripId === this.trackedTripId) return;
        this.trackedTripId = tripId;
        this.tripDialogState.set('waiting');
        this.socketService.joinTripRoom(tripId);
        this.tripService.getTrip(tripId).subscribe({
          next: (trip) => {
            if (trip.id !== this.trackedTripId) return;
            this.applyTrackedTripUpdate(trip);
          },
          error: () => {
            this.tripDialogState.set(null);
          },
        });
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  closeStatusDialog() {
    this.tripDialogState.set(null);
  }

  onReviewSubmitted() {
    this.clearTrackedTrip();
  }

  dismissReviewDialog() {
    this.clearTrackedTrip();
  }

  private clearTrackedTrip() {
    this.trackedTripId = null;
    this.trackedTrip.set(null);
    this.tripDialogState.set(null);
    this.router.navigate([], { relativeTo: this.route, queryParams: { tripId: null }, queryParamsHandling: 'merge' });
  }

  private applyTrackedTripUpdate(incoming: Trip) {
    const current = this.trackedTrip();
    if (current && !shouldApplyPassengerTripStatus(current.status, incoming.status)) return;
    const updated = current ? { ...current, ...incoming } : incoming;
    this.trackedTrip.set(updated);
    this.tripDialogState.set(getPassengerTripDialogState(updated.status));
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}