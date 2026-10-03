import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminNavbarComponent } from '../../components/admin-navbar.component';
import { Vehicle } from '../../../../models';

@Component({
  selector: 'app-admin-vehicles',
  standalone: true,
  imports: [AdminNavbarComponent, FormsModule, DatePipe],
  template: `
    <div class="app-container">
      <app-admin-navbar></app-admin-navbar>

      <main class="main-content fade-in-up admin-main">
        <div class="mb-4">
          <h1 class="title mb-1">Gestión de Vehículos</h1>
          <p class="subtitle mb-0">Listado de motos registradas y sus conductores asociados</p>
        </div>

        @if (error) {
          <div class="alert alert-error mb-4">
            <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
          </div>
        }

        <!-- Search Bar -->
        <div class="glass-panel mb-4" style="padding: 1rem 1.5rem;">
          <div class="form-group mb-0">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input class="form-control" [(ngModel)]="searchTerm" placeholder="Buscar por placa, marca, modelo o conductor..." />
          </div>
        </div>

        @if (loading) {
          <div class="text-center py-5">
            <i class="fa-solid fa-spinner fa-spin fa-3x" style="color: var(--primary);"></i>
            <p class="mt-3 text-muted">Cargando flota de vehículos...</p>
          </div>
        } @else {
          <div class="cards-grid">
            @for (v of filteredVehicles; track v.id) {
              <div class="card">
                <div class="card-title" style="justify-content: space-between;">
                  <span><i class="fa-solid fa-motorcycle" style="color: var(--primary);"></i> {{ v.marca }} {{ v.modelo }}</span>
                  <span class="badge badge-accepted" style="font-family: monospace; font-size: 0.95rem;">{{ v.placa }}</span>
                </div>

                <div class="card-row">
                  <i class="fa-solid fa-palette"></i>
                  <div>
                    <span style="font-size: 0.85rem;" class="text-muted">Color:</span>
                    <strong style="display: block;">{{ v.color }}</strong>
                  </div>
                </div>

                <div class="card-row">
                  <i class="fa-solid fa-user-check"></i>
                  <div>
                    <span style="font-size: 0.85rem;" class="text-muted">Conductor Vinculado:</span>
                    @if (v.conductor) {
                      <strong style="display: block; color: var(--text-main);">{{ v.conductor.nombre }}</strong>
                      <span style="font-size: 0.8rem;" class="text-muted">{{ v.conductor.email }} | {{ v.conductor.telefono }}</span>
                    } @else {
                      <span class="text-muted" style="font-style: italic;">Sin conductor asignado</span>
                    }
                  </div>
                </div>

                <div class="card-row mb-0" style="margin-top: 1rem; border-top: 1px solid var(--glass-border); padding-top: 0.5rem;">
                  <i class="fa-solid fa-calendar-check"></i>
                  <span style="font-size: 0.8rem;" class="text-muted">Registrado el {{ v.createdAt | date:'short' }}</span>
                </div>
              </div>
            } @empty {
              <div class="glass-panel text-center py-5" style="grid-column: 1 / -1;">
                <i class="fa-solid fa-motorcycle fa-3x text-muted mb-3"></i>
                <p class="text-muted font-bold">No se encontraron vehículos registrados que coincidan.</p>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
})
export class AdminVehiclesComponent implements OnInit {
  private adminService = inject(AdminService);

  vehicles: Vehicle[] = [];
  loading = true;
  error = '';
  searchTerm = '';

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.loading = true;
    this.adminService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar la flota de vehículos';
        this.loading = false;
      },
    });
  }

  get filteredVehicles(): Vehicle[] {
    const query = this.searchTerm.toLowerCase();
    return this.vehicles.filter((v) => {
      const driverName = v.conductor?.nombre?.toLowerCase() || '';
      return (
        v.placa.toLowerCase().includes(query) ||
        v.marca.toLowerCase().includes(query) ||
        v.modelo.toLowerCase().includes(query) ||
        driverName.includes(query)
      );
    });
  }
}
