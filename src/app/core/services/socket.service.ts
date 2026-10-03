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
}
