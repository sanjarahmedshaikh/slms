import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <!-- Glow Backgrounds -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/30">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight">SLMS Admin Console</h1>
          <p class="text-xs text-slate-400">Sign in with administrative credentials to access management console</p>
        </div>

        <div *ngIf="errorMessage" class="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-semibold">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onLogin()" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-300 block mb-1">Admin Email Address</label>
            <div class="relative">
              <input
                type="text"
                required
                [(ngModel)]="email"
                name="email"
                placeholder="admin&#64;company.com"
                class="w-full px-4 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-300 block mb-1">Password</label>
            <div class="relative">
              <input
                type="password"
                required
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loading"
            class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            {{ loading ? 'Authenticating...' : 'Sign In to Admin Console' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private api: AdminApiService, private router: Router) {}

  onLogin() {
    this.errorMessage = '';
    let cleanEmail = (this.email || '').trim().toLowerCase();
    const cleanPassword = (this.password || '').trim();

    if (cleanEmail === 'admin') cleanEmail = 'admin@slms.com';
    if (cleanEmail === 'librarian') cleanEmail = 'librarian@slms.com';

    if (!cleanEmail || !cleanPassword) {
      this.errorMessage = 'Please enter both Admin Email and Password.';
      return;
    }

    this.loading = true;
    this.api.login(cleanEmail, cleanPassword).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success && res.data?.token) {
          const userRole = res.data.user?.role;
          if (userRole !== 'super_admin' && userRole !== 'admin' && userRole !== 'librarian' && !userRole.includes('admin')) {
            this.errorMessage = 'Access denied. Only Librarians and Admins can access this console.';
            return;
          }
          localStorage.setItem('slms_token', res.data.token);
          localStorage.setItem('slms_user', JSON.stringify(res.data.user));
          this.router.navigate(['/']);
        } else {
          this.errorMessage = res.message || 'Invalid email or password.';
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to backend server. Please ensure backend is running on http://localhost:5000.';
        } else {
          this.errorMessage = err.error?.message || 'Invalid email or password.';
        }
      }
    });
  }
}
