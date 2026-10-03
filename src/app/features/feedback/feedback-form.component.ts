import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../../core/services/feedback.service';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="feedback-form">
      <div class="feedback-heading">
        <h3 class="font-bold mb-2">Opiniones y ayuda</h3>
        <p class="text-muted mb-3">Elige una opción para continuar.</p>
      </div>

      <div class="feedback-options">
        @if (tripId && !reviewOnly) {
          <button type="button" class="feedback-option feedback-option-review" (click)="toggleReviewForm()">
            <i class="fa-solid fa-star"></i>
            <span>Dejar una reseña</span>
            <i class="fa-solid" [class.fa-chevron-down]="!showReviewForm" [class.fa-chevron-up]="showReviewForm"></i>
          </button>
        }
        @if (!reviewOnly) {
          <button type="button" class="feedback-option feedback-option-complaint" (click)="toggleComplaintForm()">
          <i class="fa-solid fa-flag"></i>
          <span>Enviar una queja o denuncia</span>
          <i class="fa-solid" [class.fa-chevron-down]="!showComplaintForm" [class.fa-chevron-up]="showComplaintForm"></i>
          </button>
        }
      </div>

      @if ((reviewOnly || showReviewForm) && tripId) {
        <div class="feedback-block">
          <h4 class="font-bold mb-2">Calificar este viaje</h4>
          <p class="text-muted feedback-help">La reseña será publicada después de la aprobación del administrador.</p>
          <div class="feedback-stars">
            @for (star of [1, 2, 3, 4, 5]; track star) {
              <button type="button" [class.selected]="rating >= star" (click)="rating = star" [attr.aria-label]="'Calificar con ' + star + ' estrellas'">★</button>
            }
          </div>
          <textarea class="form-control feedback-textarea" [(ngModel)]="reviewComment" placeholder="Escribe un comentario (opcional)"></textarea>
          <button class="btn btn-primary feedback-button" (click)="submitReview()" [disabled]="rating === 0 || sending">
            Enviar reseña
          </button>
        </div>
      }

      @if (showComplaintForm) {
        <div class="feedback-block">
          <h4 class="font-bold mb-2">Enviar una queja o denuncia</h4>
          <p class="text-muted feedback-help">Esta información solo será visible para el administrador.</p>
          <input class="form-control feedback-control" [(ngModel)]="reason" placeholder="Motivo">
          <textarea class="form-control feedback-textarea" [(ngModel)]="description" placeholder="Describe lo ocurrido"></textarea>
          <button class="btn btn-primary feedback-button" (click)="submitComplaint()" [disabled]="!reason || !description || sending">
            Enviar denuncia
          </button>
        </div>
      }
      
      @if (message) { <div class="alert alert-success mt-3 mb-0">{{ message }}</div> }
      @if (error) { <div class="alert alert-error mt-3 mb-0">{{ error }}</div> }
    </div>
  `,
  styles: [`
    .feedback-form { width: 100%; max-width: 620px; margin: 1.5rem auto 0; padding: 1.25rem; border: 1px solid var(--glass-border); border-radius: 14px; background: rgba(255, 255, 255, 0.04); color: var(--text-main); }
    .feedback-heading { text-align: center; }
    .feedback-options { display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; }
    .feedback-option { display: inline-flex; align-items: center; justify-content: center; gap: 0.55rem; min-height: 48px; padding: 0.75rem 1rem; border: 1px solid var(--glass-border); border-radius: 10px; background: rgba(255, 255, 255, 0.06); color: var(--text-main); font: inherit; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; }
    .feedback-option:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2); border-color: rgba(124, 58, 237, 0.5); background: rgba(255, 255, 255, 0.1); }
    .feedback-option-review i:first-child { color: var(--warning); }
    .feedback-option-complaint i:first-child { color: var(--danger); }
    .feedback-option i:last-child { font-size: 0.75rem; color: var(--text-muted); }
    .feedback-block { border-top: 1px solid var(--glass-border); padding-top: 1rem; margin-top: 1rem; text-align: left; }
    .feedback-help { font-size: 0.875rem; margin-bottom: 0.75rem; color: var(--text-muted); }
    .feedback-stars { display: flex; justify-content: center; gap: 0.25rem; margin-bottom: 0.75rem; }
    .feedback-stars button { border: 0; background: transparent; color: #52527A; font-size: 2rem; cursor: pointer; }
    .feedback-stars button.selected { color: var(--warning); }
    .feedback-control, .feedback-textarea { margin-bottom: 0.75rem; padding-left: 1rem; }
    .feedback-textarea { min-height: 90px; }
    .feedback-button { width: 100%; }
    @media (max-width: 560px) {
      .feedback-form { padding: 1rem; margin-top: 1rem; }
      .feedback-options { flex-direction: column; align-items: stretch; }
      .feedback-option { width: 100%; }
    }
  `],
})
export class FeedbackFormComponent {
  @Input() tripId?: string;
  @Input() reviewOnly = false;
  @Output() submitted = new EventEmitter<void>();
  private feedback = inject(FeedbackService);
  rating = 0;
  reviewComment = '';
  reason = '';
  description = '';
  sending = false;
  message = '';
  error = '';
  showReviewForm = false;
  showComplaintForm = false;

  toggleReviewForm() {
    this.showReviewForm = !this.showReviewForm;
    if (this.showReviewForm) this.showComplaintForm = false;
  }

  toggleComplaintForm() {
    this.showComplaintForm = !this.showComplaintForm;
    if (this.showComplaintForm) this.showReviewForm = false;
  }

  submitReview() {
    if (!this.tripId || this.rating === 0) return;
    this.sending = true;
    this.feedback.createReview({ tripId: this.tripId, rating: this.rating, comment: this.reviewComment }).subscribe({
      next: () => {
        this.message = 'Reseña enviada. Quedará pendiente de aprobación.';
        this.sending = false;
        this.submitted.emit();
      },
      error: (err) => { this.error = err.error?.message || 'No se pudo enviar la reseña.'; this.sending = false; },
    });
  }

  submitComplaint() {
    this.sending = true;
    this.feedback.createComplaint({ tripId: this.tripId, reason: this.reason, description: this.description }).subscribe({
      next: () => { this.message = 'Denuncia enviada al administrador.'; this.reason = ''; this.description = ''; this.sending = false; },
      error: (err) => { this.error = err.error?.message || 'No se pudo enviar la denuncia.'; this.sending = false; },
    });
  }
}
