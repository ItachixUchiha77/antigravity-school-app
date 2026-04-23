import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from './store/index.js';
import LoginPage from './pages/LoginPage.jsx';
import AppPage from './pages/AppPage.jsx';
import AdminSetupPage from './pages/AdminSetupPage.jsx';

const isSetupComplete = () => !!useAuthStore.getState().school;

function ProtectedRoute({ children }) {
  const { isAuthenticated, currentUser } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (currentUser?.role === 'admin' && !isSetupComplete()) {
    return <Navigate to="/admin-setup" replace />;
  }
  return children;
}

function AdminSetupRoute({ children }) {
  const { isAuthenticated, currentUser } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (currentUser?.role !== 'admin') return <Navigate to="/app" replace />;
  if (isSetupComplete()) return <Navigate to="/app" replace />;
  return children;
}

function AppLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-glow-blue animate-pulse-glow">
        <span className="text-3xl">🎭</span>
      </div>
      <div className="w-6 h-6 border-2 border-border-default border-t-accent-blue rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const theme = useUIStore((s) => s.theme);
  const initializing = useAuthStore((s) => s.initializing);

  useEffect(() => {
    useAuthStore.getState().restoreSession();
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.add('light');
    } else {
      html.classList.remove('light');
    }
  }, [theme]);

  if (initializing) return <AppLoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin-setup"
        element={
          <AdminSetupRoute>
            <AdminSetupPage />
          </AdminSetupRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
