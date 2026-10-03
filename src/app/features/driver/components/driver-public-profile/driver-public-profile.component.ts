import { Component, Input, signal, inject, OnInit } from '@angular/core';
import { Review, User } from '../../../../models';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { getDriverAvatarSource } from '../../../../core/utils/driver-avatar.util';

@Component({
  selector: 'app-driver-public-profile',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="driver-public-profile glass-panel">
      <!-- Header del perfil -->
      <div class="profile-header" style="text-align: center; padding: 2rem; background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(147, 51, 234, 0.1)); border-radius: 12px; margin-bottom: 1.5rem;">
        <img [src]="avatarSource" [alt]="'Foto de perfil de ' + driver.nombre"
             class="profile-photo" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary); margin-bottom: 1rem;">
        @if (!driver.fotoPerfil) {
          <small class="text-muted d-block mb-3">
            Avatar de <a href="https://www.dicebear.com/styles/adventurer/" target="_blank" rel="noopener noreferrer">Lisa Wischofsky / DiceBear</a>
            · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>
          </small>
        }
        
        <h3 class="font-bold" style="font-size: 1.5rem; margin-bottom: 0.5rem;">{{ driver.nombre }}</h3>
        
        @if (driver.frasePersonal) {
          <p class="text-muted" style="font-style: italic; margin-bottom: 1rem;">"{{ driver.frasePersonal }}"</p>
        }
        
        <!-- Calificación y estadísticas -->
        <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
          <div style="text-align: center;">
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--warning);">
              {{ driver.calificacionPromedio || 0 }} <i class="fa-solid fa-star"></i>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Calificación</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">
              {{ driver.totalViajes || 0 }}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Viajes</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--success);">
              {{ driver.anosExperiencia || 0 }}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Años Exp.</div>
          </div>
        </div>
      </div>

      <!-- Badges -->
      @if (driver.badges && driver.badges.length > 0) {
        <div class="badges-section mb-4">
          <h4 class="font-bold mb-2" style="font-size: 1rem;">Logros 🏆</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            @for (badge of driver.badges; track badge) {
              <span class="badge badge-gold">{{ badge }}</span>
            }
          </div>
        </div>
      }

      <!-- Descripción -->
      @if (driver.descripcion) {
        <div class="description-section mb-4">
          <h4 class="font-bold mb-2" style="font-size: 1rem;">Sobre mí</h4>
          <p class="text-muted">{{ driver.descripcion }}</p>
        </div>
      }

      @if (reviews.length > 0) {
        <div class="reviews-section mb-4">
          <h4 class="font-bold mb-2" style="font-size: 1rem;">Reseñas aprobadas</h4>
          @for (review of reviews; track review.id) {
            <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
              <div style="color: var(--warning); font-weight: 700;">★ {{ review.rating }}/5</div>
              @if (review.comment) { <p style="margin: 0.35rem 0;">{{ review.comment }}</p> }
              <small class="text-muted">Por {{ review.author?.nombre || 'Usuario' }} · {{ review.createdAt | date:'shortDate' }}</small>
            </div>
          }
        </div>
      }

      <!-- Información Personal -->
      <div class="personal-info mb-4">
        <h4 class="font-bold mb-2" style="font-size: 1rem;">Información Personal</h4>
        
        @if (driver.edad) {
          <div class="info-row" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <i class="fa-solid fa-birthday-cake" style="color: var(--primary);"></i>
            <span>{{ driver.edad }} años</span>
          </div>
        }
        
        @if (driver.idiomas && driver.idiomas.length > 0) {
          <div class="info-row" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <i class="fa-solid fa-language" style="color: var(--primary);"></i>
            <span>{{ driver.idiomas.join(', ') }}</span>
          </div>
        }
        
        @if (driver.pasatiempos && driver.pasatiempos.length > 0) {
          <div class="info-row" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <i class="fa-solid fa-heart" style="color: var(--primary);"></i>
            <span>{{ driver.pasatiempos.join(', ') }}</span>
          </div>
        }
      </div>

      <!-- Preferencias de Servicio -->
      <div class="service-preferences mb-4">
        <h4 class="font-bold mb-2" style="font-size: 1rem;">Preferencias de Servicio</h4>
        
        @if (driver.musicaPreferida) {
          <div class="info-row" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <i class="fa-solid fa-music" style="color: var(--primary);"></i>
            <span>Música: {{ driver.musicaPreferida }}</span>
          </div>
        }
        
        @if (driver.estiloConduccion) {
          <div class="info-row" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <i class="fa-solid fa-gauge-high" style="color: var(--primary);"></i>
            <span>Estilo: {{ driver.estiloConduccion }}</span>
          </div>
        }
        
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
          @if (driver.aceptaMascotas) {
            <span class="badge badge-success">🐕 Acepta Mascotas</span>
          }
          @if (driver.tieneCascoExtra) {
            <span class="badge badge-success">⛑️ Casco Extra</span>
          }
          @if (driver.ofreceChucherias) {
            <span class="badge badge-warning">🍬 Chucherías</span>
          }
        </div>
      </div>

      <!-- Disponibilidad -->
      @if (driver.horariosTrabajo || (driver.zonasPreferencia && driver.zonasPreferencia.length > 0)) {
        <div class="availability mb-4">
          <h4 class="font-bold mb-2" style="font-size: 1rem;">Disponibilidad</h4>
          
          @if (driver.horariosTrabajo) {
            <div class="info-row" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <i class="fa-solid fa-clock" style="color: var(--primary);"></i>
              <span>{{ driver.horariosTrabajo }}</span>
            </div>
          }
          
          @if (driver.zonasPreferencia && driver.zonasPreferencia.length > 0) {
            <div class="info-row" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <i class="fa-solid fa-map-marker-alt" style="color: var(--primary);"></i>
              <span>{{ driver.zonasPreferencia.join(', ') }}</span>
            </div>
          }
        </div>
      }

      <!-- Información del Vehículo -->
      @if (driver.accesoriosVehiculo && driver.accesoriosVehiculo.length > 0) {
        <div class="vehicle-info mb-4">
          <h4 class="font-bold mb-2" style="font-size: 1rem;">Accesorios del Vehículo</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            @for (accesorio of driver.accesoriosVehiculo; track accesorio) {
              <span class="badge" style="background: rgba(79, 70, 229, 0.1); color: var(--primary); border: 1px solid rgba(79, 70, 229, 0.2);">{{ accesorio }}</span>
            }
          </div>
        </div>
      }

      <!-- Redes Sociales -->
      @if (driver.redesSociales && (driver.redesSociales.instagram || driver.redesSociales.facebook || driver.redesSociales.whatsapp)) {
        <div class="social-info">
          <h4 class="font-bold mb-2" style="font-size: 1rem;">Contacto</h4>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            @if (driver.redesSociales.instagram) {
              <a [href]="driver.redesSociales.instagram" target="_blank" class="social-link" style="color: var(--primary); text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fa-brands fa-instagram"></i> Instagram
              </a>
            }
            @if (driver.redesSociales.facebook) {
              <a [href]="driver.redesSociales.facebook" target="_blank" class="social-link" style="color: var(--primary); text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fa-brands fa-facebook"></i> Facebook
              </a>
            }
            @if (driver.redesSociales.whatsapp) {
              <a [href]="'https://wa.me/' + driver.redesSociales.whatsapp" target="_blank" class="social-link" style="color: var(--success); text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp
              </a>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .driver-public-profile {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-gold {
      background: rgba(245, 158, 11, 0.22);
      color: #FDE68A;
      border: 1px solid rgba(245, 158, 11, 0.5);
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.2);
      color: #6EE7B7;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }

    .badge-warning {
      background: rgba(245, 158, 11, 0.2);
      color: #FCD34D;
      border: 1px solid rgba(245, 158, 11, 0.4);
    }

    .social-link {
      color: #C4B5FD;
    }

    .social-link:hover {
      color: #FFFFFF;
      text-decoration: underline;
    }
  `
})
export class DriverPublicProfileComponent implements OnInit {
  @Input() driver!: User;
  avatarSource = '';
  reviews: Review[] = [];
  private feedback = inject(FeedbackService);

  ngOnInit() {
    this.avatarSource = getDriverAvatarSource(this.driver);
    this.feedback.getApprovedReviews(this.driver.id).subscribe({
      next: (reviews) => this.reviews = reviews,
      error: () => this.reviews = [],
    });
  }
}