import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Top Title & Quick Actions -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white tracking-tight">Student Reservation Holds & Priority Queue</h1>
          <p class="text-xs text-slate-400 mt-1">Monitor live hold queues, priority rankings, and fulfilled student reservations.</p>
        </div>

        <button (click)="loadReservations()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors">
          <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Refresh Live Queue
        </button>
      </div>

      <!-- Quick Metrics Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-base border border-cyan-500/20">
            {{ reservations.length }}
          </div>
          <div>
            <div class="text-xs text-slate-400 font-medium">Total Queues</div>
            <div class="text-base font-bold text-white">All Reservations</div>
          </div>
        </div>

        <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-base border border-amber-500/20">
            {{ getCountByStatus('pending') }}
          </div>
          <div>
            <div class="text-xs text-slate-400 font-medium">Active Waiting</div>
            <div class="text-base font-bold text-amber-400">Pending Holds</div>
          </div>
        </div>

        <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-base border border-emerald-500/20">
            {{ getCountByStatus('fulfilled') }}
          </div>
          <div>
            <div class="text-xs text-slate-400 font-medium">Issued Loans</div>
            <div class="text-base font-bold text-emerald-400">Fulfilled Holds</div>
          </div>
        </div>
      </div>

      <!-- Alert Notification -->
      <div *ngIf="message" class="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 text-xs font-semibold animate-in fade-in">
        {{ message }}
      </div>

      <!-- Filter Tabs -->
      <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          *ngFor="let tab of tabs"
          (click)="activeTab = tab.id"
          [class]="'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ' + (activeTab === tab.id ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800')"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Data Table Card -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th class="p-4">Queue Pos</th>
                <th class="p-4">Book Title & ISBN</th>
                <th class="p-4">Student Name & ID</th>
                <th class="p-4">Department & Role</th>
                <th class="p-4">Reserved Date</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr *ngIf="loading">
                <td colspan="7" class="p-8 text-center text-slate-400">Fetching live reservation queues...</td>
              </tr>
              <tr *ngIf="!loading && filteredReservations.length === 0">
                <td colspan="7" class="p-8 text-center text-slate-400">No student reservations found in this queue view.</td>
              </tr>
              <tr *ngFor="let r of filteredReservations" class="hover:bg-slate-800/30 transition-colors">
                <td class="p-4 font-bold text-amber-400 font-mono text-sm">
                  <span *ngIf="r.queuePosition">#{{ r.queuePosition }}</span>
                  <span *ngIf="!r.queuePosition" class="text-slate-500">-</span>
                </td>
                <td class="p-4 font-semibold text-white">
                  <div>{{ r.book?.title || 'Catalog Book' }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">ISBN: {{ r.book?.isbn || 'N/A' }}</div>
                </td>
                <td class="p-4">
                  <div class="font-semibold text-slate-200">{{ r.user?.fullName || 'Student Member' }}</div>
                  <div class="text-[10px] text-cyan-400 font-mono">{{ r.user?.memberId || 'MEM-ID' }} • {{ r.user?.email || 'email@slms.com' }}</div>
                </td>
                <td class="p-4">
                  <div>{{ r.user?.department || 'General' }}</div>
                  <div class="text-[10px] text-slate-400 uppercase font-semibold">{{ r.user?.role || 'Student' }}</div>
                </td>
                <td class="p-4 text-slate-400">{{ r.createdAt | date:'short' }}</td>
                <td class="p-4">
                  <span
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                    [ngClass]="{
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30': r.status === 'pending',
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30': r.status === 'fulfilled',
                      'bg-rose-500/20 text-rose-400 border border-rose-500/30': r.status === 'cancelled'
                    }"
                  >
                    {{ r.status }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button *ngIf="r.status === 'pending'" (click)="cancel(r._id)" class="text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors">
                    Cancel Hold
                  </button>
                  <span *ngIf="r.status !== 'pending'" class="text-slate-500 text-[11px]">Completed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ReservationsComponent implements OnInit {
  reservations: any[] = [];
  loading = true;
  message = '';
  activeTab = 'all';

  tabs = [
    { id: 'all', label: 'All Hold Queues' },
    { id: 'pending', label: 'Active Pending Holds' },
    { id: 'fulfilled', label: 'Fulfilled Loans' },
    { id: 'cancelled', label: 'Cancelled Holds' }
  ];

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.loadReservations();
  }

  get filteredReservations(): any[] {
    if (this.activeTab === 'all') return this.reservations;
    return this.reservations.filter((r) => r.status === this.activeTab);
  }

  getCountByStatus(status: string): number {
    return this.reservations.filter((r) => r.status === status).length;
  }

  loadReservations() {
    this.loading = true;
    this.api.getAllReservations().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.reservations = Array.isArray(res.data) ? res.data : (res.data?.reservations || []);
        }
        this.loading = false;
      },
      error: () => {
        this.reservations = [];
        this.loading = false;
      }
    });
  }

  cancel(id: string) {
    if (!confirm('Cancel this student hold reservation?')) return;
    this.api.cancelReservation(id).subscribe({
      next: () => {
        this.message = 'Reservation cancelled.';
        this.loadReservations();
        setTimeout(() => (this.message = ''), 4000);
      }
    });
  }
}
