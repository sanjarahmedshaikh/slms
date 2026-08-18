import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import MyLoans from './pages/MyLoans';
import MyFines from './pages/MyFines';
import MyReservations from './pages/MyReservations';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedLayout() {
  const { user } = useAuth();
  const [globalSearch, setGlobalSearch] = useState('');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role || '';
  if (userRole === 'super_admin' || userRole === 'admin' || userRole === 'librarian' || userRole.includes('admin')) {
    localStorage.removeItem('slms_token');
    localStorage.removeItem('slms_user');
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onSearchChange={setGlobalSearch} />
      <div className="flex flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8">
        <Sidebar />
        <main className="flex-1 py-6 md:px-8 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalog" element={<Catalog searchTerm={globalSearch} />} />
            <Route path="/my-loans" element={<MyLoans />} />
            <Route path="/my-fines" element={<MyFines />} />
            <Route path="/my-reservations" element={<MyReservations />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
