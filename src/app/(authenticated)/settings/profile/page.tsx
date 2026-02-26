'use client';

import { useState, useRef } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { apiFetch } from '@/lib/api/fetcher';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2, Check } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const avatarUpload = useImageUpload('avatars');
  const coverUpload = useImageUpload('covers');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  if (user && !initialized) {
    setName(user.name || '');
    setUsername(user.username || '');
    setBio(user.bio || '');
    setAvatarUrl(user.avatarUrl);
    setCoverImageUrl(user.coverImageUrl);
    setInitialized(true);
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const url = await avatarUpload.upload(file);
    if (url) setAvatarUrl(url);
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    const url = await coverUpload.upload(file);
    if (url) setCoverImageUrl(url);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      await apiFetch('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim() || undefined,
          username: username.trim() || undefined,
          bio: bio.trim(),
          avatarUrl,
          coverImageUrl,
        }),
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
        <div className="h-48 bg-gray-200 rounded-xl mb-6" />
        <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto -mt-18 relative z-10 mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-24 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  const displayAvatar =
    avatarPreview ||
    avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=667eea&color=fff&size=128`;
  const displayCover = coverPreview || coverImageUrl;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-r from-purple-600 to-pink-500">
        {displayCover && (
          <img
            src={displayCover}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          disabled={coverUpload.isUploading || coverUpload.isCompressing}
        >
          {coverUpload.isUploading || coverUpload.isCompressing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Camera className="w-5 h-5" />
          )}
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />
      </div>

      {/* Avatar */}
      <div className="flex justify-center -mt-12 relative z-10">
        <div className="relative">
          <img
            src={displayAvatar}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
          />
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-1.5 rounded-full transition-colors"
            disabled={avatarUpload.isUploading || avatarUpload.isCompressing}
          >
            {avatarUpload.isUploading || avatarUpload.isCompressing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="p-6 space-y-5">
        {/* Upload errors */}
        {(avatarUpload.error || coverUpload.error) && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">
            {avatarUpload.error || coverUpload.error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="Your display name"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                setUsername(val);
              }}
              maxLength={30}
              placeholder="username"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Letters, numbers, and underscores only
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Tell others about yourself..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {bio.length}/500
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">
            {error}
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center gap-3">
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
              'Save Changes'
            )}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">
              Profile updated successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
