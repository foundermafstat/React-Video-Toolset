import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/components/auth/AuthProvider';

export function Navbar() {
  const { user, profile, signOut, isAdmin, canEdit } = useAuthContext();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Video Editor
            </Link>
            
            <div className="flex space-x-4">
              <Link to="/viewer" className="text-gray-700 hover:text-gray-900">
                Viewer
              </Link>
              
              {canEdit() && (
                <Link to="/editor" className="text-gray-700 hover:text-gray-900">
                  Editor
                </Link>
              )}
              
              {isAdmin() && (
                <Link to="/admin" className="text-gray-700 hover:text-gray-900">
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {profile?.email} ({profile?.role})
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}