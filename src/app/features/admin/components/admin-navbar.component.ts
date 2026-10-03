import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Brand -->
        <a routerLink="/admin/home" (click)="closeMobileMenu()" class="navbar-brand">
          <img src="img/logo-moto-taxi.png" alt="MotoTaxi" class="brand-logo">
          <span class="badge badge-purple" style="font-size:0.62rem;padding:0.2rem 0.55rem;margin-left:0.35rem;">Admin</span>
        </a>

        <!-- Desktop Navigation: Side-by-side buttons -->
        <div class="navbar-actions d-none d-lg-flex">
          <a routerLink="/admin/home"     routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <i class="fa-solid fa-chart-line"></i> Dashboard
          </a>
          <a routerLink="/admin/users"    routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-users"></i> Usuarios
          </a>
          <a routerLink="/admin/vehicles" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-motorcycle"></i> Vehículos
          </a>
          <a routerLink="/admin/trips"    routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-route"></i> Viajes
          </a>
          <a routerLink="/admin/feedback" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-comments"></i> Reseñas
          </a>
          <button (click)="logout()" class="btn btn-danger btn-auto btn-sm ms-2" style="padding:0.45rem 1rem;">
            <i class="fa-solid fa-right-from-bracket"></i> Salir
          </button>
        </div>

        <!-- Mobile Hamburger Button -->
        <button class="navbar-toggler-btn d-lg-none" type="button" (click)="toggleMobileMenu()" aria-label="Abrir menú de navegación">
          @if (isMobileMenuOpen()) {
            <i class="fa-solid fa-xmark"></i>
          } @else {
            <i class="fa-solid fa-bars"></i>
          }
        </button>
      </div>

      <!-- Mobile Dropdown Menu -->
      @if (isMobileMenuOpen()) {
        <div class="navbar-mobile-collapse d-lg-none fade-in-up">
          <a routerLink="/admin/home" (click)="closeMobileMenu()" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <i class="fa-solid fa-chart-line"></i> Dashboard
          </a>
          <a routerLink="/admin/users" (click)="closeMobileMenu()" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-users"></i> Usuarios
          </a>
          <a routerLink="/admin/vehicles" (click)="closeMobileMenu()" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-motorcycle"></i> Vehículos
          </a>
          <a routerLink="/admin/trips" (click)="closeMobileMenu()" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-route"></i> Viajes
          </a>
          <a routerLink="/admin/feedback" (click)="closeMobileMenu()" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-comments"></i> Reseñas
          </a>
          <button (click)="logout()" class="btn btn-danger btn-sm mt-2">
            <i class="fa-solid fa-right-from-bracket"></i> Salir
          </button>
        </div>
      }
    </nav>
  `,
})
export class AdminNavbarComponent {
  isMobileMenuOpen = signal(false);
  private auth = inject(AuthService);
  private router = inject(Router);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  logout() {
    this.closeMobileMenu();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
