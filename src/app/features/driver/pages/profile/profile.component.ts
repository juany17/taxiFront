import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { Vehicle } from '../../../../models';
import { DatePipe } from '@angular/common';
import { DriverNavbarComponent } from '../../components/driver-navbar.component';
import { getDriverAvatarSource } from '../../../../core/utils/driver-avatar.util';

@Component({
  selector: 'app-driver-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule, DriverNavbarComponent],
  styles: `
    .profile-container {
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
      text-align: center;
    }

    .profile-subtitle {
      margin-bottom: 2rem;
      color: var(--text-muted);
    }

    .profile-section {
      width: 100%;
      max-width: 720px;
      margin-left: auto;
      margin-right: auto;
    }

    .vehicle-section {
      width: 100%;
      max-width: 720px;
      margin-left: auto;
      margin-right: auto;
    }

    .profile-photo-container {
      position: relative;
      display: inline-block;
    }

    .profile-photo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--primary);
    }

    .input-wrapper {
      position: relative;
    }

    .input-wrapper .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-faint);
      font-size: 1rem;
      pointer-events: none;
      transition: color 0.2s;
      z-index: 2;
    }

    .input-wrapper:focus-within .input-icon {
      color: #A78BFA;
    }

    .input-wrapper textarea {
      padding-top: 0.85rem;
    }

    .tab-content {
      animation: fadeInUp 0.3s ease;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1000;
      animation: slideDown 0.3s ease;
    }

    .toast.hiding {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  `,
  template: `
    <div class="app-container fade-in-up">
      <app-driver-navbar></app-driver-navbar>

      <main class="main-content">
        <div class="profile-container">
          <h2 class="title">Mi Perfil</h2>
          <p class="subtitle profile-subtitle" style="color: var(--text-main);">{{ auth.currentUser()?.nombre }} · {{ auth.currentUser()?.email }}</p>
        </div>

        <!-- Sección de Badges -->
        @if (getBadges().length > 0) {
          <div class="glass-panel profile-section mb-4">
            <div class="text-center mb-3">
              <h3 class="font-bold mb-2">Tus Logros 🏆</h3>
              <p class="text-muted">Badges que has ganado por tu excelente servicio</p>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center;">
              @for (badge of getBadges(); track badge) {
                <span class="badge badge-gold">{{ badge }}</span>
              }
            </div>
          </div>
        }

        <!-- Sección de Personalización del Perfil -->
        <div class="glass-panel profile-section mb-4">
          <div class="text-center mb-4">
            <h3 class="font-bold mb-2">Personaliza tu Perfil 🎨</h3>
            <p class="text-muted">Haz tu perfil único y atractivo para los usuarios</p>
          </div>

          <!-- Tabs de navegación -->
          <div class="tabs-bar mb-4">
            <button class="tab-btn" [class.active]="activeTab === 'basic'" (click)="activeTab = 'basic'">
              <i class="fa-solid fa-user"></i> Básico
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'professional'" (click)="activeTab = 'professional'">
              <i class="fa-solid fa-briefcase"></i> Profesional
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'preferences'" (click)="activeTab = 'preferences'">
              <i class="fa-solid fa-sliders"></i> Preferencias
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'availability'" (click)="activeTab = 'availability'">
              <i class="fa-solid fa-clock"></i> Disponibilidad
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'vehicle'" (click)="activeTab = 'vehicle'">
              <i class="fa-solid fa-motorcycle"></i> Vehículo
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'social'" (click)="activeTab = 'social'">
              <i class="fa-solid fa-share-nodes"></i> Social
            </button>
          </div>

          <!-- Tab Básico -->
          @if (activeTab === 'basic') {
            <div class="tab-content">
              <div class="text-center mb-4">
                <div class="profile-photo-container" style="position: relative; display: inline-block;">
                  @if (previewUrl) {
                    <img [src]="previewUrl" [alt]="'Foto de perfil de ' + (auth.currentUser()?.nombre || 'conductor')"
                         class="profile-photo" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary);">
                  } @else {
                    <img [src]="getCurrentDriverAvatar()" [alt]="'Avatar de ' + (auth.currentUser()?.nombre || 'conductor')"
                         class="profile-photo" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary);">
                  }
                  <label for="photoInput" class="photo-upload-btn" style="position: absolute; bottom: 0; right: 0; background: var(--success); color: white; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid white;">
                    <i class="fa-solid fa-camera"></i>
                  </label>
                  <input type="file" id="photoInput" (change)="onFileSelected($event)" accept="image/*" style="display: none;">
                </div>
                @if (!previewUrl) {
                  <small class="text-muted d-block mt-2">
                    Avatar de <a href="https://www.dicebear.com/styles/adventurer/" target="_blank" rel="noopener noreferrer">Lisa Wischofsky / DiceBear</a>
                    · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>
                  </small>
                }
              </div>

              <div class="form-group mb-3">
                <label>Descripción</label>
                <div class="input-wrapper">
                  <i class="fa-solid fa-user input-icon"></i>
                  <textarea class="form-control" [(ngModel)]="profileData.descripcion" name="descripcion" placeholder="Cuéntanos sobre ti (opcional)..." rows="3"></textarea>
                </div>
              </div>

              <div class="form-group mb-3">
                <label>Alias de Mercado Pago</label>
                <div class="input-wrapper">
                  <i class="fa-solid fa-wallet input-icon"></i>
                  <input class="form-control" [(ngModel)]="profileData.mercadoPagoAlias" name="mercadoPagoAlias"
                         maxlength="100" placeholder="Tu alias (solo se muestra a pasajeros de viajes aceptados)">
                </div>
              </div>

              <div class="form-group mb-3">
                <label>Frase personal</label>
                <div class="input-wrapper">
                  <i class="fa-solid fa-quote-left input-icon"></i>
                  <input class="form-control" [(ngModel)]="profileData.frasePersonal" name="frasePersonal" placeholder="Tu frase personal (ej. 'Conduzco seguro y rápido')">
                </div>
              </div>

              <div class="form-group mb-3">
                <label>Edad</label>
                <div class="input-wrapper">
                  <i class="fa-solid fa-calendar input-icon"></i>
                  <input class="form-control" [(ngModel)]="profileData.edad" name="edad" type="number" placeholder="Edad (opcional)" min="18" max="100">
                </div>
              </div>
            </div>
          }

          <!-- Tab Profesional -->
          @if (activeTab === 'professional') {
            <div class="tab-content">
              <div class="form-group mb-3">
                <label>Años de experiencia</label>
                <div class="input-wrapper">
                  <i class="fa-solid fa-clock-rotate-left input-icon"></i>
                  <input class="form-control" [(ngModel)]="profileData.anosExperiencia" name="anosExperiencia" type="number" placeholder="Años de experiencia" min="0" max="50">
                </div>
              </div>

              <div class="form-group mb-3">
                <label>Idiomas</label>
                <div class="input-wrapper">
                  <i class="fa-solid fa-language input-icon"></i>
                  <input class="form-control" [(ngModel)]="profileData.idiomas" name="idiomas" placeholder="Idiomas (separados por coma, ej. español, inglés)">
                </div>
              </div>

              <div class="form-group mb-3">
                <label>Pasatiempos</label>
                <div class="input-wrapper">
                  <i class="fa-solid fa-heart input-icon"></i>
                  <input class="form-control" [(ngModel)]="profileData.pasatiempos" name="pasatiempos" placeholder="Pasatiempos (separados por coma, ej. música, fútbol)">
                </div>
              </div>

              <div class="card-row mb-3" style="background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.25); padding: 1rem; border-radius: 12px;">
                <i class="fa-solid fa-star" style="color: var(--warning);"></i>
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Tu Calificación</div>
                  <div style="font-weight: 600; color: #FFFFFF;">{{ auth.currentUser()?.calificacionPromedio || 0 }} / 5.0 ⭐</div>
                </div>
              </div>

              <div class="card-row mb-0" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25); padding: 1rem; border-radius: 12px;">
                <i class="fa-solid fa-route" style="color: var(--success);"></i>
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Total de Viajes</div>
                  <div style="font-weight: 600; color: #FFFFFF;">{{ auth.currentUser()?.totalViajes || 0 }} viajes realizados</div>
                </div>
              </div>
            </div>
          }

          <!-- Tab Preferencias -->
          @if (activeTab === 'preferences') {
            <div class="tab-content">
              <div class="form-group mb-3">
                <label>Música preferida</label>
                <div class="input-wrapper">
                  <i class="fa-solid fa-music input-icon"></i>
                  <input class="form-control" [(ngModel)]="profileData.musicaPreferida" name="musicaPreferida" placeholder="Música preferida (ej. salsa, reggaeton, sin música)">
                </div>
              </div>

              <div class="form-group mb-3">
                <label>Estilo de conducción</label>
                <div class="input-wrapper select-wrapper">
                  <i class="fa-solid fa-gauge-high input-icon"></i>
                  <select class="form-control" [(ngModel)]="profileData.estiloConduccion" name="estiloConduccion">
                    <option value="">Selecciona tu estilo de conducción</option>
                    <option value="tranquilo">Tranquilo 🐢</option>
                    <option value="intermedio">Intermedio 🚗</option>
                    <option value="rapido">Rápido 🏎️</option>
                  </select>
                </div>
              </div>

              <div class="form-group mb-3">
                <label>Preferencias</label>
                <div class="checkbox-group">
                  <label class="checkbox-item">
                    <input type="checkbox" [(ngModel)]="profileData.aceptaMascotas" name="aceptaMascotas">
                    <span>Acepto mascotas pequeñas 🐕</span>
                  </label>
                  <label class="checkbox-item">
                    <input type="checkbox" [(ngModel)]="profileData.tieneCascoExtra" name="tieneCascoExtra">
                    <span>Tengo casco extra para pasajeros ⛑️</span>
                  </label>
                  <label class="checkbox-item">
                    <input type="checkbox" [(ngModel)]="profileData.ofreceChucherias" name="ofreceChucherias">
                    <span>Ofrezco chucherías/agua 🍬</span>
                  </label>
                </div>
              </div>
            </div>
          }

          <!-- Tab Disponibilidad -->
          @if (activeTab === 'availability') {
            <div class="tab-content">
              <div class="form-group mb-3">
                <label>Horarios de trabajo</label>
                <div class="input-wrapper">
                  <i class="fa-solid fa-clock input-icon"></i>
                  <textarea class="form-control" [(ngModel)]="profileData.horariosTrabajo" name="horariosTrabajo" placeholder="Horarios de trabajo (ej. Lunes a Viernes 8am-6pm, Sábados 9am-2pm)" rows="3"></textarea>
                </div>
              </div>

              <div class="form-group mb-0">
                <label>Zonas de preferencia</label>
                <div class="input-wrapper">
                  <i class="fa-solid fa-map-marker-alt input-icon"></i>
                  <input class="form-control" [(ngModel)]="profileData.zonasPreferencia" name="zonasPreferencia" placeholder="Zonas de preferencia (separadas por coma, ej. Centro, Norte, Sur)">
                </div>
              </div>
            </div>
          }

          <!-- Tab Vehículo -->
          @if (activeTab === 'vehicle') {
            <div class="tab-content">
              <div class="form-group mb-3">
                <label>Accesorios del vehículo</label>
                <div class="input-wrapper">
                  <i class="fa-solid fa-motorcycle input-icon"></i>
                  <input class="form-control" [(ngModel)]="profileData.accesoriosVehiculo" name="accesoriosVehiculo" placeholder="Accesorios del vehículo (separados por coma, ej. parabrisas, alforja, luces LED)">
                </div>
              </div>

              <div class="text-center text-muted">
                <i class="fa-solid fa-info-circle"></i>
                Próximamente podrás agregar fotos adicionales de tu vehículo
              </div>
            </div>
          }

          <!-- Tab Social -->
          @if (activeTab === 'social') {
            <div class="tab-content">
              <div class="form-group mb-3">
                <label>Instagram</label>
                <div class="input-wrapper">
                  <i class="fa-brands fa-instagram input-icon"></i>
                  <input class="form-control" [(ngModel)]="profileData.redesSociales.instagram" name="instagram" placeholder="Instagram (opcional)">
                </div>
              </div>

              <div class="form-group mb-3">
                <label>Facebook</label>
                <div class="input-wrapper">
                  <i class="fa-brands fa-facebook input-icon"></i>
                  <input class="form-control" [(ngModel)]="profileData.redesSociales.facebook" name="facebook" placeholder="Facebook (opcional)">
                </div>
              </div>

              <div class="form-group mb-0">
                <label>WhatsApp</label>
                <div class="input-wrapper">
                  <i class="fa-brands fa-whatsapp input-icon"></i>
                  <input class="form-control" [(ngModel)]="profileData.redesSociales.whatsapp" name="whatsapp" placeholder="WhatsApp (opcional)">
                </div>
              </div>
            </div>
          }
          <button type="button" class="btn btn-primary mt-4" (click)="updateProfile()" [disabled]="profileSaving || !hasChanges()" style="width: 100%;">
            @if (profileSaving) {
              <i class="fa-solid fa-circle-notch fa-spin"></i> Guardando...
            } @else {
              <span>Guardar Todos los Cambios</span>
              <i class="fa-solid fa-check"></i>
            }
          </button>
        </div>

        @if (loading()) {
          <div class="text-center">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--primary);"></i>
            <p class="mt-3">Cargando datos del vehículo...</p>
          </div>
        } @else {
          @if (vehicle()) {
            <div class="card vehicle-section" style="border-top: 4px solid var(--primary); max-width: 500px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span class="badge badge-accepted">MI VEHÍCULO</span>
                <span class="font-bold" style="font-size: 1.25rem;">{{ vehicle()!.placa }}</span>
              </div>

              <div class="card-row">
                <i class="fa-solid fa-motorcycle" style="color: var(--primary);"></i>
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Marca / Modelo</div>
                  <div style="font-weight: 500;">{{ vehicle()!.marca }} {{ vehicle()!.modelo }}</div>
                </div>
              </div>

              <div class="card-row">
                <i class="fa-solid fa-palette" style="color: var(--success);"></i>
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Color</div>
                  <div style="font-weight: 500;">{{ vehicle()!.color }}</div>
                </div>
              </div>

              @if (vehicle()!.createdAt) {
                <div class="card-row mb-0">
                  <i class="fa-solid fa-calendar" style="color: var(--text-muted);"></i>
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Registrado el</div>
                    <div style="font-weight: 500;">{{ vehicle()!.createdAt | date:'dd/MM/yyyy' }}</div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="glass-panel vehicle-section" style="max-width: 500px;">
              <div class="text-center mb-4">
                <i class="fa-solid fa-motorcycle" style="font-size: 2.5rem; color: var(--warning); margin-bottom: 1rem;"></i>
                <h3 class="font-bold mb-2">Aún no registraste tu moto</h3>
                <p class="text-muted">Completa los datos de tu vehículo para poder recibir viajes.</p>
              </div>

              <form (ngSubmit)="submit()" #vehicleForm="ngForm">
                <div class="form-group">
                  <i class="fa-solid fa-id-card" style="color: var(--primary);"></i>
                  <input class="form-control" [(ngModel)]="data.placa" name="placa" placeholder="Placa (ej. ABC123)" required>
                </div>

                <div class="form-group">
                  <i class="fa-solid fa-motorcycle" style="color: var(--primary);"></i>
                  <input class="form-control" [(ngModel)]="data.marca" name="marca" placeholder="Marca (ej. Honda)" required>
                </div>

                <div class="form-group">
                  <i class="fa-solid fa-gear" style="color: var(--primary);"></i>
                  <input class="form-control" [(ngModel)]="data.modelo" name="modelo" placeholder="Modelo (ej. CB 125)" required>
                </div>

                <div class="form-group mb-4">
                  <i class="fa-solid fa-palette" style="color: var(--success);"></i>
                  <input class="form-control" [(ngModel)]="data.color" name="color" placeholder="Color (ej. Rojo)" required>
                </div>

                @if (error) {
                  <div class="alert alert-error">
                    <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
                  </div>
                }
                @if (success) {
                  <div class="alert alert-success">
                    <i class="fa-solid fa-circle-check"></i> Vehículo registrado con éxito.
                  </div>
                }

                <button type="submit" class="btn btn-primary" [disabled]="!vehicleForm.form.valid || saving">
                  @if (saving) {
                    <i class="fa-solid fa-circle-notch fa-spin"></i> Guardando...
                  } @else {
                    <span>Registrar Vehículo</span>
                    <i class="fa-solid fa-check"></i>
                  }
                </button>
              </form>
            </div>
          }
        }
      </main>

      <div class="toast" [class.hiding]="toastHiding()" *ngIf="showToast()">
        <div class="alert alert-success">
          <i class="fa-solid fa-circle-check"></i> Cambios guardados exitosamente
        </div>
      </div>
    </div>
  `
})
export class DriverProfileComponent implements OnInit {
  auth = inject(AuthService);
  private vehicleService = inject(VehicleService);
  private router = inject(Router);

