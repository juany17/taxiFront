import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Complaint, Review } from '../../models';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  createReview(data: { tripId: string; rating: number; comment?: string }) {
    return this.http.post<Review>(`${this.api}/reviews`, data);
  }

  createComplaint(data: { tripId?: string; reason: string; description: string }) {
    return this.http.post<Complaint>(`${this.api}/complaints`, data);
  }

  getPendingReviews() {
    return this.http.get<Review[]>(`${this.api}/admin/reviews/pending`);
  }

  getApprovedReviews(userId: string) {
    return this.http.get<Review[]>(`${this.api}/reviews/user/${userId}`);
  }

  moderateReview(id: string, status: 'aprobada' | 'rechazada') {
    return this.http.patch<Review>(`${this.api}/admin/reviews/${id}`, { status });
  }

  getComplaints(status?: Complaint['status']) {
    const suffix = status ? `?status=${status}` : '';
    return this.http.get<Complaint[]>(`${this.api}/admin/complaints${suffix}`);
  }

  moderateComplaint(id: string, status: 'revisada' | 'descartada') {
    return this.http.patch<Complaint>(`${this.api}/admin/complaints/${id}`, { status });
  }
}
