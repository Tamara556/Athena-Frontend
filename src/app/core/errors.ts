import { HttpErrorResponse } from '@angular/common/http';
import { API_BASE } from './api';

export function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return `Cannot reach the gateway at ${API_BASE}. Is the stack running?`;
    }
    const body = err.error;
    if (body && typeof body === 'object' && 'message' in body) {
      const message = (body as { message: unknown }).message;
      if (typeof message === 'string') {
        return message;
      }
    }
    return `${err.status} ${err.statusText}`;
  }
  return 'Something went wrong';
}
