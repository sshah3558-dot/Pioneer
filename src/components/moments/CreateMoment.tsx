'use client';

import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { apiFetch } from '@/lib/api/fetcher';
import { X, Image as ImageIcon, Loader2, Star, MapPin } from 'lucide-react';

interface CreateMomentProps {
  isOpen: boolean;
  onClose: () => void;
}

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20 sm:w-28">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= value
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-gray-400 ml-1">{value}/5</span>
    </div>
  );
}

export function CreateMoment({ isOpen, onClose }: CreateMomentProps) {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useImageUpload('posts');

  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [overallRating, setOverallRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [authenticityRating, setAuthenticityRating] = useState(0);
  const [crowdRating, setCrowdRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - photos.length;
    const toAdd = files.slice(0, remaining);
    setPhotos(prev => [
      ...prev,
      ...toAdd.map(f => ({ file: f, preview: URL.createObjectURL(f) })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!content.trim() || overallRating === 0) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const uploadedUrls: (string | undefined)[] = [];
      const failedUploads: string[] = [];
      for (const photo of photos) {
        try {
          const url = await upload(photo.file);
          uploadedUrls.push(url || undefined);
        } catch (uploadErr) {
          failedUploads.push(photo.file.name);
          uploadedUrls.push(undefined);
        }
      }
      if (failedUploads.length > 0) {
        setUploadError(`Failed to upload: ${failedUploads.join(', ')}. Submitting without those images.`);
      }

      await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          content: content.trim(),
          imageUrl: uploadedUrls[0],
          imageUrl2: uploadedUrls[1],
          imageUrl3: uploadedUrls[2],
          overallRating,
          valueRating: valueRating || undefined,
          authenticityRating: authenticityRating || undefined,
          crowdRating: crowdRating || undefined,
        }),
      });

      // Reset form
      setContent('');
      photos.forEach(p => URL.revokeObjectURL(p.preview));
      setPhotos([]);
      setOverallRating(0);
      setValueRating(0);
      setAuthenticityRating(0);
      setCrowdRating(0);
      setUploadError(null);

      queryClient.invalidateQueries({ queryKey: ['myRankings'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allMyPosts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['moments'] });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create moment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // BUG 6: Prevent background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // BUG 6: Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-bold gradient-text-135">New Moment</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your experience..."
            maxLength={2000}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
          />
          <p className="text-xs text-gray-400 text-right -mt-2">{content.length}/2000</p>

          {/* Photos */}
          <div>
            <div className="flex gap-2 mb-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative">
                  <img src={photo.preview} alt="" className="w-24 h-24 rounded-xl object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-400 transition-colors"
                >
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-xs mt-1">Add</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
            {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
          </div>

          {/* Ratings */}
          <div className="space-y-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Rate this moment</h4>
            <StarRating label="Overall *" value={overallRating} onChange={setOverallRating} />
            <StarRating label="Value" value={valueRating} onChange={setValueRating} />
            <StarRating label="Authenticity" value={authenticityRating} onChange={setAuthenticityRating} />
            <StarRating label="Crowd Level" value={crowdRating} onChange={setCrowdRating} />
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || overallRating === 0 || isSubmitting || isUploading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {(isSubmitting || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Moment'}
          </button>
        </div>
      </div>
    </div>
  );
}
