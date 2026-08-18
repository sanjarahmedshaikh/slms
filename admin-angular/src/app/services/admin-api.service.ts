import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private getBaseUrl(): string {
    if ((window as any).NG_APP_API_URL) return (window as any).NG_APP_API_URL;
    if ((window as any).VITE_API_URL) return (window as any).VITE_API_URL;
    if ((window as any).API_URL) return (window as any).API_URL;
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000/api/v1';
      }
      if (window.location.hostname.includes('vercel.app')) {
        return 'https://slms-backend.onrender.com/api/v1';
      }
      return `${window.location.origin}/api/v1`;
    }
    return 'http://localhost:5000/api/v1';
  }

  private baseUrl = this.getBaseUrl();

  constructor(private http: HttpClient, private router: Router) {}

  private handleAuthError<T>() {
    return catchError((err: any) => {
      if (err && err.status === 401) {
        localStorage.removeItem('slms_token');
        localStorage.removeItem('slms_user');
        this.router.navigate(['/login']);
      }
      return throwError(() => err);
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('slms_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/dashboard`, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }

  getAuditLogs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/audit-logs`, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }

  getBooks(): Observable<any> {
    return this.http.get(`${this.baseUrl}/books`).pipe(this.handleAuthError());
  }

  createBook(bookData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/books`, bookData, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }

  deleteBook(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/books/${id}`, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, userData).pipe(this.handleAuthError());
  }

  updateUserRole(id: string, role: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/users/${id}/role`, { role }, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }

  issueBook(data: { userId?: string; memberId?: string; bookId?: string; isbn?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/transactions/issue`, data, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }

  returnBook(transactionId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/transactions/return`, { transactionId }, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }

  getTransactions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/transactions`, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }

  getFines(): Observable<any> {
    return this.http.get(`${this.baseUrl}/fines`, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }

  updateFine(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/fines/${id}/pay`, { status }, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }

  getAllReservations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reservations`, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }

  cancelReservation(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/reservations/${id}`, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }

  getNotifications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications`, { headers: this.getAuthHeaders() }).pipe(this.handleAuthError());
  }
}
