import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative">
      <!-- Admin Top Navbar (Hidden on Login page) -->
      <header *ngIf="isLoggedIn()" class="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Hamburger Button -->
          <button (click)="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors" aria-label="Toggle Mobile Navigation">
            <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>

          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/20 shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <div>
            <span class="font-extrabold text-base text-white tracking-tight">SLMS Admin Console</span>
            <span class="hidden sm:inline-block ml-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Angular 18</span>
          </div>
        </div>

        <div class="flex items-center gap-3 text-xs">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-cyan-500/30">
              AD
            </div>
            <span class="text-slate-300 font-semibold hidden sm:inline">{{ getAdminName() }}</span>
          </div>

          <button (click)="logout()" class="hidden sm:inline-block px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700 transition-all font-semibold cursor-pointer">
            Sign Out
          </button>
        </div>
      </header>

      <!-- Top-Level Mobile Slide-Over Navigation Drawer (Floating over ALL content) -->
      <div *ngIf="isLoggedIn() && isMobileMenuOpen" class="fixed inset-0 z-[99999] md:hidden flex">
        <div (click)="isMobileMenuOpen = false" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999]"></div>

        <div class="relative w-4/5 max-w-xs bg-slate-900 h-full shadow-2xl border-r border-slate-800 p-5 flex flex-col justify-between z-[100000] overflow-y-auto">
          <div class="space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold">SL</div>
                <span class="font-extrabold text-sm text-white">Admin Navigation</span>
              </div>
              <button (click)="isMobileMenuOpen = false" class="p-1 rounded-lg text-slate-400 hover:bg-slate-800">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <nav class="space-y-1">
              <a (click)="isMobileMenuOpen = false" routerLink="/" routerLinkActive="bg-cyan-600 text-white font-bold" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all">
                <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                Executive Dashboard
              </a>
              <a (click)="isMobileMenuOpen = false" routerLink="/books" routerLinkActive="bg-cyan-600 text-white font-bold" class="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all">
                <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                Book Inventory CRUD
              </a>
              <a (click)="isMobileMenuOpen = false" routerLink="/users" routerLinkActive="bg-cyan-600 text-white font-bold" class="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all">
                <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                Users & Role RBAC
              </a>
              <a (click)="isMobileMenuOpen = false" routerLink="/issue-return" routerLinkActive="bg-cyan-600 text-white font-bold" class="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all">
                <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                Issue & Return Desk
              </a>
              <a (click)="isMobileMenuOpen = false" routerLink="/reservations" routerLinkActive="bg-cyan-600 text-white font-bold" class="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all">
                <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                Student Hold Queues
              </a>
              <a (click)="isMobileMenuOpen = false" routerLink="/fines" routerLinkActive="bg-cyan-600 text-white font-bold" class="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all">
                <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Fine Management
              </a>
              <a (click)="isMobileMenuOpen = false" routerLink="/audit-logs" routerLinkActive="bg-cyan-600 text-white font-bold" class="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all">
                <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                System Audit Logs
              </a>
            </nav>
          </div>

          <div class="pt-4 border-t border-slate-800 space-y-3">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-xs">AD</div>
              <div class="text-xs font-bold text-white">{{ getAdminName() }}</div>
            </div>

            <button (click)="logout()" class="w-full py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-semibold">
              Sign Out Admin Console
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-1 max-w-7xl w-full mx-auto relative">
        <!-- Desktop Sticky Sidebar Navigation -->
        <aside *ngIf="isLoggedIn()" class="w-64 hidden md:flex flex-col border-r border-slate-800 bg-slate-900/50 p-4 space-y-1 sticky top-[61px] h-[calc(100vh-61px)] self-start shrink-0 overflow-y-auto custom-scrollbar">
          <div class="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Management Subsystems</div>

          <a routerLink="/" routerLinkActive="bg-cyan-600 text-white font-bold" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            Executive Dashboard
          </a>
          <a routerLink="/books" routerLinkActive="bg-cyan-600 text-white font-bold" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            Book Inventory CRUD
          </a>
          <a routerLink="/users" routerLinkActive="bg-cyan-600 text-white font-bold" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            Users & Role RBAC
          </a>
          <a routerLink="/issue-return" routerLinkActive="bg-cyan-600 text-white font-bold" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            Issue & Return Desk
          </a>
          <a routerLink="/reservations" routerLinkActive="bg-cyan-600 text-white font-bold" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
            Student Hold Queues
          </a>
          <a routerLink="/fines" routerLinkActive="bg-cyan-600 text-white font-bold" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Fine Management
          </a>
          <a routerLink="/audit-logs" routerLinkActive="bg-cyan-600 text-white font-bold" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            System Audit Logs
          </a>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AppComponent {
  isMobileMenuOpen = false;

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    const token = localStorage.getItem('slms_token');
    return !!token;
  }

  getAdminName(): string {
    const userStr = localStorage.getItem('slms_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.fullName || 'Administrator';
      } catch (e) {}
    }
    return 'Administrator';
  }

  logout() {
    this.isMobileMenuOpen = false;
    localStorage.removeItem('slms_token');
    localStorage.removeItem('slms_user');
    window.location.href = '/login';
  }
}
