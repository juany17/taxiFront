import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Trip } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    // El gateway exige un JWT en el handshake: sin token, desconecta.
    this.socket = io(environment.apiUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      auth: { token: localStorage.getItem('token') },
    });
  }

  /** Reconecta con un token nuevo, util tras login o refresh. */
  refreshAuthToken(token: string | null) {
    this.socket.auth = { token };
    if (token) {
      this.socket.connect();
    }
  }

  joinTripRoom(tripId: string) {
    this.socket.emit('joinTrip', { tripId });
  }

  emitPassengerLocation(tripId: string, position: { lat: number; lng: number }) {
    this.socket.emit('passengerLocationUpdated', {
      tripId,
      lat: position.lat,
      lng: position.lng,
    });
  }

  onTripStatusChanged(): Observable<Trip> {
    return new Observable((observer) => {
      this.socket.on('tripStatusChanged', (data: Trip) => {
        observer.next(data);
      });
    });
  }

  onNewTripAvailable(): Observable<Trip> {
    return new Observable((observer) => {
      this.socket.on('newTripAvailable', (data: Trip) => {
        observer.next(data);
      });
    });
  }

  onTripUpdated(): Observable<Trip> {
    return new Observable((observer) => {
      this.socket.on('tripUpdated', (data: Trip) => {
        observer.next(data);
      });
    });
  }

  onTripPaymentChanged(): Observable<Pick<Trip, 'id' | 'payment_status' | 'payment_issue'>> {
    return new Observable((observer) => {
      this.socket.on('tripPaymentChanged', (data: { tripId: string; payment_status: Trip['payment_status']; payment_issue: string | null }) => {
        observer.next({
          id: data.tripId,
          payment_status: data.payment_status,
          payment_issue: data.payment_issue,
        });
      });
    });
  }

  onPassengerLocationUpdated(): Observable<{ tripId: string; lat: number; lng: number; passengerId: string; updatedAt: string }> {
    return new Observable((observer) => {
      this.socket.on('passengerLocationUpdated', (data: { tripId: string; lat: number; lng: number; passengerId: string; updatedAt: string }) => {
        observer.next(data);
      });
    });
  }
}
