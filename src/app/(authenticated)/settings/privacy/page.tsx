'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api/fetcher';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, Loader2, Check } from 'lucide-react';

interface PrivacySettings {
  defaultTripPublic: boolean;
  discoverable: boolean;
}

const privacyOptions: { key: keyof PrivacySettings; label: string; description: string }[] = [
  {
    key: 'defaultTripPublic',
    label: 'Public Trips by Default',
    description: 'New trips you create will be visible to everyone by default',
  },
  {
    key: 'discoverable',
    label: 'Profile Discoverable',
    description: 'Allow other users to find your profile through search and suggestions',
  },
];

export default function PrivacySettingsPage() {
  const { user, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<PrivacySettings>({
    defaultTripPublic: true,
    discoverable: true,
  });
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user && !initialized) {
    setSettings({
      defaultTripPublic: user.defaultTripPublic,
      discoverable: user.discoverable,
    });
    setInitialized(true);
  }

  const toggle = (key: keyof PrivacySettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      await apiFetch('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(settings),
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
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-2">
        <Eye className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold">Privacy Settings</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Control who can see your content and how you appear to others.
      </p>

      <div className="space-y-4">
        {privacyOptions.map(({ key, label, description }) => (
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
                settings[key] ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={settings[key]}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform absolute top-0.5 ${
                  settings[key] ? 'translate-x-5' : 'translate-x-0.5'
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
            'Save Settings'
          )}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">
            Privacy settings updated
          </span>
        )}
      </div>
    </div>
  );
}
