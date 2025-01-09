import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (childRoute, state) => {
  return true;
};
