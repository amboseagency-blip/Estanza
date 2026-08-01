import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Header from './Header';
import Landing from './Landing';
import Auth from './Auth';
import Dashboard from './Dashboard';
import Catalog from './Catalog';
import Detail from './Detail';
import Pricing from './Pricing';
import Settings from './Settings';

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="px-6 py-16 text-center" style={{ color: 'var(--text-muted)' }}>Loading…</div>;
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}

function Shell() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/broker/:brokerId" element={<Catalog />} />
        <Route path="/property/:propertyId" element={<Detail />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
