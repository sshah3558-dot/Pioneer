'use client';

import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { apiFetch } from '@/lib/api/fetcher';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';

export function CreatePost() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useImageUpload('posts');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | undefined;
      if (selectedFile) {
        const url = await upload(selectedFile);
        if (!url) {
          setError('Failed to upload image');
          setIsSubmitting(false);
          return;
        }
        imageUrl = url;
      }

      await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content: content.trim(), imageUrl }),
      });

      setContent('');
      removeImage();
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = !content.trim() || isSubmitting || isUploading;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=667eea&color=fff&size=48`}
          alt={user?.name || 'User'}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your latest discovery..."
          className="flex-1 bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[80px]"
          maxLength={2000}
        />
      </div>

      {previewUrl && (
        <div className="relative mb-4 ml-16">
          <img src={previewUrl} alt="Preview" className="max-h-64 rounded-xl object-cover" />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-3 ml-16">{error}</p>}

      <div className="flex items-center justify-between ml-16">
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all text-sm flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Add Photo
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {(isSubmitting || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
          Post
        </button>
      </div>
    </div>
  );
}
