'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api/fetcher';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, Loader2, Check } from 'lucide-react';

type NotificationKey = 'emailOnFollow' | 'emailOnReviewLike' | 'emailOnTripLike' | 'emailOnForumReply';

const notificationOptions: { key: NotificationKey; label: string; description: string }[] = [
  {
    key: 'emailOnFollow',
    label: 'New Followers',
    description: 'Get notified when someone follows you',
  },
  {
    key: 'emailOnReviewLike',
    label: 'Review Likes',
    description: 'Get notified when someone likes your review',
  },
  {
    key: 'emailOnTripLike',
    label: 'Trip Likes',
    description: 'Get notified when someone likes your trip',
  },
  {
    key: 'emailOnForumReply',
    label: 'Forum Replies',
    description: 'Get notified when someone replies to your forum post',
  },
];

const defaultPrefs = {
  emailOnFollow: true,
  emailOnReviewLike: true,
  emailOnTripLike: true,
  emailOnForumReply: true,
};

export default function NotificationSettingsPage() {
  const { user, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();

  const [prefs, setPrefs] = useState<Record<NotificationKey, boolean>>(defaultPrefs);
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user && !initialized) {
    if (user.notificationPrefs) {
      setPrefs({
        emailOnFollow: user.notificationPrefs.emailOnFollow,
        emailOnReviewLike: user.notificationPrefs.emailOnReviewLike,
        emailOnTripLike: user.notificationPrefs.emailOnTripLike,
        emailOnForumReply: user.notificationPrefs.emailOnForumReply,
      });
    }
    setInitialized(true);
  }

  const toggle = (key: NotificationKey) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      await apiFetch('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ notificationPrefs: prefs }),
      });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold">Email Notifications</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Choose which email notifications you want to receive.
      </p>

      <div className="space-y-4">
        {notificationOptions.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                prefs[key] ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={prefs[key]}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform absolute top-0.5 ${
                  prefs[key] ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mt-4">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">
            Notification preferences updated
          </span>
        )}
      </div>
    </div>
  );
}
