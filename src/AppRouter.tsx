import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginForm } from '@/components/auth/LoginForm';
import { Navbar } from '@/components/layout/Navbar';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { EditorDashboard } from '@/components/editor/EditorDashboard';
import { ViewerDashboard } from '@/components/viewer/ViewerDashboard';

export function AppRouter() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="ADMIN">
                <>
                  <Navbar />
                  <AdminPanel />
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/editor/*" element={
              <ProtectedRoute requiredRole="EDITOR">
                <>
                  <Navbar />
                  <EditorDashboard />
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/viewer" element={
              <ProtectedRoute requiredRole="VIEWER">
                <>
                  <Navbar />
                  <ViewerDashboard />
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/" element={
              <ProtectedRoute requiredRole="VIEWER">
                <Navigate to="/viewer" replace />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}