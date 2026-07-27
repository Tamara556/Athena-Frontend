import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  styles: [':host{display:contents}'],
  template: `
    <div class="empty">
      <div class="ei">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 0-2 2V5zM20 5a2 2 0 0 0-2-2h-6v18h6a2 2 0 0 1 2 2V5z"/>
        </svg>
      </div>
      <h3>{{ title() }}</h3>
      <p>{{ message() }}</p>
      @if (showRetry()) {
        <div style="margin-top:18px">
          <button class="btn btn-primary" type="button" (click)="retry.emit()">{{ retryLabel() }}</button>
        </div>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input('No session yet');
  readonly message = input('Athena is preparing your next lesson. Finish your current step or check back in a moment.');
  readonly showRetry = input(false);
  readonly retryLabel = input('Try again');
  readonly retry = output<void>();
}
