import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, Vehicle, Trip } from '../../models';

export interface AdminStats {
  users: {
    total: number;
    passengers: number;
    drivers: number;
    admins: number;
  };
  vehicles: {
    total: number;
  };
  trips: {
    total: number;
    pending: number;
    accepted: number;
    completed: number;
  };
  financial: {
    totalRevenue: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/admin`;

  getStats() {
    return this.http.get<AdminStats>(`${this.api}/stats`);
  }

  getUsers() {
    return this.http.get<User[]>(`${this.api}/users`);
  }

  changeUserRole(userId: string, rol: string) {
    return this.http.patch<User>(`${this.api}/users/${userId}/role`, { rol });
  }

  createUser(userData: Partial<User> & { password?: string }) {
    return this.http.post<User>(`${this.api}/users`, userData);
  }

  getVehicles() {
    return this.http.get<Vehicle[]>(`${this.api}/vehicles`);
  }

  getTrips() {
    return this.http.get<Trip[]>(`${this.api}/trips`);
  }
}
