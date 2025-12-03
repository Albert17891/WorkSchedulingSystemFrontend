import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth'

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Auth);

  const expectedRole = route.data['role'];

  const userRole = authService.getUserRole();

  if (!authService.isLoggedIn()) {
   
    router.navigate(['/login']);
    return false;
  }

  if (userRole !== expectedRole) {
   
    alert('Access Denied: You do not have permission.');
    router.navigate(['/login']); 
    return false;
  }
  
  return true;
};
