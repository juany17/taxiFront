import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TripService } from '../../../../core/services/trip.service';
import { SocketService } from '../../../../core/services/socket.service';
import { Trip } from '../../../../models';
import { DriverNavbarComponent } from '../../components/driver-navbar.component';

@Component({
  selector: 'app-driver-trips',
  standalone: true,
  imports: [RouterLink, DriverNavbarComponent],
  template: `
    <div class="app-container fade-in-up">
      <app-driver-navbar></app-driver-navbar>

      <main class="main-content">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <p class="section-label mb-0"><i class="fa-solid fa-list-ul me-1"></i>En tiempo real</p>
            <h1 class="title mb-0" style="font-size:1.6rem;">Viajes <span class="gradient-text">Disponibles</span></h1>
          </div>
          <button class="btn btn-outline btn-auto btn-sm" (click)="loadPending()">
            <i class="fa-solid fa-rotate-right"></i> Actualizar
          </button>
        </div>

        @if (newTripNotification) {
          <div class="alert alert-success fade-in-up mb-3" style="font-size:1rem;">
            <i class="fa-solid fa-bolt fa-bounce"></i> {{ newTripNotification }}
          </div>
        }

        @if (pendingTrips().length === 0) {
          <div class="glass-panel text-center" style="padding:4rem 2rem;">
            <div class="icon-box-lg mx-auto mb-3" style="background:rgba(124,58,237,0.12);color:#C4B5FD;border-radius:1.25rem;">
              <i class="fa-solid fa-mug-hot"></i>
            </div>
            <h2 class="font-bold mb-2" style="font-size:1.15rem;">No hay viajes pendientes</h2>
            <p class="text-muted mb-0" style="font-size:0.88rem;">Tómate un descanso. Los nuevos viajes aparecerán automáticamente aquí.</p>
          </div>
        } @else {
          <div class="row g-3">
            @for (trip of pendingTrips(); track trip.id) {
              <div class="col-12 col-md-6 col-lg-4 fade-in-up">
                <div class="card h-100" style="border-top:3px solid var(--warning);">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="badge badge-pending"><i class="fa-solid fa-star-of-life fa-spin" style="font-size:0.6rem;margin-right:0.3rem;"></i>NUEVO</span>
                    <span class="font-bold" style="font-size:1.5rem;color:#6EE7B7;">\${{ trip.fare }}</span>
                  </div>

                  <div class="card-row">
                    <i class="fa-solid fa-location-dot" style="color:#A78BFA;"></i>
                    <div>
                      <div class="section-label mb-0">Origen</div>
                      <div style="font-weight:500;color:var(--text-main);">{{ trip.origin_address }}</div>
                    </div>
                  </div>

                  <div style="margin-left:1rem;border-left:2px dashed rgba(255,255,255,0.1);height:14px;"></div>

                  <div class="card-row mb-4">
                    <i class="fa-solid fa-flag-checkered" style="color:#6EE7B7;"></i>
                    <div>
                      <div class="section-label mb-0">Destino</div>
                      <div style="font-weight:500;color:var(--text-main);">{{ trip.destination_address }}</div>
                    </div>
                  </div>

                  <button (click)="accept(trip.id)" class="btn btn-success" style="font-size:1rem;padding:0.85rem;">
                    <i class="fa-solid fa-check"></i> Aceptar Viaje
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </main>

      @if (showActiveTripModal()) {
        <div class="active-trip-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="active-trip-title">
          <section class="active-trip-modal">
            <div class="active-trip-modal-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <h2 id="active-trip-title">Ya tienes un viaje activo</h2>
            <p>Debes finalizar tu viaje actual antes de aceptar otro pedido.</p>
            @if (activeTrip()) {
              <div class="active-trip-route">
                <span><strong>Origen:</strong> {{ activeTrip()!.origin_address || 'No especificado' }}</span>
                <span><strong>Destino:</strong> {{ activeTrip()!.destination_address || 'No especificado' }}</span>
              </div>
              <button type="button" class="btn btn-primary" (click)="goToActiveTrip()">
                Ver mi viaje activo
              </button>
            }
            <button type="button" class="active-trip-dismiss" (click)="showActiveTripModal.set(false)">
              Entendido
            </button>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .active-trip-modal-backdrop { position: fixed; inset: 0; z-index: 1200; display: flex; align-items: center; justify-content: center; padding: 1rem; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); }
    .active-trip-modal { width: min(100%, 440px); padding: 2rem; border-radius: 1.25rem; background: var(--bg-card, #fff); color: var(--text-main); text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25); }
    .active-trip-modal-icon { display: grid; place-items: center; width: 58px; height: 58px; margin: 0 auto 1rem; border-radius: 50%; background: rgba(245, 158, 11, 0.15); color: var(--warning); font-size: 1.5rem; }
    .active-trip-modal h2 { margin-bottom: 0.6rem; font-size: 1.35rem; }
    .active-trip-modal p { color: var(--text-muted); }
    .active-trip-route { display: grid; gap: 0.5rem; margin: 1rem 0 1.25rem; padding: 0.9rem; border-radius: 0.75rem; background: rgba(148, 163, 184, 0.12); text-align: left; overflow-wrap: anywhere; }
    .active-trip-dismiss { display: block; margin: 1rem auto 0; padding: 0.5rem 1rem; border: 0; background: transparent; color: var(--text-muted); cursor: pointer; }
    @media (max-width: 480px) { .active-trip-modal { padding: 1.5rem 1rem; } .active-trip-modal .btn { width: 100%; } }
  `],
})
export class DriverTripsComponent implements OnInit, OnDestroy {
  private tripService = inject(TripService);
  private socketService = inject(SocketService);
  private router = inject(Router);

  pendingTrips = signal<Trip[]>([]);
  activeTrip = signal<Trip | null>(null);
  showActiveTripModal = signal(false);
  newTripNotification = '';
  private subs: Subscription[] = [];

  ngOnInit() {
    this.loadPending();
    this.loadActiveTrip();

    // Escuchar cuando cualquier pasajero solicite un nuevo viaje en tiempo real
    this.subs.push(
      this.socketService.onNewTripAvailable().subscribe((newTrip) => {
        this.pendingTrips.update((list) => {
          const exists = list.some((t) => t.id === newTrip.id);
          return exists ? list : [newTrip, ...list];
        });
        this.newTripNotification = `⚡ ¡Nuevo viaje solicitado desde "${newTrip.origin_address}" hacia "${newTrip.destination_address}"!`;
        setTimeout(() => (this.newTripNotification = ''), 5000);
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadPending() {
    this.tripService.getPending().subscribe((t) => this.pendingTrips.set(t));
  }

  private loadActiveTrip() {
    this.tripService.getMyTrips().subscribe({
      next: (trips) => this.activeTrip.set(trips.find((trip) => trip.status === 'aceptado') ?? null),
      error: () => console.error('No se pudo consultar el viaje activo'),
    });
  }

  accept(id: string) {
    if (this.activeTrip()) {
      this.showActiveTripModal.set(true);
      return;
    }

    this.tripService.acceptTrip(id).subscribe({
      next: () => {
        this.activeTrip.set(this.pendingTrips().find((trip) => trip.id === id) ?? null);
        this.router.navigate([`/driver/trip/${id}`]);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 409) {
          this.loadActiveTrip();
          this.showActiveTripModal.set(true);
          return;
        }
        alert(error.error?.message || 'Error al aceptar el viaje');
      },
    });
  }

  goToActiveTrip() {
    const trip = this.activeTrip();
    if (trip) this.router.navigate([`/driver/trip/${trip.id}`]);
  }
}