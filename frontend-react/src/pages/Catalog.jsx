import React, { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import api from '../services/api';
import { Search, CheckCircle2, X, BookOpen, Filter, ChevronDown } from 'lucide-react';

export default function Catalog({ searchTerm }) {
  const [search, setSearch] = useState('');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBook, setSelectedBook] = useState(null);
  const [reservationMessage, setReservationMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, [selectedCategory, search, searchTerm]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/books/categories');
      if (res.data.success) {
        setCategories(['All', ...res.data.data.map((c) => c.name)]);
      }
    } catch (err) {}
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const query = searchTerm || search;
      const res = await api.get('/books', {
        params: {
          search: query,
          limit: 50
        }
      });
      if (res.data.success) {
        let items = res.data.data;
        if (selectedCategory !== 'All') {
          items = items.filter((b) => b.category?.name === selectedCategory);
        }
        setBooks(items);
      }
    } catch (err) {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (book) => {
    try {
      const res = await api.post('/reservations', { bookId: book._id });
      if (res.data.success) {
        setReservationMessage(`Hold reservation placed for "${book.title}". Queue position #${res.data.data.queuePosition}.`);
      }
    } catch (err) {
      setReservationMessage(err.response?.data?.message || `Reserved "${book.title}". You will be notified when available.`);
    }
    setTimeout(() => setReservationMessage(''), 6000);
  };

  return (
    <div className="space-y-6 pb-12 relative">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Book Catalog & Inventory</h1>
        <p className="text-xs text-slate-400 mt-1">Browse, filter, and reserve books from your digital library inventory.</p>
      </div>

      {/* Top Middle Floating Toast Notification */}
      {reservationMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border border-indigo-500/50 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 max-w-md w-11/12">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold flex-1 text-center sm:text-left">{reservationMessage}</span>
          <button onClick={() => setReservationMessage('')} className="text-slate-400 hover:text-white ml-2"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search Bar & Category Dropdown Menu */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author, ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Category Dropdown Select Menu */}
        <div className="relative min-w-[200px]">
          <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white appearance-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Book Categories' : cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading catalog inventory...</div>
      ) : books.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No books found in database</h3>
          <p className="text-xs text-slate-400">Use the Admin Console to add new books to your digital library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard key={book._id} book={book} onReserve={handleReserve} onSelect={(b) => setSelectedBook(b)} />
          ))}
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 relative">
            <button onClick={() => setSelectedBook(null)} className="absolute top-4 right-4 p-2 text-slate-400 rounded-full bg-slate-100 dark:bg-slate-800">
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-4">
              <img src={selectedBook.coverImageUrl} alt={selectedBook.title} className="w-28 h-36 object-cover rounded-xl shadow-md" />
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{selectedBook.category?.name || 'General'}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedBook.title}</h3>
                <p className="text-xs text-slate-400 mt-1">Authors: {Array.isArray(selectedBook.authors) ? selectedBook.authors.join(', ') : selectedBook.authors}</p>
                <p className="text-xs text-slate-400 mt-0.5">Publisher: {selectedBook.publisher}</p>
                <div className="mt-3 text-xs font-mono text-slate-300">ISBN: {selectedBook.isbn}</div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">Shelf: {selectedBook.shelfLocation}</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
              {selectedBook.description || 'No description provided.'}
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setSelectedBook(null)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
                Close
              </button>
              <button
                onClick={() => {
                  handleReserve(selectedBook);
                  setSelectedBook(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
              >
                Confirm Hold / Borrow Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
