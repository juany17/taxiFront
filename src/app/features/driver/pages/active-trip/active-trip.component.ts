import { Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TripService } from '../../../../core/services/trip.service';
import { SocketService } from '../../../../core/services/socket.service';
import { Trip } from '../../../../models';
import { FeedbackFormComponent } from '../../../feedback/feedback-form.component';
import { DriverNavbarComponent } from '../../components/driver-navbar.component';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-driver-active-trip',
  standalone: true,
  imports: [RouterLink, FeedbackFormComponent, DriverNavbarComponent],
  template: `
    <div class="app-container fade-in-up">
      <app-driver-navbar></app-driver-navbar>

      <main class="main-content center-content driver-trip-page">
        @if (trip()) {
          <div class="driver-trip-card glass-panel">
            <div class="trip-status-bar"></div>

            <div class="driver-trip-header">
              <div>
                <span class="badge" [class]="trip()!.status === 'finalizado' ? 'badge-completed' : 'badge-accepted'">
                  {{ trip()!.status === 'finalizado' ? 'Viaje finalizado' : 'Viaje activo' }}
                </span>
                <h2 class="title">Estado del viaje</h2>
              </div>
              <div class="trip-fare">
                <span>Tarifa</span>
                <strong>\${{ trip()!.fare }}</strong>
              </div>
            </div>

            <div class="trip-map-wrapper">
              <div class="trip-map-header">
                <span class="badge badge-accepted">Ruta</span>
                <span class="text-muted">Origen → Destino</span>
              </div>
              <div #mapContainer class="trip-map" aria-label="Mapa del viaje activo"></div>
              @if (mapError()) {
                <p class="map-error" role="status">{{ mapError() }}</p>
              }
            </div>

            <div class="trip-route-stack">
              <div class="route-card route-card-origin">
                <div class="route-icon"><i class="fa-solid fa-location-dot"></i></div>
                <div class="route-copy">
                  <small>Recoger en</small>
                  <strong>{{ trip()!.origin_address }}</strong>
                </div>
              </div>

              <div class="route-divider"></div>

              <div class="route-card route-card-destination">
                <div class="route-icon"><i class="fa-solid fa-flag-checkered"></i></div>
                <div class="route-copy">
                  <small>Llevar a</small>
                  <strong>{{ trip()!.destination_address }}</strong>
                </div>
              </div>
            </div>

            <section class="payment-card" aria-label="Estado del pago">
              <div class="payment-heading">
                <strong>Pago del viaje</strong>
                <span class="badge"
                  [class]="trip()!.payment_status === 'pagado' ? 'badge-completed' : trip()!.payment_status === 'reportado' ? 'badge-pending' : 'badge-accepted'">
                  {{ paymentStatusLabel() }}
                </span>
              </div>
              <p class="payment-method">
                Método: {{ trip()!.payment_method === 'mercadopago' ? 'Mercado Pago' : 'Efectivo' }}
                · Total acordado: \${{ trip()!.fare }}
              </p>
              @if (trip()!.payment_method === 'efectivo' && trip()!.cash_tendered) {
                <p class="payment-method">
                  Recibirá: \${{ trip()!.cash_tendered }} · Vuelto estimado: \${{ estimatedChange() }}
                </p>
              }
              @if (trip()!.status === 'finalizado' && trip()!.payment_status === 'pendiente') {
                <p class="payment-help">Confirma únicamente cuando hayas recibido el dinero.</p>
                <button type="button" class="btn btn-success btn-block" (click)="confirmPayment()" [disabled]="paymentSaving()">
                  @if (paymentSaving()) { <i class="fa-solid fa-circle-notch fa-spin"></i> Confirmando... }
                  @else { <i class="fa-solid fa-circle-check"></i> Confirmar pago recibido }
                </button>
              } @else if (trip()!.payment_status === 'reportado') {
                <p class="payment-help">El pasajero reportó un problema: {{ trip()!.payment_issue }}</p>
              } @else if (trip()!.payment_status === 'pagado') {
                <p class="payment-help">El pago quedó confirmado.</p>
              } @else {
                <p class="payment-help">El pago se confirma al finalizar el viaje y recibir el importe.</p>
              }
              @if (paymentError()) {
                <p class="payment-error" role="alert">{{ paymentError() }}</p>
              }
            </section>

            @if (trip()!.status === 'aceptado') {
              <button (click)="complete()" class="btn btn-primary btn-block driver-finish-btn">
                <i class="fa-solid fa-flag"></i> Finalizar viaje
              </button>
            }
            @if (trip()!.status === 'finalizado') {
              <div class="alert alert-success mt-3 mb-0">
                <i class="fa-solid fa-check-circle"></i> Viaje finalizado exitosamente
              </div>
              <a routerLink="/driver/home" class="btn btn-outline mt-3 btn-block">
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
  `,
  styles: [`
    .driver-trip-page {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 1rem;
      padding-bottom: 1.5rem;
    }

    .driver-trip-card {
      position: relative;
      width: min(100%, 560px);
      padding: 1.2rem 1rem 1rem;
      overflow: hidden;
      border-radius: 1.25rem;
    }

    .trip-status-bar {
      position: absolute;
      inset: 0 0 auto 0;
      height: 6px;
      background: linear-gradient(90deg, var(--primary), #A78BFA);
    }

    .driver-trip-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-top: 0.35rem;
      margin-bottom: 1rem;
    }

    .driver-trip-header .title {
      margin: 0.4rem 0 0;
      font-size: clamp(1.25rem, 2vw, 1.75rem);
    }

    .trip-fare {
      min-width: 94px;
      text-align: right;
      padding: 0.6rem 0.7rem;
      border-radius: 0.9rem;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .trip-fare span {
      display: block;
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .trip-fare strong {
      display: block;
      margin-top: 0.2rem;
      font-size: 1.4rem;
      color: #6EE7B7;
    }

    .trip-map-wrapper {
      margin-bottom: 1rem;
      background: rgba(15, 23, 42, 0.3);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1rem;
      padding: 0.75rem;
    }

    .trip-map-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      gap: 0.5rem;
      font-size: 0.8rem;
    }

    .trip-map {
      width: 100%;
      height: 220px;
      border-radius: 0.85rem;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(15, 23, 42, 0.5);
    }

    .map-error {
      margin: 0.65rem 0 0;
      color: #FCD34D;
      font-size: 0.8rem;
    }

    .trip-route-stack {
      display: grid;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .route-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.8rem 0.9rem;
      border-radius: 0.9rem;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.025);
    }

    .route-card-origin { border-left: 4px solid #7C3AED; }
    .route-card-destination { border-left: 4px solid #10B981; }

    .route-icon {
      width: 2.3rem;
      height: 2.3rem;
      display: grid;
      place-items: center;
      border-radius: 0.75rem;
      background: rgba(255,255,255,0.06);
      font-size: 1rem;
      color: var(--text-main);
    }

    .route-copy {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .route-copy small {
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.67rem;
    }

    .route-copy strong {
      font-size: 1rem;
      line-height: 1.35;
      color: var(--text-main);
    }

    .route-divider {
      height: 14px;
      width: 2px;
      background: linear-gradient(180deg, rgba(124,58,237,0.6), rgba(16,185,129,0.6));
      margin-left: 1.15rem;
      border-radius: 2px;
    }

    .driver-finish-btn {
      padding: 1rem 1.1rem;
      font-size: 1.1rem;
      margin-top: 0.4rem;
    }

    .payment-card {
      margin-top: 1rem;
      padding: 0.9rem;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 0.9rem;
      background: rgba(255,255,255,0.035);
    }

    .payment-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }

    .payment-method, .payment-help {
      margin: 0.65rem 0 0;
      color: var(--text-muted);
      font-size: 0.88rem;
    }

    .payment-error {
      margin: 0.65rem 0 0;
      color: #FCA5A5;
      font-size: 0.88rem;
    }

    @media (max-width: 560px) {
      .driver-trip-card {
        padding: 0.9rem 0.8rem 0.9rem;
      }

      .driver-trip-header {
        align-items: flex-start;
      }

      .trip-fare {
        min-width: 82px;
      }

      .trip-map {
        height: 190px;
      }

      .route-card {
        padding: 0.7rem 0.75rem;
      }
    }
  `]
})
export class DriverActiveTripComponent implements OnDestroy {
  @ViewChild('mapContainer')
  set mapContainer(container: ElementRef<HTMLDivElement> | undefined) {
    if (!container || this.map) {
      return;
    }

    this.initMap(container.nativeElement);
    this.renderTripOnMap();
  }

