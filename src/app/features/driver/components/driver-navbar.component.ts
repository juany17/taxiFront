import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-driver-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Brand -->
        <a routerLink="/driver/home" (click)="closeMobileMenu()" class="navbar-brand">
          <img src="img/logo-moto-taxi.png" alt="MotoTaxi" class="brand-logo">
          <span class="badge badge-pending" style="font-size:0.62rem;padding:0.2rem 0.55rem;margin-left:0.35rem;">Conductor</span>
        </a>

        <!-- Desktop Navigation: Side-by-side buttons -->
        <div class="navbar-actions d-none d-md-flex">
          <a routerLink="/driver/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <i class="fa-solid fa-house"></i> Home
          </a>
          <a routerLink="/driver/trips" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-list-ul"></i> Disponibles
          </a>
          <a routerLink="/driver/profile" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-user-gear"></i> Perfil
          </a>
          <button (click)="logout()" class="btn btn-outline btn-auto btn-sm ms-1" style="padding:0.45rem 1rem;">
            <i class="fa-solid fa-right-from-bracket"></i> Salir
          </button>
        </div>

        <!-- Mobile Hamburger Button -->
        <button class="navbar-toggler-btn d-md-none" type="button" (click)="toggleMobileMenu()" aria-label="Abrir menú de navegación">
          @if (isMobileMenuOpen()) {
            <i class="fa-solid fa-xmark"></i>
          } @else {
            <i class="fa-solid fa-bars"></i>
          }
        </button>
      </div>

      <!-- Mobile Dropdown Menu -->
      @if (isMobileMenuOpen()) {
        <div class="navbar-mobile-collapse d-md-none fade-in-up">
          <a routerLink="/driver/home" (click)="closeMobileMenu()" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <i class="fa-solid fa-house"></i> Home
          </a>
          <a routerLink="/driver/trips" (click)="closeMobileMenu()" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-list-ul"></i> Viajes Disponibles
          </a>
          <a routerLink="/driver/profile" (click)="closeMobileMenu()" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-user-gear"></i> Mi Perfil
          </a>
          <button (click)="logout()" class="btn btn-outline btn-sm mt-2">
            <i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
          </button>
        </div>
      }
    </nav>
  `
})
export class DriverNavbarComponent {
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
