import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-12 relative">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Live User Accounts & Role Permissions</h1>
          <p class="text-xs text-slate-400 mt-1">Create users manually and manage assigned roles (Librarian, Student, Faculty) stored in database.</p>
        </div>

        <button
          (click)="showAddModal = true"
          class="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/30 transition-all"
        >
          + Add New User
        </button>
      </div>

      <!-- Top Middle Fixed Floating Toast Notification Banners -->
      <div *ngIf="message" class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border border-emerald-500/50 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md w-11/12">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
        <span class="text-xs font-semibold text-slate-100 flex-1 text-center sm:text-left">{{ message }}</span>
        <button (click)="message = ''" class="text-slate-400 hover:text-white text-xs ml-2">✕</button>
      </div>

      <div *ngIf="errorMessage" class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border border-rose-500/50 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md w-11/12">
        <span class="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0"></span>
        <span class="text-xs font-semibold text-rose-400 flex-1 text-center sm:text-left">{{ errorMessage }}</span>
        <button (click)="errorMessage = ''" class="text-slate-400 hover:text-white text-xs ml-2">✕</button>
      </div>

      <!-- Users Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th class="p-4">Member ID & Name</th>
                <th class="p-4">Email</th>
                <th class="p-4">Department</th>
                <th class="p-4">Assigned Role</th>
                <th class="p-4">Max Loan Limit</th>
                <th class="p-4">Account Status</th>
                <th class="p-4 text-right">Role Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr *ngIf="loading">
                <td colspan="7" class="p-8 text-center text-slate-400">Fetching live user accounts...</td>
              </tr>
              <tr *ngIf="!loading && users.length === 0">
                <td colspan="7" class="p-8 text-center text-slate-400">No user accounts found. Click "+ Add New User" above to create your first user account manually!</td>
              </tr>
              <tr *ngFor="let u of users" class="hover:bg-slate-800/30 transition-colors">
                <td class="p-4 font-semibold text-white">
                  <div>{{ u.fullName }}</div>
                  <div class="text-[10px] text-cyan-400 font-mono">{{ u.memberId }}</div>
                </td>
                <td class="p-4">{{ u.email }}</td>
                <td class="p-4">{{ u.department || 'General' }}</td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase" [ngClass]="getRoleClass(u.role)">
                    {{ u.role }}
                  </span>
                </td>
                <td class="p-4 font-mono font-bold">{{ u.maxAllowedBooks || (u.role === 'faculty' ? 7 : 3) }} Books</td>
                <td class="p-4">
                  <span class="text-[10px] font-bold" [ngClass]="u.isActive ? 'text-emerald-400' : 'text-rose-400'">
                    {{ u.isActive ? 'ACTIVE' : 'SUSPENDED' }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <span *ngIf="u.role === 'super_admin'" class="text-slate-500 font-semibold text-[11px]">System Owner</span>
                  <select
                    *ngIf="u.role !== 'super_admin'"
                    [ngModel]="u.role"
                    (ngModelChange)="changeRole(u, $event)"
                    class="bg-slate-800 border border-slate-700 rounded-lg text-xs p-1 text-white focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="librarian">Librarian</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add User Modal -->
      <div *ngIf="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 relative">
          <h3 class="text-lg font-bold text-white">Create New User Account</h3>

          <div class="space-y-3">
            <div>
              <label class="text-xs text-slate-400 block mb-1">Full Name *</label>
              <input [(ngModel)]="newUser.fullName" placeholder="e.g. Alex Mercer" class="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
            </div>

            <div>
              <label class="text-xs text-slate-400 block mb-1">Email Address *</label>
              <input [(ngModel)]="newUser.email" type="email" placeholder="e.g. student&#64;slms.com" class="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
            </div>

            <div>
              <label class="text-xs text-slate-400 block mb-1">Password *</label>
              <input [(ngModel)]="newUser.password" type="password" placeholder="••••••••" class="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-slate-400 block mb-1">User Role *</label>
                <select [(ngModel)]="newUser.role" class="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="librarian">Librarian</option>
                </select>
              </div>

              <div>
                <label class="text-xs text-slate-400 block mb-1">Department</label>
                <input [(ngModel)]="newUser.department" placeholder="e.g. Computer Science" class="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
              </div>
            </div>

            <div>
              <label class="text-xs text-slate-400 block mb-1">Phone Number</label>
              <input [(ngModel)]="newUser.phone" placeholder="e.g. +91 98765 43210" class="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button (click)="showAddModal = false" class="px-4 py-2 text-xs text-slate-400">Cancel</button>
            <button (click)="addUser()" class="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold">Create User Account</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  loading = true;
  showAddModal = false;
  message = '';
  errorMessage = '';

  newUser = {
    fullName: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    phone: ''
  };

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.api.getUsers().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.users = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.users = [];
        this.loading = false;
      }
    });
  }

  getRoleClass(role: string) {
    switch (role) {
      case 'super_admin': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'librarian': return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
      case 'faculty': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
      default: return 'bg-slate-800 text-slate-300';
    }
  }

  addUser() {
    this.message = '';
    this.errorMessage = '';

    if (!this.newUser.fullName || !this.newUser.email || !this.newUser.password) {
      this.errorMessage = 'Full Name, Email, and Password are required.';
      return;
    }

    this.api.createUser(this.newUser).subscribe({
      next: (res: any) => {
        const memberId = res.data?.user?.memberId || '';
        this.message = `User "${this.newUser.fullName}" created successfully! Member ID: ${memberId}`;
        this.showAddModal = false;
        this.loadUsers();
        this.newUser = { fullName: '', email: '', password: '', role: 'student', department: 'Computer Science', phone: '' };
        setTimeout(() => (this.message = ''), 6000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create user account.';
      }
    });
  }

  changeRole(user: any, newRole: string) {
    this.api.updateUserRole(user._id, newRole).subscribe({
      next: () => {
        user.role = newRole;
        this.message = `Updated ${user.fullName} role to ${newRole}`;
        setTimeout(() => (this.message = ''), 4000);
      }
    });
  }
}
