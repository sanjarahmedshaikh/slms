import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Admin Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <span class="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
            Real-Time Analytics
          </span>
          <h1 class="text-2xl font-extrabold text-white mt-2">Executive Admin Dashboard</h1>
          <p class="text-xs text-slate-400">Live stats, inventory totals, active borrowings, fine collection, student hold queues, and system audit logs.</p>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="loadDashboard()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl border border-slate-700 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Refresh Analytics
          </button>
        </div>
      </div>

      <!-- KPI Grid Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div class="text-xs font-medium text-slate-400">Total Book Titles</div>
          <div class="text-2xl font-extrabold text-white mt-2">{{ kpis.totalBooks }}</div>
          <div class="text-[11px] font-semibold text-cyan-400 mt-1">Total Copies: {{ kpis.totalCopies }}</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div class="text-xs font-medium text-slate-400">Currently Issued Copies</div>
          <div class="text-2xl font-extrabold text-white mt-2">{{ kpis.issuedBooks }}</div>
          <div class="text-[11px] font-semibold text-indigo-400 mt-1">Available: {{ kpis.availableCopies }}</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div class="text-xs font-medium text-slate-400">Active Registered Members</div>
          <div class="text-2xl font-extrabold text-white mt-2">{{ kpis.totalUsers }}</div>
          <div class="text-[11px] font-semibold text-emerald-400 mt-1">Holds Queue: {{ kpis.pendingReservations }} Holds</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div class="text-xs font-medium text-slate-400">Fines Collected</div>
          <div class="text-2xl font-extrabold text-white mt-2">₹ {{ kpis.totalFineCollected?.toFixed(2) }}</div>
          <div class="text-[11px] font-semibold text-amber-400 mt-1">Outstanding: ₹ {{ kpis.totalFineOutstanding?.toFixed(2) }}</div>
        </div>
      </div>

      <!-- Active Hold Reservations Widget -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-sm text-white">Active Student Hold Queues</h3>
            <p class="text-[11px] text-slate-400">Recent student book reservation hold requests in priority queue</p>
          </div>
          <span class="text-xs font-bold text-amber-400 font-mono">{{ activeHoldQueue.length }} Queue Records</span>
        </div>

        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th class="p-3.5">Queue Pos</th>
                <th class="p-3.5">Book Reserved</th>
                <th class="p-3.5">Member Name & ID</th>
                <th class="p-3.5">Reserved Date</th>
                <th class="p-3.5">Queue Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr *ngIf="activeHoldQueue.length === 0">
                <td colspan="5" class="p-6 text-center text-slate-400">No active student hold reservations in queue.</td>
              </tr>
              <tr *ngFor="let h of activeHoldQueue" class="hover:bg-slate-800/30 transition-colors">
                <td class="p-3.5 font-bold text-amber-400 font-mono">#{{ h.queuePosition }}</td>
                <td class="p-3.5 font-semibold text-white">
                  <div>{{ h.book?.title }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">ISBN: {{ h.book?.isbn }}</div>
                </td>
                <td class="p-3.5">
                  <div class="font-semibold text-slate-200">{{ h.user?.fullName }}</div>
                  <div class="text-[10px] text-cyan-400 font-mono">{{ h.user?.memberId }}</div>
                </td>
                <td class="p-3.5 text-slate-400">{{ h.createdAt | date:'shortDate' }}</td>
                <td class="p-3.5">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    [ngClass]="h.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'"
                  >
                    {{ h.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Category Distribution Chart -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:col-span-1 space-y-4">
          <h3 class="font-bold text-sm text-white">Book Inventory by Category</h3>
          <apx-chart
            *ngIf="pieSeries.length > 0"
            [series]="pieSeries"
            [chart]="pieChart"
            [labels]="pieLabels"
            [legend]="legend"
            [colors]="pieColors"
            [dataLabels]="dataLabels"
            [plotOptions]="plotOptions"
            [stroke]="stroke"
          ></apx-chart>
          <div *ngIf="pieSeries.length === 0" class="text-center py-12 text-xs text-slate-400">
            No category distribution data yet.
          </div>
        </div>

        <!-- Borrowing & Return Trends Chart -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:col-span-2 space-y-4">
          <h3 class="font-bold text-sm text-white">Monthly Loan vs Return Analytics</h3>
          <apx-chart
            [series]="barSeries"
            [chart]="barChart"
            [xaxis]="barXaxis"
            [colors]="barColors"
          ></apx-chart>
        </div>
      </div>

      <!-- Recent Audit Logs Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 class="font-bold text-sm text-white">Recent System Audit Stream</h3>
          <span class="text-xs text-slate-400">Live Database Events</span>
        </div>

        <div class="divide-y divide-slate-800/60">
          <div *ngIf="auditLogs.length === 0" class="p-8 text-center text-xs text-slate-400">
            No audit activity logged yet.
          </div>
          <div *ngFor="let log of auditLogs" class="p-4 flex items-center justify-between text-xs hover:bg-slate-800/30 transition-colors">
            <div class="flex items-center gap-3">
              <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400">{{ log.module }}</span>
              <div>
                <span class="font-semibold text-slate-200">{{ log.action }}</span>
                <span class="text-slate-400 ml-2">— {{ log.details | json }}</span>
              </div>
            </div>
            <div class="text-slate-500 font-mono text-[10px]">{{ log.createdAt | date:'shortTime' }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  kpis: any = {
    totalBooks: 0,
    totalCopies: 0,
    availableCopies: 0,
    issuedBooks: 0,
    totalUsers: 0,
    pendingReservations: 0,
    totalFineCollected: 0,
    totalFineOutstanding: 0
  };

  pieSeries: number[] = [];
  pieLabels: string[] = [];
  pieColors = ['#0284c7', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];
  pieChart = { type: 'donut' as const, height: 290 };
  dataLabels = {
    enabled: true,
    style: {
      fontSize: '11px',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '700',
      colors: ['#ffffff']
    },
    dropShadow: {
      enabled: false
    }
  };
  plotOptions = {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          total: {
            show: true,
            showAlways: true,
            label: 'Total Books',
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif',
            color: '#94a3b8',
            formatter: (w: any) => {
              return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
            }
          },
          value: {
            show: true,
            fontSize: '20px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '800',
            color: '#f8fafc'
          }
        }
      }
    }
  };
  stroke = {
    show: true,
    width: 2,
    colors: ['#0f172a']
  };
  legend = {
    position: 'bottom' as const,
    fontSize: '12px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500',
    labels: { colors: '#e2e8f0' },
    markers: { width: 10, height: 10, radius: 10 }
  };

  barSeries = [
    { name: 'Books Issued', data: [0, 0, 0, 0, 0, 0] },
    { name: 'Books Returned', data: [0, 0, 0, 0, 0, 0] }
  ];
  barChart = { type: 'bar' as const, height: 260 };
  barXaxis = { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], labels: { style: { colors: '#94a3b8' } } };
  barColors = ['#0284c7', '#10b981'];

  auditLogs: any[] = [];
  activeHoldQueue: any[] = [];

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.api.getDashboardStats().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.kpis = res.data.kpis;
          this.auditLogs = res.data.recentActivities || [];
          this.activeHoldQueue = res.data.activeHoldQueue || [];

          if (res.data.categoryStats && res.data.categoryStats.length > 0) {
            this.pieSeries = res.data.categoryStats.map((c: any) => c.count);
            this.pieLabels = res.data.categoryStats.map((c: any) => c.name);
          }
        }
      },
      error: () => {}
    });

    this.api.getTransactions().subscribe({
      next: (tRes: any) => {
        if (tRes.success && Array.isArray(tRes.data)) {
          const issuesByMonth = [0, 0, 0, 0, 0, 0];
          const returnsByMonth = [0, 0, 0, 0, 0, 0];
          tRes.data.forEach((t: any) => {
            if (t.issueDate) {
              const monthIdx = new Date(t.issueDate).getMonth();
              if (monthIdx >= 0 && monthIdx < 6) issuesByMonth[monthIdx]++;
            }
            if (t.returnDate) {
              const monthIdx = new Date(t.returnDate).getMonth();
              if (monthIdx >= 0 && monthIdx < 6) returnsByMonth[monthIdx]++;
            }
          });
          this.barSeries = [
            { name: 'Books Issued', data: issuesByMonth },
            { name: 'Books Returned', data: returnsByMonth }
          ];
        }
      },
      error: () => {}
    });
  }
}
