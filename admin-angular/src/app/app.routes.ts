import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BooksComponent } from './pages/books/books.component';
import { UsersComponent } from './pages/users/users.component';
import { IssueReturnComponent } from './pages/issue-return/issue-return.component';
import { FinesComponent } from './pages/fines/fines.component';
import { AuditLogsComponent } from './pages/audit-logs/audit-logs.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { adminAuthGuard } from './services/admin-auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DashboardComponent, canActivate: [adminAuthGuard] },
  { path: 'books', component: BooksComponent, canActivate: [adminAuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [adminAuthGuard] },
  { path: 'issue-return', component: IssueReturnComponent, canActivate: [adminAuthGuard] },
  { path: 'reservations', component: ReservationsComponent, canActivate: [adminAuthGuard] },
  { path: 'fines', component: FinesComponent, canActivate: [adminAuthGuard] },
  { path: 'audit-logs', component: AuditLogsComponent, canActivate: [adminAuthGuard] },
  { path: '**', redirectTo: '' }
];
