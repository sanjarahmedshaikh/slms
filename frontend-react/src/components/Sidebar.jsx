import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Clock, IndianRupee, BookmarkCheck } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Book Catalog', path: '/catalog', icon: BookOpen },
    { label: 'My Borrowed Books', path: '/my-loans', icon: Clock },
    { label: 'My Fines & Payments', path: '/my-fines', icon: IndianRupee },
    { label: 'Hold Reservations', path: '/my-reservations', icon: BookmarkCheck }
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 transition-colors sticky top-[65px] h-[calc(100vh-65px)] self-start shrink-0 overflow-y-auto custom-scrollbar">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 text-white">
        <div className="text-xs font-semibold text-indigo-300">Need Assistance?</div>
        <div className="text-[11px] text-slate-400 mt-1">Contact central library desk or submit a hold request.</div>
      </div>
    </aside>
  );
}
