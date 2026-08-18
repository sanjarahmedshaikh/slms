import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, AlertCircle, Bookmark, ArrowRight, Sparkles, TrendingUp, User, X, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [unpaidFineAmount, setUnpaidFineAmount] = useState(0);
  const [activeHoldsCount, setActiveHoldsCount] = useState(0);
  const [totalBorrowedCount, setTotalBorrowedCount] = useState(0);

  const [selectedBook, setSelectedBook] = useState(null);
  const [reservationMessage, setReservationMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [booksRes, loansRes, finesRes, holdsRes] = await Promise.all([
        api.get('/books', { params: { limit: 6 } }),
        api.get('/transactions/my-history'),
        api.get('/fines/my-fines'),
        api.get('/reservations/my-reservations')
      ]);

      if (booksRes.data?.success) {
        setRecommendedBooks(Array.isArray(booksRes.data.data) ? booksRes.data.data : []);
      }
      if (loansRes.data?.success) {
        const loans = Array.isArray(loansRes.data.data) ? loansRes.data.data : [];
        setActiveLoansCount(loans.filter((l) => l.status === 'issued').length);
        setTotalBorrowedCount(loans.length);
      }
      if (finesRes.data?.success) {
        const finesData = finesRes.data.data;
        const fines = Array.isArray(finesData?.fines) ? finesData.fines : Array.isArray(finesData) ? finesData : [];
        const sum = fines.filter((f) => f.status === 'unpaid').reduce((acc, f) => acc + (f.amount || 0), 0);
        setUnpaidFineAmount(sum);
      }
      if (holdsRes.data?.success) {
        const holds = Array.isArray(holdsRes.data.data) ? holdsRes.data.data : [];
        setActiveHoldsCount(holds.filter((h) => h.status === 'pending').length);
      }
    } catch (err) {}
  };

  const handleReserve = async (book) => {
    try {
      const res = await api.post('/reservations', { bookId: book._id });
      if (res.data.success) {
        setReservationMessage(`Hold reservation placed for "${book.title}". Queue position #${res.data.data.queuePosition}.`);
        fetchDashboardData();
      }
    } catch (err) {
      setReservationMessage(err.response?.data?.message || `Reserved "${book.title}". You will be notified when available.`);
    }
    setTimeout(() => setReservationMessage(''), 6000);
  };

  const stats = [
    { label: 'Active Borrowed Books', value: `${activeLoansCount}`, limit: user?.role === 'faculty' ? '7' : '3', icon: BookOpen, color: 'from-indigo-500 to-violet-500' },
    { label: 'Unpaid Fines Balance', value: `₹${unpaidFineAmount.toFixed(2)}`, status: unpaidFineAmount === 0 ? 'Account Clear' : 'Action Required', icon: AlertCircle, color: unpaidFineAmount === 0 ? 'from-emerald-500 to-teal-500' : 'from-rose-500 to-red-500' },
    { label: 'Active Holds Queue', value: `${activeHoldsCount}`, status: 'Hold Reservations', icon: Bookmark, color: 'from-amber-500 to-orange-500' },
    { label: 'Total Books Borrowed', value: `${totalBorrowedCount}`, status: 'Lifetime History', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' }
  ];

  return (
    <div className="space-y-8 pb-10 relative">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white shadow-2xl border border-indigo-500/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to SLMS Portal
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            Hello, {user?.fullName || 'Member'}
            <span className="p-2 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 inline-flex">
              <User className="w-6 h-6 text-indigo-300" />
            </span>
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Search library books, check your hold queues, and view active borrowings.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              to="/catalog"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg shadow-white/10"
            >
              Explore Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/my-loans"
              className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md text-white font-semibold text-sm hover:bg-white/20 transition-all border border-white/20"
            >
              View My Loans
            </Link>
          </div>
        </div>
      </div>

      {/* Top Middle Floating Toast Popup */}
      {reservationMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border border-indigo-500/50 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 max-w-md w-11/12">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold flex-1 text-center sm:text-left">{reservationMessage}</span>
          <button onClick={() => setReservationMessage('')} className="text-slate-400 hover:text-white ml-2"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {stat.value}
                  {stat.limit && <span className="text-xs text-slate-400 font-normal"> / {stat.limit}</span>}
                </div>
                {stat.status && <div className="text-[11px] font-semibold text-indigo-500 mt-1">{stat.status}</div>}
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-md`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured Catalog Items */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Library Inventory Catalog</h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time book titles in library database</p>
          </div>
          <Link to="/catalog" className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1">
            View Full Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedBooks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No books in database yet. Add your first book using the Admin Console!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onReserve={handleReserve}
                onSelect={(b) => setSelectedBook(b)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
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
