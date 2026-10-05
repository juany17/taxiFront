import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Trip, CreateTripRequest } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/trips`;

  createTrip(data: CreateTripRequest) {
    return this.http.post<Trip>(this.api, data);
  }

  getPending() {
    return this.http.get<Trip[]>(`${this.api}/pending`);
  }

  getTrip(id: string) {
    return this.http.get<Trip>(`${this.api}/${id}`);
  }

  acceptTrip(id: string) {
    return this.http.post<Trip>(`${this.api}/${id}/accept`, {});
  }

  completeTrip(id: string) {
    return this.http.post<Trip>(`${this.api}/${id}/complete`, {});
  }

  getMyTrips() {
    return this.http.get<Trip[]>(`${this.api}/my-trips`);
  }

  confirmPayment(id: string) {
    return this.http.post<Trip>(`${this.api}/${id}/payment/confirm`, {});
  }

  reportPaymentIssue(id: string, reason: string) {
    return this.http.post<Trip>(`${this.api}/${id}/payment/report`, { reason });
  }
}