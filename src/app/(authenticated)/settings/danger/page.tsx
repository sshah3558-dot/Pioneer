'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api/fetcher';
import { signOut } from 'next-auth/react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

export default function DangerZonePage() {
  const { user, isLoading } = useCurrentUser();

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmUsername !== user?.username) {
      setError('Username does not match');
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await apiFetch('/api/users/me/delete', {
        method: 'DELETE',
        body: JSON.stringify({ confirmUsername }),
      });
      signOut({ callbackUrl: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border-2 border-red-200 dark:border-red-800">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Actions here are permanent and cannot be undone. Please proceed with caution.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete My Account
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                This action is irreversible
              </p>
              <p className="text-sm text-red-600 mt-1">
                Deleting your account will permanently remove all your data including trips,
                reviews, posts, and followers. This cannot be undone.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-red-700 mb-1">
              Type your username <span className="font-bold">@{user?.username}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              placeholder={user?.username || 'username'}
              className="w-full px-4 py-2.5 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white"
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting || confirmUsername !== user?.username}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Forever
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmUsername('');
                setError(null);
              }}
              disabled={isDeleting}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
