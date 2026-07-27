import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  styles: [':host{display:contents}'],
  template: `
    <div class="skeleton" style="margin-bottom:18px">
      <div class="sk-line w40"></div>
      <div class="sk-line tall"></div>
      <div class="sk-line"></div>
      <div class="sk-line w70"></div>
    </div>
    <div class="card-grid">
      <div class="skeleton">
        <div class="sk-line w40"></div>
        <div class="sk-line tall"></div>
        <div class="sk-line w70"></div>
      </div>
      <div class="skeleton">
        <div class="sk-line w40"></div>
        <div class="sk-line tall"></div>
        <div class="sk-line w70"></div>
      </div>
    </div>
  `,
})
export class LoadingStateComponent {}
