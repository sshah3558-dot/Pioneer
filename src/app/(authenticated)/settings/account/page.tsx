'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/fetcher';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { Loader2, Check, Mail, Lock } from 'lucide-react';

export default function AccountSettingsPage() {
  const { user, isLoading } = useCurrentUser();

  // Email form state
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSaving(true);
    setEmailError(null);
    setEmailSaved(false);
    try {
      await apiFetch('/api/users/me/email', {
        method: 'PATCH',
        body: JSON.stringify({ newEmail, currentPassword: emailPassword }),
      });
      setEmailSaved(true);
      setNewEmail('');
      setEmailPassword('');
      setTimeout(() => setEmailSaved(false), 3000);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to change email');
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSaved(false);
    try {
      await apiFetch('/api/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Change Email */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold dark:text-gray-100">Change Email</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Current email: <span className="font-medium text-gray-700 dark:text-gray-300">{user?.email}</span>
        </p>
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Email Address
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              placeholder="newemail@example.com"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              required
              placeholder="Enter your current password"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          {emailError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">
              {emailError}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={emailSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {emailSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : emailSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Updated!
                </>
              ) : (
                'Update Email'
              )}
            </button>
            {emailSaved && (
              <span className="text-sm text-green-600 font-medium">
                Email updated successfully
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold dark:text-gray-100">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Enter your current password"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter a new password"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 dark:text-gray-100"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              At least 8 characters, 1 uppercase, 1 lowercase, 1 number
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your new password"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          {passwordError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">
              {passwordError}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={passwordSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {passwordSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : passwordSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Updated!
                </>
              ) : (
                'Update Password'
              )}
            </button>
            {passwordSaved && (
              <span className="text-sm text-green-600 font-medium">
                Password updated successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
