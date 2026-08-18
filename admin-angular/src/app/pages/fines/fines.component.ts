import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-fines',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pb-12">
      <div>
        <h1 class="text-2xl font-bold text-white">Live Fine Management & Fee Auditing</h1>
        <p class="text-xs text-slate-400 mt-1">Audit overdue fine records, settle payments, and waive fees (Calculated in Rupees ₹).</p>
      </div>

      <div *ngIf="message" class="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 text-xs font-semibold">
        {{ message }}
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div class="px-6 py-4 border-b border-slate-800 font-bold text-sm text-white flex justify-between items-center">
          <span>Fine Audit Register</span>
          <button (click)="loadFines()" class="text-xs text-cyan-400 font-semibold flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Refresh Fines
          </button>
        </div>

        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th class="p-4">Fine ID</th>
                <th class="p-4">Member Name</th>
                <th class="p-4">Overdue Days</th>
                <th class="p-4">Assessed Amount</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr *ngIf="loading">
                <td colspan="6" class="p-8 text-center text-slate-400">Loading fine records...</td>
              </tr>
              <tr *ngIf="!loading && fines.length === 0">
                <td colspan="6" class="p-8 text-center text-slate-400">No overdue fine records found in database. All accounts clean!</td>
              </tr>
              <tr *ngFor="let f of fines" class="hover:bg-slate-800/30 transition-colors">
                <td class="p-4 font-mono text-cyan-400 font-bold">{{ f._id }}</td>
                <td class="p-4 font-semibold text-white">{{ f.user?.fullName }} ({{ f.user?.memberId }})</td>
                <td class="p-4">{{ f.overdueDays }} Days Late</td>
                <td class="p-4 font-bold text-white">₹ {{ f.amount?.toFixed(2) }}</td>
                <td class="p-4">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    [ngClass]="f.status === 'unpaid' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'"
                  >
                    {{ f.status }}
                  </span>
                </td>
                <td class="p-4 text-right space-x-2">
                  <button *ngIf="f.status === 'unpaid'" (click)="markPaid(f._id)" class="text-emerald-400 font-semibold hover:text-emerald-300">Mark Paid</button>
                  <button *ngIf="f.status === 'unpaid'" (click)="waiveFine(f._id)" class="text-amber-400 font-semibold hover:text-amber-300">Waive Fine</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class FinesComponent implements OnInit {
  fines: any[] = [];
  loading = true;
  message = '';

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.loadFines();
  }

  loadFines() {
    this.loading = true;
    this.api.getFines().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.fines = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.fines = [];
        this.loading = false;
      }
    });
  }

  markPaid(id: string) {
    this.api.updateFine(id, 'paid').subscribe({
      next: () => {
        this.message = 'Fine marked as PAID.';
        this.loadFines();
        setTimeout(() => (this.message = ''), 4000);
      }
    });
  }

  waiveFine(id: string) {
    this.api.updateFine(id, 'waived').subscribe({
      next: () => {
        this.message = 'Fine WAIVED successfully.';
        this.loadFines();
        setTimeout(() => (this.message = ''), 4000);
      }
    });
  }
}