  vehicle = signal<Vehicle | null>(null);
  loading = signal(true);

  data: any = { placa: '', marca: '', modelo: '', color: '' };
  profileData: any = {
    fotoPerfil: '',
    mercadoPagoAlias: '',
    descripcion: '',
    anosExperiencia: 0,
    edad: null,
    idiomas: [],
    pasatiempos: [],
    frasePersonal: '',
    musicaPreferida: '',
    aceptaMascotas: false,
    tieneCascoExtra: false,
    estiloConduccion: 'intermedio',
    ofreceChucherias: false,
    horariosTrabajo: '',
    zonasPreferencia: [],
    accesoriosVehiculo: [],
    redesSociales: { instagram: '', facebook: '', whatsapp: '' }
  };
  error = '';
  success = false;
  saving = false;
  profileSaving = false;
  private paymentAliasLoaded = false;
  profileError = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  private generatedAvatarUrl = '';
  activeTab = 'basic';
  showToast = signal(false);
  toastHiding = signal(false);
  originalProfileData = signal<any>(null);

  hasChanges(): boolean {
    const original = this.originalProfileData();
    if (!original) return false;
    const current = this.profileData;
    return this.selectedFile !== null || JSON.stringify(original) !== JSON.stringify(this.getComparableData(current));
  }

