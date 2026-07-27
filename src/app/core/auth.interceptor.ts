import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Session } from './session';
import { API_BASE } from './api';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(Session);
  const router = inject(Router);
  const token = session.token();
  const authed = !!token && req.url.startsWith(API_BASE);

  if (authed) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (authed && error.status === 401) {
        session.clear();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
