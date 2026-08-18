import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-12 relative">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Live Book Inventory Management</h1>
          <p class="text-xs text-slate-400 mt-1">Add, search, edit, and delete real book records in your library database.</p>
        </div>

        <button
          (click)="showAddModal = true"
          class="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/30 transition-all"
        >
          + Add New Book
        </button>
      </div>

      <!-- Top Middle Fixed Floating Toast Popups -->
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

      <!-- Filter Bar -->
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between">
        <input
          type="text"
          placeholder="Filter by title, author, or ISBN..."
          [(ngModel)]="searchQuery"
          (input)="filterBooks()"
          class="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full sm:w-80"
        />

        <div class="text-xs text-slate-400 flex items-center gap-2">
          Total Inventory: <span class="font-bold text-white">{{ books.length }} Titles</span>
        </div>
      </div>

      <!-- Books Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th class="p-4">Book Title & Authors</th>
                <th class="p-4">ISBN</th>
                <th class="p-4">Category</th>
                <th class="p-4">Copies (Avail/Total)</th>
                <th class="p-4">Shelf Location</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr *ngIf="loading">
                <td colspan="7" class="p-8 text-center text-slate-400">Fetching live inventory...</td>
              </tr>
              <tr *ngIf="!loading && displayedBooks.length === 0">
                <td colspan="7" class="p-8 text-center text-slate-400">No books found. Click "+ Add New Book" above to insert your first record manually!</td>
              </tr>
              <tr *ngFor="let b of displayedBooks; trackBy: trackByBookId" class="hover:bg-slate-800/30 transition-colors">
                <td class="p-4 font-semibold text-white">
                  <div>{{ b.title }}</div>
                  <div class="text-[10px] text-slate-400 font-normal">{{ b.authors?.join(', ') || b.authors }}</div>
                </td>
                <td class="p-4 font-mono text-[11px] text-cyan-400">{{ b.isbn }}</td>
                <td class="p-4">{{ b.category?.name || 'General' }}</td>
                <td class="p-4 font-bold" [ngClass]="b.availableCopies > 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ b.availableCopies }} / {{ b.totalCopies }}
                </td>
                <td class="p-4">{{ b.shelfLocation }}</td>
                <td class="p-4">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    [ngClass]="b.availableCopies > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'"
                  >
                    {{ b.availableCopies > 0 ? 'AVAILABLE' : 'OUT OF STOCK' }}
                  </span>
                </td>
                <td class="p-4 text-right space-x-2">
                  <button (click)="deleteBook(b._id)" class="text-rose-400 hover:text-rose-300 font-semibold">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Book Modal -->
      <div *ngIf="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 relative">
          <h3 class="text-lg font-bold text-white">Add New Book Record</h3>

          <div class="space-y-3">
            <div>
              <label class="text-xs text-slate-400 block mb-1">Book Title *</label>
              <input [(ngModel)]="newBook.title" placeholder="e.g. Clean Code" class="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
            </div>

            <div>
              <label class="text-xs text-slate-400 block mb-1">ISBN *</label>
              <input [(ngModel)]="newBook.isbn" placeholder="e.g. 978-0132350884" class="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
            </div>

            <div>
              <label class="text-xs text-slate-400 block mb-1">Authors *</label>
              <input [(ngModel)]="newBook.authors" placeholder="e.g. Robert C. Martin" class="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-slate-400 block mb-1">Category</label>
                <input [(ngModel)]="newBook.category" placeholder="e.g. Computer Science" class="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white w-full" />
              </div>
              <div>
                <label class="text-xs text-slate-400 block mb-1">Total Copies *</label>
                <input [(ngModel)]="newBook.totalCopies" type="number" placeholder="5" class="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white w-full" />
              </div>
            </div>

            <div>
              <label class="text-xs text-slate-400 block mb-1">Publisher</label>
              <input [(ngModel)]="newBook.publisher" placeholder="e.g. Prentice Hall" class="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
            </div>

            <div>
              <label class="text-xs text-slate-400 block mb-1">Shelf Location</label>
              <input [(ngModel)]="newBook.shelfLocation" placeholder="e.g. Rack A - Shelf 1" class="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
            </div>

            <div>
              <label class="text-xs text-slate-400 block mb-1">Description</label>
              <textarea [(ngModel)]="newBook.description" placeholder="Brief book description..." class="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white h-16"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button (click)="showAddModal = false" class="px-4 py-2 text-xs text-slate-400">Cancel</button>
            <button (click)="addBook()" class="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold">Save Book to Database</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BooksComponent implements OnInit {
  books: any[] = [];
  displayedBooks: any[] = [];
  searchQuery = '';
  showAddModal = false;
  loading = true;
  message = '';
  errorMessage = '';

  newBook = {
    title: '',
    isbn: '',
    authors: '',
    publisher: 'Prentice Hall',
    category: 'Computer Science',
    totalCopies: 5,
    shelfLocation: 'Rack A - Shelf 1',
    description: ''
  };

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.loadBooks();
  }

  trackByBookId(index: number, item: any) {
    return item._id || index;
  }

  loadBooks() {
    this.loading = true;
    this.api.getBooks().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.books = res.data;
          this.displayedBooks = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.books = [];
        this.displayedBooks = [];
        this.loading = false;
      }
    });
  }

  filterBooks() {
    if (!this.searchQuery) {
      this.displayedBooks = this.books;
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.displayedBooks = this.books.filter(
      (b) => b.title?.toLowerCase().includes(q) || b.isbn?.includes(q)
    );
  }

  addBook() {
    this.message = '';
    this.errorMessage = '';

    if (!this.newBook.title || !this.newBook.isbn) {
      this.errorMessage = 'Please enter both Book Title and ISBN.';
      return;
    }

    const payload = {
      title: this.newBook.title,
      isbn: this.newBook.isbn,
      authors: [this.newBook.authors || 'Unknown Author'],
      publisher: this.newBook.publisher,
      category: this.newBook.category,
      totalCopies: Number(this.newBook.totalCopies) || 1,
      shelfLocation: this.newBook.shelfLocation,
      description: this.newBook.description
    };

    this.api.createBook(payload).subscribe({
      next: (res: any) => {
        this.message = `Book "${this.newBook.title}" saved successfully!`;
        this.showAddModal = false;
        this.loadBooks();
        this.newBook = { title: '', isbn: '', authors: '', publisher: 'Prentice Hall', category: 'Computer Science', totalCopies: 5, shelfLocation: 'Rack A - Shelf 1', description: '' };
        setTimeout(() => (this.message = ''), 5000);
      },
      error: (err) => {
        const errMsg = err.error?.message || (Array.isArray(err.error?.errors) ? err.error.errors.join(', ') : 'Failed to add book.');
        this.errorMessage = errMsg;
      }
    });
  }

  deleteBook(id: string) {
    if (!confirm('Are you sure you want to delete this book record?')) return;
    this.api.deleteBook(id).subscribe({
      next: () => {
        this.message = 'Book deleted from database.';
        this.loadBooks();
        setTimeout(() => (this.message = ''), 4000);
      }
    });
  }
}
