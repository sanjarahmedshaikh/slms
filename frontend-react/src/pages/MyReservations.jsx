import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bookmark, X, RefreshCw, BookOpen, CheckCircle2 } from 'lucide-react';

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reservations/my-reservations');
      if (res.data.success) {
        setReservations(res.data.data);
      }
    } catch (err) {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id, title) => {
    try {
      const res = await api.delete(`/reservations/${id}`);
      if (res.data.success) {
        setActionMessage(`Hold reservation cancelled for "${title || 'book'}".`);
        fetchReservations();
      }
    } catch (err) {
      setActionMessage('Failed to cancel reservation.');
    }
    setTimeout(() => setActionMessage(''), 5000);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hold Reservations & Priority Queue</h1>
          <p className="text-xs text-slate-400 mt-1">Track your active book hold positions and priority queue numbers.</p>
        </div>

        <button
          onClick={fetchReservations}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-500" /> Refresh Queue
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-semibold flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading reservation queue...</div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
          <Bookmark className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Active Book Holds</h3>
          <p className="text-xs text-slate-400">When a requested book is unavailable, reserve it from the catalog to enter the priority queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reservations.map((res) => (
            <div
              key={res._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {res.book?.coverImageUrl ? (
                  <img src={res.book.coverImageUrl} alt="Book Cover" className="w-14 h-18 object-cover rounded-xl shadow" />
                ) : (
                  <div className="w-14 h-18 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                      RES-#{res._id?.slice(-6)}
                    </span>
                    {res.status === 'fulfilled' ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> FULFILLED - BOOK ISSUED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Queue Position #{res.queuePosition}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">{res.book?.title || 'Book Title'}</h3>
                  <p className="text-xs text-slate-400">
                    Status: <span className={`uppercase font-bold ${res.status === 'fulfilled' ? 'text-emerald-400' : 'text-amber-400'}`}>{res.status}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Reserved on: {new Date(res.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {res.status === 'pending' && (
                <button
                  onClick={() => handleCancel(res._id, res.book?.title)}
                  className="px-3.5 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <X className="w-3.5 h-3.5" /> Cancel Reservation
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
