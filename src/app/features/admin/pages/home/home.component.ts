import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { AdminService, AdminStats } from '../../../../core/services/admin.service';
import { AdminNavbarComponent } from '../../components/admin-navbar.component';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [AdminNavbarComponent, RouterLink, CurrencyPipe],
  template: `
    <div class="app-container fade-in-up">
      <app-admin-navbar></app-admin-navbar>

      <main class="main-content admin-main">
        @if (loading) {
          <div class="text-center py-5">
            <i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--primary);opacity:0.8;"></i>
            <p class="mt-3 text-muted">Cargando métricas de la plataforma...</p>
          </div>
        } @else if (error) {
          <div class="alert alert-error mb-4">
            <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
          </div>
        } @else if (stats) {

          <!-- Section title -->
          <div class="mb-3">
            <p class="section-label mb-0"><i class="fa-solid fa-chart-line me-1"></i>Métricas en Tiempo Real</p>
            <h2 class="title mb-0" style="font-size:1.6rem;">
              Panel de <span class="gradient-text">Control</span>
            </h2>
          </div>

          <!-- KPI Grid -->
          <div class="row g-3 mb-4">
            <div class="col-12 col-sm-6 col-xl-3 fade-in-up stagger-1">
              <div class="kpi-card kpi-purple">
                <div class="kpi-icon icon-purple"><i class="fa-solid fa-users"></i></div>
                <div class="kpi-value">{{ stats.users.total }}</div>
                <div class="kpi-label">Usuarios Totales</div>
                <div class="kpi-sub">
                  <span>Pasajeros: {{ stats.users.passengers }}</span>
                  <span>Conductores: {{ stats.users.drivers }}</span>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-xl-3 fade-in-up stagger-2">
              <div class="kpi-card kpi-green">
                <div class="kpi-icon icon-green"><i class="fa-solid fa-motorcycle"></i></div>
                <div class="kpi-value">{{ stats.vehicles.total }}</div>
                <div class="kpi-label">Motos Registradas</div>
                <div class="kpi-sub"><span>Vinculadas a conductores</span></div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-xl-3 fade-in-up stagger-3">
              <div class="kpi-card kpi-amber">
                <div class="kpi-icon icon-amber"><i class="fa-solid fa-route"></i></div>
                <div class="kpi-value">{{ stats.trips.total }}</div>
                <div class="kpi-label">Viajes Solicitados</div>
                <div class="kpi-sub">
                  <span>Pendientes: {{ stats.trips.pending }}</span>
                  <span>Finalizados: {{ stats.trips.completed }}</span>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-xl-3 fade-in-up stagger-4">
              <div class="kpi-card kpi-green">
                <div class="kpi-icon icon-green"><i class="fa-solid fa-sack-dollar"></i></div>
                <div class="kpi-value" style="font-size:1.6rem;color:#6EE7B7;">{{ stats.financial.totalRevenue | currency:'ARS':'symbol':'1.0-0' }}</div>
                <div class="kpi-label">Recaudación Total</div>
                <div class="kpi-sub"><span>Viajes finalizados</span></div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <p class="section-label mb-1"><i class="fa-solid fa-bolt me-1"></i>Acciones de Administración</p>
          <div class="row g-3">
            <div class="col-12 col-sm-6 col-lg-3 fade-in-up stagger-1">
              <a routerLink="/admin/users" class="card text-center d-flex flex-column align-items-center py-4 h-100" style="text-decoration:none;">
                <div class="icon-box mb-3" style="background:rgba(124,58,237,0.15);color:#C4B5FD;font-size:1.75rem;">
                  <i class="fa-solid fa-user-gear"></i>
                </div>
                <h3 style="font-size:1.05rem;font-weight:600;color:var(--text-main);margin-bottom:0.5rem;">Gestión de Usuarios</h3>
                <p class="text-muted mb-0" style="font-size:0.85rem;">Ver la lista de usuarios, cambiar roles o registrar nuevos administradores.</p>
              </a>
            </div>
            <div class="col-12 col-sm-6 col-lg-3 fade-in-up stagger-2">
              <a routerLink="/admin/vehicles" class="card text-center d-flex flex-column align-items-center py-4 h-100" style="text-decoration:none;">
                <div class="icon-box mb-3" style="background:rgba(16,185,129,0.15);color:#6EE7B7;font-size:1.75rem;">
                  <i class="fa-solid fa-motorcycle"></i>
                </div>
                <h3 style="font-size:1.05rem;font-weight:600;color:var(--text-main);margin-bottom:0.5rem;">Gestión de Vehículos</h3>
                <p class="text-muted mb-0" style="font-size:0.85rem;">Revisar la flota de motos y la información de los conductores asociados.</p>
              </a>
            </div>
            <div class="col-12 col-sm-6 col-lg-3 fade-in-up stagger-3">
              <a routerLink="/admin/trips" class="card text-center d-flex flex-column align-items-center py-4 h-100" style="text-decoration:none;">
                <div class="icon-box mb-3" style="background:rgba(245,158,11,0.15);color:#FCD34D;font-size:1.75rem;">
                  <i class="fa-solid fa-map-location-dot"></i>
                </div>
                <h3 style="font-size:1.05rem;font-weight:600;color:var(--text-main);margin-bottom:0.5rem;">Monitoreo de Viajes</h3>
                <p class="text-muted mb-0" style="font-size:0.85rem;">Supervisar todos los viajes en tiempo real, origen, destino y estado actual.</p>
              </a>
            </div>
            <div class="col-12 col-sm-6 col-lg-3 fade-in-up stagger-4">
              <a routerLink="/admin/feedback" class="card text-center d-flex flex-column align-items-center py-4 h-100" style="text-decoration:none;">
                <div class="icon-box mb-3" style="background:rgba(239,68,68,0.15);color:#FCA5A5;font-size:1.75rem;">
                  <i class="fa-solid fa-comments"></i>
                </div>
                <h3 style="font-size:1.05rem;font-weight:600;color:var(--text-main);margin-bottom:0.5rem;">Moderación</h3>
                <p class="text-muted mb-0" style="font-size:0.85rem;">Aprobar reseñas y revisar denuncias privadas de la plataforma.</p>
              </a>
            </div>
          </div>
        }
      </main>
    </div>
  `,
})
export class AdminHomeComponent implements OnInit {
  private adminService = inject(AdminService);
  stats: AdminStats | null = null;
  loading = true;
  error = '';

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al obtener las estadísticas del servidor';
        this.loading = false;
      },
    });
  }
}
