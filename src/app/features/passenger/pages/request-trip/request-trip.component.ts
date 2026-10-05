import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../../../core/services/trip.service';
import { SocketService } from '../../../../core/services/socket.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-request-trip',
  standalone: true,
  imports: [RouterLink, FormsModule],
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
            <a routerLink="/passenger/trips" class="nav-link" aria-label="Mis viajes" title="Mis viajes">
              <i class="fa-solid fa-clock-rotate-left"></i><span class="passenger-nav-label">Mis viajes</span>
            </a>
          </div>
        </div>
      </nav>

      <main class="main-content center-content" style="min-height:calc(100vh - 70px);">
        <div class="border-beam-wrapper w-100" style="max-width:640px;">
          <div class="glass-panel" style="border-radius:1.5rem;padding:2rem 1.25rem;">
            <div class="text-center mb-4">
              <div class="icon-box-lg mx-auto mb-3" style="background:linear-gradient(135deg,var(--primary),#A78BFA);color:white;border-radius:1.25rem;box-shadow:0 10px 30px rgba(124,58,237,0.4);">
                <i class="fa-solid fa-motorcycle"></i>
              </div>
              <h1 class="title mb-1" style="font-size:1.75rem;">
                <span class="gradient-text">¿A dónde vamos?</span>
              </h1>
              <p class="text-muted mb-0" style="font-size:0.9rem;">Selecciona tu origen y destino en el mapa para pedir un viaje.</p>
            </div>

            <div class="trip-map-wrapper mb-4">
              <div class="trip-map-actions">
                <span class="badge badge-accepted">Mapa</span>
                <button type="button" class="btn btn-sm btn-outline" (click)="locateMe()">
                  <i class="fa-solid fa-location-crosshairs"></i> Mi ubicación
                </button>
              </div>
              <div #mapContainer class="trip-map" aria-label="Mapa de ubicación"></div>
            </div>

            <form (ngSubmit)="submit()" #tripForm="ngForm">
              <div class="form-group">
                <i class="fa-solid fa-location-dot" style="color:#A78BFA;"></i>
                <input class="form-control" [(ngModel)]="data.origin_address" name="origin_address"
                       placeholder="Origen" required>
              </div>

              <div style="margin-left:1.2rem;border-left:2px dashed rgba(255,255,255,0.12);height:18px;margin-bottom:1.35rem;"></div>

              <div class="form-group mb-4">
                <i class="fa-solid fa-flag-checkered" style="color:#6EE7B7;"></i>
                <input class="form-control" [(ngModel)]="data.destination_address" name="destination_address"
                       placeholder="Destino" required>
              </div>

              <div class="form-group mb-3">
                <i class="fa-solid fa-wallet" style="color:#FBBF24;"></i>
                <select class="form-control" [(ngModel)]="data.payment_method" name="payment_method"
                        (ngModelChange)="onPaymentMethodChange($event)" required>
                  <option value="efectivo">Pagar en efectivo</option>
                  <option value="mercadopago">Transferir por Mercado Pago</option>
                </select>
              </div>
              @if (data.payment_method === 'efectivo') {
                <div class="cash-payment-note mb-3">
                  <label for="cashTendered">Tarifa fija: $2.000. ¿Con cuánto pagarás? (opcional)</label>
                  <input id="cashTendered" class="form-control" type="number" min="2000" step="50"
                         [(ngModel)]="data.cash_tendered" name="cash_tendered" placeholder="Ej.: 5000">
                  @if (data.cash_tendered && data.cash_tendered >= 2000) {
                    <small>Vuelto estimado: \${{ getEstimatedChange() }}</small>
                  } @else if (data.cash_tendered && data.cash_tendered < 2000) {
                    <small class="cash-payment-error">El monto no puede ser menor que la tarifa.</small>
                  }
                </div>
              } @else {
                <div class="cash-payment-note mb-3">
                  El alias de Mercado Pago del conductor se mostrará cuando acepte el viaje. El pago quedará pendiente hasta que lo confirme.
                </div>
              }

              <div class="trip-map-legend">
                <span><i class="fa-solid fa-circle" style="color:#7C3AED"></i> Origen</span>
                <span><i class="fa-solid fa-circle" style="color:#10B981"></i> Destino</span>
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

              <button type="submit" class="btn btn-primary" [disabled]="!tripForm.form.valid || loading || !data.destination_lat || !data.destination_lng || (data.payment_method === 'efectivo' && data.cash_tendered && data.cash_tendered < 2000)" style="font-size:1.05rem;padding:0.85rem;">
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
export class RequestTripComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  data: any = {
    origin_address: 'Mi ubicación actual',
    destination_address: 'Selecciona un destino en el mapa',
    origin_lat: -24.18,
    origin_lng: -65.30,
    destination_lat: null,
    destination_lng: null,
    payment_method: 'efectivo',
    cash_tendered: null,
  };

  error = '';
  success = false;
  loading = false;
  tripId = '';

  private map?: L.Map;
  private originMarker?: L.Marker;
  private destinationMarker?: L.Marker;
  private geolocationWatchId?: number;
  private passengerLocationWatcher?: number;

  onPaymentMethodChange(method: 'efectivo' | 'mercadopago'): void {
    if (method === 'mercadopago') {
      this.data.cash_tendered = null;
    }
  }

  getEstimatedChange(): number {
    return Math.max(0, Number(this.data.cash_tendered) - 2000);
  }

  constructor(
    private tripService: TripService,
    private socketService: SocketService,
    private router: Router,
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    if (this.geolocationWatchId !== undefined) {
      navigator.geolocation.clearWatch(this.geolocationWatchId);
    }
    if (this.passengerLocationWatcher !== undefined && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.passengerLocationWatcher);
    }
  }

  locateMe(): void {
    if (!navigator.geolocation) {
      this.error = 'Tu navegador no soporta geolocalización.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => this.setOrigin(position.coords.latitude, position.coords.longitude),
      () => {
        this.error = 'No se pudo detectar tu ubicación. Podés seguir usando el mapa para seleccionar un destino.';
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView([this.data.origin_lat, this.data.origin_lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.addOriginMarker(this.data.origin_lat, this.data.origin_lng);

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      this.setDestination(lat, lng);
    });

    this.locateMe();
  }

  private setOrigin(lat: number, lng: number): void {
    this.data.origin_lat = Number(lat.toFixed(6));
    this.data.origin_lng = Number(lng.toFixed(6));
    this.data.origin_address = 'Mi ubicación actual';

    if (this.map) {
      this.map.flyTo([this.data.origin_lat, this.data.origin_lng], 15, { duration: 0.8 });
      this.addOriginMarker(this.data.origin_lat, this.data.origin_lng);
    }
  }

  private setDestination(lat: number, lng: number): void {
    this.data.destination_lat = Number(lat.toFixed(6));
    this.data.destination_lng = Number(lng.toFixed(6));
    this.data.destination_address = `Destino (${this.data.destination_lat.toFixed(4)}, ${this.data.destination_lng.toFixed(4)})`;

    if (this.map) {
      this.map.flyTo([lat, lng], 15, { duration: 0.8 });
      this.addDestinationMarker(this.data.destination_lat, this.data.destination_lng);
    }
  }

  private addOriginMarker(lat: number, lng: number): void {
    if (!this.map) return;
    if (this.originMarker) {
      this.map.removeLayer(this.originMarker);
    }

    this.originMarker = L.marker([lat, lng], { icon: this.createMarker('#7C3AED') }).addTo(this.map);
  }

  private addDestinationMarker(lat: number, lng: number): void {
    if (!this.map) return;
    if (this.destinationMarker) {
      this.map.removeLayer(this.destinationMarker);
    }

    this.destinationMarker = L.marker([lat, lng], { icon: this.createMarker('#10B981') }).addTo(this.map);
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

  private startPassengerLocationTracking(tripId: string): void {
    if (!navigator.geolocation) {
      return;
    }

    if (this.passengerLocationWatcher !== undefined) {
      navigator.geolocation.clearWatch(this.passengerLocationWatcher);
    }

    this.socketService.joinTripRoom(tripId);
    this.passengerLocationWatcher = navigator.geolocation.watchPosition(
      (position) => {
        const payload = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        this.setOrigin(payload.lat, payload.lng);
        this.socketService.emitPassengerLocation(tripId, payload);
      },
      () => undefined,
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );
  }

  submit() {
    if (!this.data.destination_lat || !this.data.destination_lng) {
      this.error = 'Selecciona un destino en el mapa antes de solicitar el viaje.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.tripService.createTrip(this.data).subscribe({
      next: (trip) => {
        this.success = true;
        this.tripId = trip.id;
        this.startPassengerLocationTracking(trip.id);
        this.router.navigate(['/passenger/home'], { queryParams: { tripId: trip.id } });
      },
      error: () => {
        this.error = 'Error al crear viaje. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }
}