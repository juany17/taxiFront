import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminNavbarComponent } from '../../components/admin-navbar.component';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { Complaint, Review } from '../../../../models';

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [AdminNavbarComponent, DatePipe],
  template: `
    <div class="app-container">
      <app-admin-navbar></app-admin-navbar>
      <main class="main-content fade-in-up admin-main">
        <div class="feedback-admin-header">
          <h1 class="title mb-1">Reseñas y denuncias</h1>
          <p class="subtitle mb-0">Las reseñas se publican solo después de tu aprobación. Las denuncias son privadas.</p>
        </div>

        @if (message) { <div class="alert alert-success mb-4">{{ message }}</div> }
        @if (error) { <div class="alert alert-error mb-4">{{ error }}</div> }

        <section class="glass-panel moderation-section">
          <h2 class="section-title">Reseñas pendientes</h2>
          @for (review of reviews; track review.id) {
            <article class="moderation-card">
              <div>
                <strong>{{ review.author?.nombre || 'Usuario' }}</strong>
                <span class="text-muted"> reseña a {{ review.subject?.nombre || 'otro usuario' }}</span>
                <div class="rating">★ {{ review.rating }}/5</div>
                <p>{{ review.comment || 'Sin comentario' }}</p>
                <small class="text-muted">{{ review.createdAt | date:'short' }}</small>
              </div>
              <div class="moderation-actions">
                <button class="btn btn-success" (click)="moderateReview(review, 'aprobada')">Aprobar</button>
                <button class="btn btn-danger" (click)="moderateReview(review, 'rechazada')">Rechazar</button>
              </div>
            </article>
          } @empty {
            <p class="text-muted text-center">No hay reseñas pendientes.</p>
          }
        </section>

        <section class="glass-panel moderation-section">
          <h2 class="section-title">Denuncias privadas</h2>
          @for (complaint of complaints; track complaint.id) {
            <article class="moderation-card">
              <div>
                <strong>{{ complaint.reason }}</strong>
                <p>{{ complaint.description }}</p>
                <small class="text-muted">
                  Denunciante: {{ complaint.reporter?.nombre || 'Usuario' }}
                  @if (complaint.reportedUser) { · Denunciado: {{ complaint.reportedUser.nombre }} }
                  · {{ complaint.createdAt | date:'short' }}
                </small>
              </div>
              <div class="moderation-actions">
                <span class="badge" [class.badge-pending]="complaint.status === 'pendiente'" [class.badge-completed]="complaint.status !== 'pendiente'">{{ complaint.status }}</span>
                @if (complaint.status === 'pendiente') {
                  <button class="btn btn-success" (click)="moderateComplaint(complaint, 'revisada')">Marcar revisada</button>
                  <button class="btn btn-danger" (click)="moderateComplaint(complaint, 'descartada')">Descartar</button>
                }
              </div>
            </article>
          } @empty {
            <p class="text-muted text-center">No hay denuncias registradas.</p>
          }
        </section>
      </main>
    </div>
  `,
  styles: [`
    .feedback-admin-header, .moderation-section { width: 100%; max-width: 920px; margin: 0 auto 1.5rem; }
    .section-title { font-size: 1.35rem; margin-bottom: 1rem; color: #FFFFFF; font-weight: 700; }
    .moderation-card { display: flex; justify-content: space-between; gap: 1rem; align-items: center; padding: 1rem 0; border-top: 1px solid var(--glass-border); }
    .moderation-card strong { color: #FFFFFF; font-size: 1.05rem; }
    .moderation-card p { margin: 0.5rem 0; color: var(--text-main); }
    .rating { color: var(--warning); font-weight: 700; margin-top: 0.4rem; }
    .moderation-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end; }
    .moderation-actions .btn { width: auto; padding: 0.6rem 0.9rem; }
    @media (max-width: 700px) { .moderation-card { flex-direction: column; align-items: stretch; } .moderation-actions { justify-content: flex-start; } }
  `],
})
export class AdminFeedbackComponent implements OnInit {
  private feedback = inject(FeedbackService);
  reviews: Review[] = [];
  complaints: Complaint[] = [];
  message = '';
  error = '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.feedback.getPendingReviews().subscribe({ next: (data) => this.reviews = data, error: () => this.error = 'No se pudieron cargar las reseñas.' });
    this.feedback.getComplaints().subscribe({ next: (data) => this.complaints = data, error: () => this.error = 'No se pudieron cargar las denuncias.' });
  }

  moderateReview(review: Review, status: 'aprobada' | 'rechazada') {
    this.feedback.moderateReview(review.id, status).subscribe({
      next: () => { this.reviews = this.reviews.filter((item) => item.id !== review.id); this.message = `Reseña ${status}.`; },
      error: (err) => this.error = err.error?.message || 'No se pudo moderar la reseña.',
    });
  }

  moderateComplaint(complaint: Complaint, status: 'revisada' | 'descartada') {
    this.feedback.moderateComplaint(complaint.id, status).subscribe({
      next: () => { complaint.status = status; this.message = `Denuncia ${status}.`; },
      error: (err) => this.error = err.error?.message || 'No se pudo actualizar la denuncia.',
    });
  }
}
