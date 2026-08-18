import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pb-12">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Live System Audit & Security Trail</h1>
          <p class="text-xs text-slate-400 mt-1">Real-time security log stream tracking database events, user logins, book checkouts, and role changes.</p>
        </div>

        <button (click)="loadAuditLogs()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Refresh Audit Logs
        </button>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th class="p-4">Timestamp</th>
                <th class="p-4">Subsystem Module</th>
                <th class="p-4">Action Event</th>
                <th class="p-4">Executed By</th>
                <th class="p-4">Event Payload Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr *ngIf="loading">
                <td colspan="5" class="p-8 text-center text-slate-400">Loading live security audit logs from database...</td>
              </tr>
              <tr *ngIf="!loading && logs.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-400">No security audit logs recorded yet. Perform actions (login, create user, issue book) to generate live logs!</td>
              </tr>
              <tr *ngFor="let log of logs" class="hover:bg-slate-800/30 transition-colors">
                <td class="p-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                  {{ log.createdAt | date:'medium' }}
                </td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-cyan-400 border border-slate-700">
                    {{ log.module }}
                  </span>
                </td>
                <td class="p-4">
                  <span class="font-bold text-white uppercase tracking-wider text-[11px]">
                    {{ log.action }}
                  </span>
                </td>
                <td class="p-4">
                  <div *ngIf="log.performedBy" class="font-semibold text-slate-200">
                    {{ log.performedBy.fullName || 'User' }}
                    <span class="text-[10px] text-slate-400 font-mono">({{ log.performedBy.email }})</span>
                  </div>
                  <div *ngIf="!log.performedBy" class="text-slate-500 font-mono text-[10px]">SYSTEM / AUTOMATED</div>
                </td>
                <td class="p-4 font-mono text-[10px] text-slate-300 max-w-md truncate">
                  {{ log.details | json }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AuditLogsComponent implements OnInit {
  logs: any[] = [];
  loading = true;

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.loadAuditLogs();
  }

  loadAuditLogs() {
    this.loading = true;
    this.api.getAuditLogs().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.logs = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.logs = [];
        this.loading = false;
      }
    });
  }
}
