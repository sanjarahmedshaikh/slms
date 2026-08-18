import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('slms_token');
  const userStr = localStorage.getItem('slms_user');

  if (!token || token.trim().length < 10) {
    router.navigate(['/login']);
    return false;
  }

  // Client-side JWT expiration check
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('slms_token');
      localStorage.removeItem('slms_user');
      router.navigate(['/login']);
      return false;
    }
  } catch (e) {
    localStorage.removeItem('slms_token');
    localStorage.removeItem('slms_user');
    router.navigate(['/login']);
    return false;
  }

  // RBAC Role Verification: Only Super Admin, Admin & Librarian allowed in Admin Console
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const userRole = user.role || '';
      if (userRole === 'super_admin' || userRole === 'admin' || userRole === 'librarian' || userRole.includes('admin')) {
        return true;
      }
    } catch (e) {}
  }

  // If student or unauthorized role, redirect to Angular admin login
  router.navigate(['/login']);
  return false;
};
