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

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show loading if profile is still being fetched
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user has required role
  if (!hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Redirect based on user's actual role
    if (profile.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (profile.role === 'EDITOR') {
      return <Navigate to="/editor" replace />;
    } else {
      return <Navigate to="/viewer" replace />;
    }
  }

  return <>{children}</>;
}