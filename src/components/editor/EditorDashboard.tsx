import React from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import App from '@/App';

export function EditorDashboard() {
  const { canEdit } = useAuthContext();

  if (!canEdit()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access the editor.
          </p>
        </div>
      </div>
    );
  }

  return <App />;
}