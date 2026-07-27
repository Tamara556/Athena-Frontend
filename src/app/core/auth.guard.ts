import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Session } from './session';

/**
 * Protects in-app pages: only a signed-in user may enter, otherwise we send them
 * to the login page. Use on /onboarding, /roadmap, /dashboard, etc.
 */
export const authGuard: CanActivateFn = () => {
  const session = inject(Session);
  const router = inject(Router);
  return session.isLoggedIn() ? true : router.parseUrl('/login');
};

/**
 * For login/register: a user who is already signed in is bounced to the roadmap
 * instead of seeing the auth pages again.
 */
export const guestGuard: CanActivateFn = () => {
  const session = inject(Session);
  const router = inject(Router);
  return session.isLoggedIn() ? router.parseUrl('/roadmap') : true;
};
