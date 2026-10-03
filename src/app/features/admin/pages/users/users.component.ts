import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminNavbarComponent } from '../../components/admin-navbar.component';
import { User } from '../../../../models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [AdminNavbarComponent, FormsModule, DatePipe],
  template: `
    <div class="app-container">
      <app-admin-navbar></app-admin-navbar>

      <main class="main-content fade-in-up admin-main">
        <div class="admin-users-header">
          <div>
            <h1 class="title mb-1">Gestión de Usuarios</h1>
            <p class="subtitle mb-0">Administra pasajeros, conductores y administradores</p>
          </div>
          <button (click)="toggleAddModal()" class="btn btn-primary" style="width: auto;">
            <i class="fa-solid fa-user-plus"></i> Crear Nuevo Usuario
          </button>
        </div>

        @if (message) {
          <div class="alert alert-success fade-in-up mb-4">
            <i class="fa-solid fa-circle-check"></i> {{ message }}
          </div>
        }
        @if (error) {
          <div class="alert alert-error fade-in-up mb-4">
            <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
          </div>
        }

        <!-- Filter Controls -->
        <div class="glass-panel admin-users-filter mb-4" style="padding: 1rem 1.5rem;">
          <div class="admin-users-filter-row">
            <div class="form-group mb-0" style="flex: 1; min-width: 240px;">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input class="form-control" [(ngModel)]="searchTerm" placeholder="Buscar por nombre o correo..." />
            </div>
            <div class="form-group mb-0" style="width: 200px;">
              <i class="fa-solid fa-filter"></i>
              <select class="form-control" [(ngModel)]="selectedRole">
                <option value="">Todos los roles</option>
                <option value="pasajero">Pasajeros</option>
                <option value="conductor">Conductores</option>
                <option value="admin">Administradores</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="glass-panel admin-users-table" style="padding: 0; overflow-x: auto;">
          @if (loading) {
            <div class="text-center py-5">
              <i class="fa-solid fa-spinner fa-spin fa-3x" style="color: var(--primary);"></i>
              <p class="mt-3 text-muted">Cargando usuarios...</p>
            </div>
          } @else {
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid var(--glass-border); background: rgba(255, 255, 255, 0.06);">
                  <th style="padding: 1rem; color: #FFFFFF;">Nombre</th>
                  <th style="padding: 1rem; color: #FFFFFF;">Email</th>
                  <th style="padding: 1rem; color: #FFFFFF;">Teléfono</th>
                  <th style="padding: 1rem; color: #FFFFFF;">Rol Actual</th>
                  <th style="padding: 1rem; color: #FFFFFF;">Cambiar Rol</th>
                  <th style="padding: 1rem; color: #FFFFFF;">Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                @for (u of filteredUsers; track u.id) {
                  <tr style="border-bottom: 1px solid var(--glass-border); transition: background 0.2s;" onmouseenter="this.style.background='rgba(255,255,255,0.05)'" onmouseleave="this.style.background='transparent'">
                    <td style="padding: 1rem; font-weight: 600; color: #FFFFFF;">{{ u.nombre }}</td>
                    <td style="padding: 1rem; color: var(--text-muted);">{{ u.email }}</td>
                    <td style="padding: 1rem; color: var(--text-main);">{{ u.telefono }}</td>
                    <td style="padding: 1rem;">
                      <span class="badge" [class.badge-pending]="u.rol === 'pasajero'" [class.badge-accepted]="u.rol === 'conductor'" [class.badge-completed]="u.rol === 'admin'">
                        {{ u.rol }}
                      </span>
                    </td>
                    <td style="padding: 1rem;">
                      <select class="form-control" style="padding: 0.35rem 0.75rem; font-size: 0.85rem; width: 140px;" [ngModel]="u.rol" (ngModelChange)="onRoleChange(u, $event)">
                        <option value="pasajero">pasajero</option>
                        <option value="conductor">conductor</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-muted);">
                      {{ u.createdAt | date:'short' }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                      No se encontraron usuarios coincidentes.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        <!-- Add User Modal / Form Overlay -->
        @if (showAddModal) {
          <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000;">
            <div class="glass-panel fade-in-up" style="max-width: 480px; width: 90%; background: #1A1730; border: 1px solid var(--glass-border); border-radius: 1.25rem; padding: 2rem; box-shadow: 0 25px 80px rgba(0,0,0,0.6);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #FFFFFF; margin: 0;">Registrar Nuevo Usuario</h3>
                <button (click)="toggleAddModal()" style="background: rgba(255,255,255,0.08); border: 1px solid var(--glass-border); border-radius: 50%; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; font-size: 1.25rem; cursor: pointer; color: var(--text-muted);">&times;</button>
              </div>

              <form (ngSubmit)="submitNewUser()">
                <div class="form-group mb-2">
                  <i class="fa-solid fa-user"></i>
                  <input class="form-control" [(ngModel)]="newUser.nombre" name="nombre" placeholder="Nombre completo" required />
                </div>

                <div class="form-group mb-2">
                  <i class="fa-solid fa-envelope"></i>
                  <input class="form-control" [(ngModel)]="newUser.email" name="email" type="email" placeholder="Correo electrónico" required />
                </div>

                <div class="form-group mb-2">
                  <i class="fa-solid fa-phone"></i>
                  <input class="form-control" [(ngModel)]="newUser.telefono" name="telefono" placeholder="Teléfono" required />
                </div>

                <div class="form-group mb-2">
                  <i class="fa-solid fa-lock"></i>
                  <input class="form-control" [(ngModel)]="newUser.password" name="password" type="password" placeholder="Contraseña (mín 8 caracteres)" required />
                </div>

                <div class="form-group mb-3">
                  <i class="fa-solid fa-user-shield"></i>
                  <select class="form-control" [(ngModel)]="newUser.rol" name="rol" required>
                    <option value="pasajero">Pasajero</option>
                    <option value="conductor">Conductor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div style="display: flex; gap: 1rem;">
                  <button type="button" (click)="toggleAddModal()" class="btn btn-outline" style="width: auto;">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Guardar Usuario</button>
                </div>
              </form>
            </div>
          </div>
        }
      </main>
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);

  users: User[] = [];
  loading = true;
  error = '';
  message = '';

  searchTerm = '';
  selectedRole = '';

  showAddModal = false;
  newUser: Partial<User> & { password?: string } = {
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    rol: 'pasajero' as any,
  };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar los usuarios';
        this.loading = false;
      },
    });
  }

  get filteredUsers(): User[] {
    return this.users.filter((u) => {
      const matchesSearch =
        u.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.selectedRole ? u.rol === this.selectedRole : true;
      return matchesSearch && matchesRole;
    });
  }

  onRoleChange(user: User, newRole: string) {
    if (user.rol === newRole) return;
    this.adminService.changeUserRole(user.id, newRole).subscribe({
      next: (updated) => {
        user.rol = updated.rol;
        this.message = `Rol de ${user.nombre} actualizado a '${newRole}' correctamente.`;
        setTimeout(() => (this.message = ''), 4000);
      },
      error: () => {
        this.error = 'No se pudo actualizar el rol del usuario.';
        setTimeout(() => (this.error = ''), 4000);
      },
    });
  }

  toggleAddModal() {
    this.showAddModal = !this.showAddModal;
    if (!this.showAddModal) {
      this.newUser = { nombre: '', email: '', telefono: '', password: '', rol: 'pasajero' as any };
    }
  }

  submitNewUser() {
    if (!this.newUser.nombre || !this.newUser.email || !this.newUser.password) return;
    this.adminService.createUser(this.newUser).subscribe({
      next: (created) => {
        this.message = `Usuario ${created.nombre} registrado con éxito.`;
        this.toggleAddModal();
        this.loadUsers();
        setTimeout(() => (this.message = ''), 4000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al registrar el usuario.';
        setTimeout(() => (this.error = ''), 4000);
      },
    });
  }
}
