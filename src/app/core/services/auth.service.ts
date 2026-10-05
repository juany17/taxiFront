import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse, User, LoginResponse } from '../../models';

export type ProfileUpdate = Partial<Pick<User, 'fotoPerfil' | 'mercadoPagoAlias' | 'descripcion' | 'anosExperiencia' | 'edad' | 'idiomas' | 'pasatiempos' | 'frasePersonal' | 'musicaPreferida' | 'aceptaMascotas' | 'tieneCascoExtra' | 'estiloConduccion' | 'ofreceChucherias' | 'horariosTrabajo' | 'zonasPreferencia' | 'accesoriosVehiculo' | 'redesSociales'>>;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  currentUser = signal<User | null>(null);
  token = signal<string | null>(localStorage.getItem('token'));

  constructor() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  register(data: Partial<User> & { password: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data);
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password });
  }

  getMe(token: string) {
    localStorage.setItem('token', token);
    this.token.set(token);
    return this.http.get<User>(`${environment.apiUrl}/auth/me`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }

  saveAuth(response: AuthResponse) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.token.set(response.token);
    this.currentUser.set(response.user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  getRole(): string | null {
    return this.currentUser()?.rol ?? null;
  }

  updateProfile(data: ProfileUpdate) {
    return this.http.patch<User>(`${environment.apiUrl}/auth/profile`, data, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token()}` }),
    });
  }

  getPaymentAlias() {
    return this.http.get<{ mercadoPagoAlias: string | null }>(`${environment.apiUrl}/auth/payment-alias`);
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, { token, newPassword });
  }
}