  getCurrentDriverAvatar(): string {
    const user = this.auth.currentUser();
    if (!user) return '';
    if (!this.generatedAvatarUrl) {
      this.generatedAvatarUrl = getDriverAvatarSource(user);
    }
    return this.generatedAvatarUrl;
  }

  private getComparableData(data: any): any {
    const { redesSociales, ...rest } = data;
    return {
      ...rest,
      redesSociales: {
        instagram: redesSociales?.instagram || '',
        facebook: redesSociales?.facebook || '',
        whatsapp: redesSociales?.whatsapp || ''
      }
    };
  }

  getBadges(): string[] {
    const user = this.auth.currentUser();
    if (!user) return [];

    const badges: string[] = [];

    // Badge por experiencia
    const anosExp = user.anosExperiencia ?? 0;
    if (anosExp >= 5) {
      badges.push('Veterano 🏆');
    } else if (anosExp >= 2) {
      badges.push('Experimentado ⭐');
    }

    // Badge por viajes
    const totalViajes = user.totalViajes ?? 0;
    if (totalViajes >= 100) {
      badges.push('Conductor Estrella 🌟');
    } else if (totalViajes >= 50) {
      badges.push('Conductor Destacado 🎯');
    } else if (totalViajes >= 10) {
      badges.push('Conductor Activo 🚀');
    }

    // Badge por calificación
    const calificacion = user.calificacionPromedio ?? 0;
    if (calificacion >= 4.8) {
      badges.push('Excelente Servicio 💎');
    } else if (calificacion >= 4.5) {
      badges.push('Muy Buen Servicio 🌟');
    }

    // Badge por certificaciones
    if (user.certificaciones && user.certificaciones.length > 0) {
      badges.push('Certificado 📜');
    }

    // Badge por seguridad
    if (user.tieneCascoExtra) {
      badges.push('Seguridad Total ⛑️');
    }

    // Badge por servicio
    if (user.ofreceChucherias) {
      badges.push('Servicio Premium 🎁');
    }

    return badges;
  }

