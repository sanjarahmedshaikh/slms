import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogIn, Lock, Mail, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    let cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'student') cleanEmail = 'student@slms.com';
    if (cleanEmail === 'faculty') cleanEmail = 'faculty@slms.com';

    const res = await login(cleanEmail, password);
    setLoading(false);

    if (res.success) {
      const userRole = res.user?.role || '';
      const adminTargetUrl = import.meta.env.VITE_ADMIN_URL || '/admin/';
      if (userRole === 'super_admin' || userRole === 'admin' || userRole === 'librarian' || userRole.includes('admin')) {
        window.location.href = adminTargetUrl;
      } else {
        navigate('/');
      }
    } else {
      setErrorMessage(res.message || 'Invalid email or password. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/30">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Smart Library System</h1>
          <p className="text-xs text-slate-400">Enter your credentials to access your portal</p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <span>Don't have an account?</span>
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5" /> Sign Up Free
          </Link>
        </div>
      </div>
    </div>
  );
}
