import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';
import { UserRole } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'VIEWER',
  fallback 
}: ProtectedRouteProps) {
  const { user, profile, loading, hasRole } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile || !hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Required role: {requiredRole} | Your role: {profile?.role || 'None'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}