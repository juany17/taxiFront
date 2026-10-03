import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminNavbarComponent } from '../../components/admin-navbar.component';
import { Trip } from '../../../../models';

@Component({
  selector: 'app-admin-trips',
  standalone: true,
  imports: [AdminNavbarComponent, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <div class="app-container">
      <app-admin-navbar></app-admin-navbar>

      <main class="main-content fade-in-up admin-main">
        <div class="mb-4">
          <h1 class="title mb-1">Monitoreo de Viajes</h1>
          <p class="subtitle mb-0">Supervisión en tiempo real de todos los viajes solicitados</p>
        </div>

        @if (error) {
          <div class="alert alert-error mb-4">
            <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
          </div>
        }

        <!-- Filter Controls -->
        <div class="glass-panel mb-4" style="padding: 1rem 1.5rem;">
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
            <div class="form-group mb-0" style="flex: 1; min-width: 240px;">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input class="form-control" [(ngModel)]="searchTerm" placeholder="Buscar por dirección u origen/destino..." />
            </div>
            <div class="form-group mb-0" style="width: 200px;">
              <i class="fa-solid fa-filter"></i>
              <select class="form-control" [(ngModel)]="selectedStatus">
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aceptado">Aceptados</option>
                <option value="finalizado">Finalizados</option>
              </select>
            </div>
          </div>
        </div>

        @if (loading) {
          <div class="text-center py-5">
            <i class="fa-solid fa-spinner fa-spin fa-3x" style="color: var(--primary);"></i>
            <p class="mt-3 text-muted">Cargando la lista global de viajes...</p>
          </div>
        } @else {
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            @for (t of filteredTrips; track t.id) {
              <div class="glass-panel" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                  <div>
                    <span class="badge" [class.badge-pending]="t.status === 'pendiente'" [class.badge-accepted]="t.status === 'aceptado'" [class.badge-completed]="t.status === 'finalizado'">
                      {{ t.status }}
                    </span>
                    <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 0.75rem;">
                      <i class="fa-solid fa-clock"></i> Solic: {{ (t.createdAt || t.requested_at) | date:'short' }}
                    </span>
                  </div>
                  <div style="font-size: 1.25rem; font-weight: 700; color: #6EE7B7;">
                    {{ t.fare | currency:'ARS':'symbol':'1.0-0' }}
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                  <!-- Origen & Destino -->
                  <div>
                    <div class="card-row">
                      <i class="fa-solid fa-location-dot" style="color: var(--primary);"></i>
                      <div>
                        <span style="font-size: 0.8rem; font-weight: 600;" class="text-muted">Origen:</span>
                        <p style="margin: 0; font-weight: 500; color: var(--text-main);">{{ t.origin_address || 'No especificado' }}</p>
                      </div>
                    </div>
                    <div class="card-row" style="margin-top: 0.5rem;">
                      <i class="fa-solid fa-flag-checkered" style="color: var(--success);"></i>
                      <div>
                        <span style="font-size: 0.8rem; font-weight: 600;" class="text-muted">Destino:</span>
                        <p style="margin: 0; font-weight: 500; color: var(--text-main);">{{ t.destination_address || 'No especificado' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Pasajero y Conductor -->
                  <div>
                    <div class="card-row">
                      <i class="fa-solid fa-user"></i>
                      <div>
                        <span style="font-size: 0.8rem;" class="text-muted">Pasajero:</span>
                        <p style="margin: 0; font-weight: 600; color: #FFFFFF;">{{ t.passenger?.nombre || 'Desconocido' }}</p>
                        <span style="font-size: 0.8rem;" class="text-muted">{{ t.passenger?.telefono }}</span>
                      </div>
                    </div>

                    <div class="card-row" style="margin-top: 0.5rem;">
                      <i class="fa-solid fa-helmet-safety"></i>
                      <div>
                        <span style="font-size: 0.8rem;" class="text-muted">Conductor Asignado:</span>
                        @if (t.driver) {
                          <p style="margin: 0; font-weight: 600; color: #FFFFFF;">{{ t.driver.nombre }}</p>
                          <span style="font-size: 0.8rem;" class="text-muted">{{ t.driver.telefono }}</span>
                        } @else {
                          <p style="margin: 0; font-style: italic;" class="text-muted">Esperando conductor...</p>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="glass-panel text-center py-5">
                <i class="fa-solid fa-route fa-3x text-muted mb-3"></i>
                <p class="text-muted font-bold">No se encontraron viajes con los filtros seleccionados.</p>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
})
export class AdminTripsComponent implements OnInit {
  private adminService = inject(AdminService);

  trips: Trip[] = [];
  loading = true;
  error = '';

  searchTerm = '';
  selectedStatus = '';

  ngOnInit() {
    this.loadTrips();
  }

  loadTrips() {
    this.loading = true;
    this.adminService.getTrips().subscribe({
      next: (data) => {
        this.trips = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al obtener la lista de viajes.';
        this.loading = false;
      },
    });
  }

  get filteredTrips(): Trip[] {
    const search = this.searchTerm.toLowerCase();
    return this.trips.filter((t) => {
      const origin = (t.origin_address || '').toLowerCase();
      const destination = (t.destination_address || '').toLowerCase();
      const passengerName = (t.passenger?.nombre || '').toLowerCase();
      const driverName = (t.driver?.nombre || '').toLowerCase();

      const matchesSearch =
        origin.includes(search) ||
        destination.includes(search) ||
        passengerName.includes(search) ||
        driverName.includes(search);

      const matchesStatus = this.selectedStatus ? t.status === this.selectedStatus : true;
      return matchesSearch && matchesStatus;
    });
  }
}
