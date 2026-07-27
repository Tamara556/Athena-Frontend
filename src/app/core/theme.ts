import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'pink';

const STORAGE_KEY = 'athena_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(readInitial());

  constructor() {
    effect(() => {
      const theme = this.theme();
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);
    });
  }

  set(theme: Theme): void {
    this.theme.set(theme);
  }
}

function readInitial(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'dark' || stored === 'pink' ? stored : 'light';
}
