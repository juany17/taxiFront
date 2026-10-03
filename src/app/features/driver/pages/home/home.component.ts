import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { SocketService } from '../../../../core/services/socket.service';
import { DriverNavbarComponent } from '../../components/driver-navbar.component';

@Component({
  selector: 'app-driver-home',
  standalone: true,
  imports: [RouterLink, DriverNavbarComponent],
  template: `
    <div class="app-container fade-in-up">
      <app-driver-navbar></app-driver-navbar>

      <main class="main-content driver-home-content">
        <!-- Welcome banner -->
        <div class="glass-panel text-center mb-4 fade-in-up" style="background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(16,185,129,0.08));border-color:rgba(124,58,237,0.3);">
          <div style="font-size:2.5rem;margin-bottom:0.5rem;">🏍️</div>
          <h1 class="title mb-1">Bienvenido, <span class="gradient-text">{{ auth.currentUser()?.nombre }}</span></h1>
          <p class="subtitle mb-0" style="color:var(--text-muted);">Estás conectado y listo para recibir viajes.</p>
        </div>

        <!-- Action cards -->
        <div class="row g-3 driver-home-cards w-100">
          <div class="col-12 col-md-6 fade-in-up stagger-1">
            <div class="card driver-pending-card text-center d-flex flex-column align-items-center py-4 h-100"
                 [class.driver-pending-card--new]="hasNewTrip()">
              @if (hasNewTrip()) {
                <span class="badge badge-pending badge-pulse mb-3" style="font-size:0.75rem;">
                  <i class="fa-solid fa-bell fa-shake"></i> ¡Nuevo pedido!
                </span>
              }
              <div class="icon-box-lg mb-3" style="background:rgba(245,158,11,0.18);color:#FCD34D;border-radius:1.25rem;">
                <i class="fa-solid fa-list-ul"></i>
              </div>
              <h2 style="font-size:1.15rem;font-weight:700;color:var(--text-main);margin-bottom:0.5rem;">Viajes Pendientes</h2>
              <p class="text-muted mb-4" style="font-size:0.88rem;">
                {{ hasNewTrip() ? '¡Hay un nuevo pedido de viaje esperándote!' : 'Revisa las solicitudes de pasajeros cercanos y comienza a ganar.' }}
              </p>
              <a routerLink="/driver/trips" class="btn btn-primary" style="width:auto;padding:0.65rem 2rem;">
                Ver Solicitudes <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>
          <div class="col-12 col-md-6 fade-in-up stagger-2">
            <div class="card text-center d-flex flex-column align-items-center py-4 h-100">
              <div class="icon-box-lg mb-3" style="background:rgba(124,58,237,0.15);color:#C4B5FD;border-radius:1.25rem;">
                <i class="fa-solid fa-user-gear"></i>
              </div>
              <h2 style="font-size:1.15rem;font-weight:700;color:var(--text-main);margin-bottom:0.5rem;">Mi Perfil</h2>
              <p class="text-muted mb-4" style="font-size:0.88rem;">Actualiza los datos de tu vehículo y personaliza tu perfil de conductor.</p>
              <a routerLink="/driver/profile" class="btn btn-outline" style="width:auto;padding:0.65rem 2rem;">
                Gestionar Perfil <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class DriverHomeComponent implements OnInit, OnDestroy {
  hasNewTrip = signal(false);
  private socketService = inject(SocketService);
  private subscriptions = new Subscription();
  private notificationTimeout?: ReturnType<typeof setTimeout>;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.subscriptions.add(
      this.socketService.onNewTripAvailable().subscribe((newTrip) => {
        this.hasNewTrip.set(true);
        this.showBrowserNotification(newTrip.origin_address, newTrip.destination_address);

        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = setTimeout(() => this.hasNewTrip.set(false), 10000);
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    clearTimeout(this.notificationTimeout);
  }

  private showBrowserNotification(origin: string | null, destination: string | null) {
    if (!('Notification' in window)) {
      return;
    }

    const show = () => {
      if (Notification.permission === 'granted') {
        new Notification('Nuevo pedido de viaje', {
          body: `Desde ${origin ?? 'el origen indicado'} hasta ${destination ?? 'el destino indicado'}`,
          icon: '/favicon.ico',
        });
      }
    };

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(show);
      return;
    }

    show();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}