  trip = signal<Trip | null>(null);
  mapError = signal('');
  private map?: L.Map;
  private routeLayer?: L.Polyline;
  private originMarker?: L.Marker;
  private destinationMarker?: L.Marker;
  private passengerLiveMarker?: L.Marker;
  private socketService = inject(SocketService);
  private locationSubscription?: Subscription;
  private paymentSubscription?: Subscription;
  paymentSaving = signal(false);
  paymentError = signal('');

  constructor(
    private tripService: TripService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.socketService.joinTripRoom(id);
      this.locationSubscription = this.socketService.onPassengerLocationUpdated().subscribe((location) => {
        if (location.tripId !== id) {
          return;
        }
        this.updatePassengerLocation(location.lat, location.lng);
      });
      this.paymentSubscription = this.socketService.onTripPaymentChanged().subscribe((paymentUpdate) => {
        if (paymentUpdate.id !== id) return;
        const currentTrip = this.trip();
        if (currentTrip) this.trip.set({ ...currentTrip, ...paymentUpdate });
      });

      this.tripService.getTrip(id).subscribe((t) => {
        this.trip.set(t);
        if (this.map) {
          this.renderTripOnMap();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.locationSubscription?.unsubscribe();
    this.paymentSubscription?.unsubscribe();
    this.map?.remove();
  }

  private initMap(container: HTMLDivElement): void {
    const fallbackCenter: [number, number] = [-24.18, -65.3];
    this.map = L.map(container, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView(fallbackCenter, 13);

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    tileLayer.on('tileerror', () => {
      this.mapError.set('No se pudieron cargar los mapas. Revisa la conexión a internet.');
    });
    tileLayer.on('tileload', () => {
      this.mapError.set('');
    });
    tileLayer.addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
      this.map?.setView(this.map.getCenter(), this.map.getZoom());
    }, 300);
  }

  private renderTripOnMap(): void {
    const currentTrip = this.trip();
    if (!currentTrip || !this.map) {
      return;
    }

    const coordinateValues = [
      currentTrip.origin_lat,
      currentTrip.origin_lng,
      currentTrip.destination_lat,
      currentTrip.destination_lng,
    ];
    const coordinatesArePresent = coordinateValues.every(
      (coordinate) => coordinate !== null && coordinate !== undefined,
    );

    if (!coordinatesArePresent) {
      this.mapError.set('Este viaje no tiene coordenadas guardadas. El mapa no puede marcar la ruta.');
      return;
    }

    const originLat = Number(currentTrip.origin_lat);
    const originLng = Number(currentTrip.origin_lng);
    const destinationLat = Number(currentTrip.destination_lat);
    const destinationLng = Number(currentTrip.destination_lng);
    const coordinatesAreValid =
      Number.isFinite(originLat) &&
      Number.isFinite(originLng) &&
      Number.isFinite(destinationLat) &&
      Number.isFinite(destinationLng) &&
      Math.abs(originLat) <= 90 &&
      Math.abs(destinationLat) <= 90 &&
      Math.abs(originLng) <= 180 &&
      Math.abs(destinationLng) <= 180;

    if (!coordinatesAreValid) {
      console.error('El viaje no contiene coordenadas válidas para mostrar origen y destino.', currentTrip.id);
      return;
    }

    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
    }
    this.originMarker?.remove();
    this.destinationMarker?.remove();

    const originIcon = this.createMarker('#7C3AED');
    const destIcon = this.createMarker('#10B981');

    this.originMarker = L.marker([originLat, originLng], { icon: originIcon }).addTo(this.map);
    this.destinationMarker = L.marker([destinationLat, destinationLng], { icon: destIcon }).addTo(this.map);

    this.originMarker.bindPopup('<strong>Pasajero</strong><br>Origen del viaje');
    this.destinationMarker.bindPopup('<strong>Destino</strong><br>Destino del viaje');

    this.map.fitBounds([
      [originLat, originLng],
      [destinationLat, destinationLng],
    ], { padding: [28, 28] });

    this.map.invalidateSize();
    this.loadRoute([originLat, originLng], [destinationLat, destinationLng]);
  }

  private createMarker(color: string): L.DivIcon {
    return L.divIcon({
      className: 'map-pin-wrapper',
      html: `<span class="map-pin" style="--pin-color:${color};"></span>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -12],
    });
  }

  private updatePassengerLocation(lat: number, lng: number): void {
    if (!this.map) {
      return;
    }

    if (this.passengerLiveMarker) {
      this.map.removeLayer(this.passengerLiveMarker);
    }

    this.passengerLiveMarker = L.marker([lat, lng], { icon: this.createMarker('#F59E0B') }).addTo(this.map);
    this.passengerLiveMarker.bindPopup('<strong>Pasajero</strong><br>Ubicación real en tiempo real');
    this.map.flyTo([lat, lng], 15, { duration: 0.8 });
  }

  private loadRoute(from: [number, number], to: [number, number]): void {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=false`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const coordinates = data?.routes?.[0]?.geometry?.coordinates ?? [];
        if (!coordinates.length || !this.map) {
          return;
        }

        const routeCoordinates = coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
        this.routeLayer = L.polyline(routeCoordinates, {
          color: '#A78BFA',
          weight: 5,
          opacity: 0.9,
        }).addTo(this.map!);
        setTimeout(() => this.map?.invalidateSize(), 100);
      })
      .catch(() => {
        console.warn('No se pudo cargar la ruta del viaje.');
      });
  }

  paymentStatusLabel(): string {
    switch (this.trip()?.payment_status) {
      case 'pagado': return 'Pagado';
      case 'reportado': return 'Reportado';
      default: return 'Pendiente';
    }
  }

  estimatedChange(): number {
    const trip = this.trip();
    return Math.max(0, Number(trip?.cash_tendered ?? 0) - Number(trip?.fare ?? 0));
  }

  confirmPayment(): void {
    const trip = this.trip();
    if (!trip || this.paymentSaving()) {
      return;
    }

    this.paymentSaving.set(true);
    this.paymentError.set('');
    this.tripService.confirmPayment(trip.id).subscribe({
      next: (updatedTrip) => {
        this.trip.set(updatedTrip);
        this.paymentSaving.set(false);
      },
      error: () => {
        this.paymentError.set('No se pudo confirmar el pago. Actualiza la pantalla e intenta nuevamente.');
        this.paymentSaving.set(false);
      },
    });
  }

  complete() {
    const id = this.trip()!.id;
    this.tripService.completeTrip(id).subscribe({
      next: (updatedTrip) => this.trip.set(updatedTrip),
      error: () => this.paymentError.set('No se pudo finalizar el viaje. Intenta nuevamente.'),
    });
  }
}