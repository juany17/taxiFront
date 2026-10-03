import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/vehicles`;

  getVehicles() {
    return this.http.get<any[]>(this.api);
  }

  createVehicle(conductorId: string, data: any) {
    return this.http.post<any>(`${this.api}/${conductorId}`, data);
  }
}