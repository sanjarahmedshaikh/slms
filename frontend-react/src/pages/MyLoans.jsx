import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { RefreshCw, BookOpen } from 'lucide-react';

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions/my-history');
      if (res.data.success) {
        setLoans(res.data.data);
      }
    } catch (err) {
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Active Loans & Borrowings</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time loan records from your database account.</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Fetching live borrowings...</div>
      ) : loans.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Active Borrowings</h3>
          <p className="text-xs text-slate-400">Visit the library circulation desk or catalog to check out books.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {loans.map((loan) => {
            const dueDate = new Date(loan.dueDate);
            const isOverdue = new Date() > dueDate && loan.status !== 'returned';

            return (
              <div
                key={loan._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img src={loan.book?.coverImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200'} alt="Book Cover" className="w-16 h-20 object-cover rounded-xl shadow" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                        Tx: {loan._id?.slice(-6)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isOverdue
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">{loan.book?.title}</h3>
                    <p className="text-xs text-slate-400">ISBN: {loan.book?.isbn}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                      <span>Issued: {new Date(loan.issueDate).toLocaleDateString()}</span>
                      <span className="font-semibold text-slate-200">Due: {dueDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
                  <button className="px-4 py-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all">
                    <RefreshCw className="w-3.5 h-3.5" /> Request Renewal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