  ngOnInit() {
    this.loadVehicle();
    this.loadProfileData();
  }

  loadVehicle() {
    this.loading.set(true);
    const userId = this.auth.currentUser()?.id;
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        const mine = vehicles.find((v: any) => v.conductor?.id === userId) ?? null;
        this.vehicle.set(mine);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  submit() {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = false;

    this.vehicleService.createVehicle(userId, this.data).subscribe({
      next: (vehicle) => {
        this.vehicle.set(vehicle);
        this.success = true;
        this.saving = false;
      },
      error: () => {
        this.error = 'Error al registrar el vehículo. Intenta de nuevo.';
        this.saving = false;
      },
    });
  }

  loadProfileData() {
    const user = this.auth.currentUser();
    if (user) {
      this.profileData.fotoPerfil = user.fotoPerfil || '';
      this.profileData.descripcion = user.descripcion || '';
      this.profileData.anosExperiencia = user.anosExperiencia || 0;
      this.profileData.edad = user.edad || null;
      this.profileData.idiomas = (user.idiomas || []).join(', ');
      this.profileData.pasatiempos = (user.pasatiempos || []).join(', ');
      this.profileData.frasePersonal = user.frasePersonal || '';
      this.profileData.musicaPreferida = user.musicaPreferida || '';
      this.profileData.aceptaMascotas = user.aceptaMascotas || false;
      this.profileData.tieneCascoExtra = user.tieneCascoExtra || false;
      this.profileData.estiloConduccion = user.estiloConduccion || 'intermedio';
      this.profileData.ofreceChucherias = user.ofreceChucherias || false;
      this.profileData.horariosTrabajo = user.horariosTrabajo || '';
      this.profileData.zonasPreferencia = (user.zonasPreferencia || []).join(', ');
      this.profileData.accesoriosVehiculo = (user.accesoriosVehiculo || []).join(', ');
      this.profileData.redesSociales = user.redesSociales || { instagram: '', facebook: '', whatsapp: '' };
      this.previewUrl = user.fotoPerfil || null;
      this.generatedAvatarUrl = getDriverAvatarSource(user);
      this.originalProfileData.set(this.getComparableData({ ...this.profileData }));
      this.auth.getPaymentAlias().subscribe({
        next: ({ mercadoPagoAlias }) => {
          this.profileData.mercadoPagoAlias = mercadoPagoAlias || '';
          const original = this.originalProfileData();
          this.originalProfileData.set({
            ...original,
            mercadoPagoAlias: this.profileData.mercadoPagoAlias,
          });
          this.paymentAliasLoaded = true;
        },
        error: () => {
          this.profileError = 'No se pudo cargar tu alias de Mercado Pago.';
        },
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      if (!input.files[0].type.startsWith('image/')) {
        this.profileError = 'Selecciona un archivo de imagen válido.';
        return;
      }
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  updateProfile() {
    this.profileSaving = true;
    this.profileError = '';

    let updateData: any = {
      descripcion: this.profileData.descripcion,
      anosExperiencia: this.profileData.anosExperiencia,
      edad: this.profileData.edad,
      idiomas: this.toStringArray(this.profileData.idiomas),
      pasatiempos: this.toStringArray(this.profileData.pasatiempos),
      frasePersonal: this.profileData.frasePersonal,
      musicaPreferida: this.profileData.musicaPreferida,
      aceptaMascotas: this.profileData.aceptaMascotas,
      tieneCascoExtra: this.profileData.tieneCascoExtra,
      estiloConduccion: this.profileData.estiloConduccion,
      ofreceChucherias: this.profileData.ofreceChucherias,
      horariosTrabajo: this.profileData.horariosTrabajo,
      zonasPreferencia: this.toStringArray(this.profileData.zonasPreferencia),
      accesoriosVehiculo: this.toStringArray(this.profileData.accesoriosVehiculo),
      redesSociales: this.profileData.redesSociales,
      ...(this.paymentAliasLoaded ? { mercadoPagoAlias: this.profileData.mercadoPagoAlias } : {}),
    };

    if (this.selectedFile) {
      this.compressImageToWebp(this.selectedFile)
        .then((photo) => {
          updateData.fotoPerfil = photo;
          this.sendProfileUpdate(updateData);
        })
        .catch(() => {
          this.profileError = 'No se pudo comprimir la imagen.';
          this.profileSaving = false;
        });
    } else {
      this.sendProfileUpdate(updateData);
    }
  }

  sendProfileUpdate(data: any) {
    this.auth.updateProfile(data).subscribe({
      next: (updatedUser) => {
        this.auth.currentUser.set(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.profileData.fotoPerfil = updatedUser.fotoPerfil || '';
        this.previewUrl = updatedUser.fotoPerfil || null;
        this.generatedAvatarUrl = getDriverAvatarSource(updatedUser);
        this.originalProfileData.set(this.getComparableData({ ...this.profileData }));
        this.showToastSuccess();
        this.profileSaving = false;
        this.selectedFile = null;
      },
      error: () => {
        this.profileError = 'Error al actualizar el perfil. Intenta de nuevo.';
        this.profileSaving = false;
      },
    });
  }

  private toStringArray(value: string | string[] | null | undefined): string[] {
    if (Array.isArray(value)) return value;
    return (value || '').split(',').map((item) => item.trim()).filter(Boolean);
  }

  private compressImageToWebp(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
      reader.onload = () => {
        image.onerror = () => reject(new Error('Imagen inválida'));
        image.onload = () => {
          const maxSize = 512;
          const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext('2d');
          if (!context) {
            reject(new Error('No se pudo preparar la imagen'));
            return;
          }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('No se pudo comprimir la imagen'));
              return;
            }
            const compressedReader = new FileReader();
            compressedReader.onload = () => resolve(compressedReader.result as string);
            compressedReader.onerror = () => reject(new Error('No se pudo convertir la imagen'));
            compressedReader.readAsDataURL(blob);
          }, 'image/webp', 0.8);
        };
        image.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  private showToastSuccess() {
    this.showToast.set(true);
    this.toastHiding.set(false);
    setTimeout(() => {
      this.toastHiding.set(true);
      setTimeout(() => this.showToast.set(false), 300);
    }, 2000);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
