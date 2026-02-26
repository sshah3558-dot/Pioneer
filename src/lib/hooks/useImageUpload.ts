'use client';

import { useState, useCallback } from 'react';
import { BucketName, BUCKETS } from '@/lib/storage/supabase';
import { compressImage } from '@/lib/utils/compress-image';

interface UploadState {
  isUploading: boolean;
  isCompressing: boolean;
  error: string | null;
  progress: number;
}

export function useImageUpload(bucket: BucketName) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    isCompressing: false,
    error: null,
    progress: 0,
  });

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setState({ isUploading: true, isCompressing: true, error: null, progress: 0 });

    // Auto-compress if needed
    const maxSize = BUCKETS[bucket].maxSize;
    const maxDimension = bucket === 'avatars' ? 1024 : 3840;
    let processedFile: File;
    try {
      processedFile = await compressImage(file, {
        maxSizeBytes: maxSize,
        maxWidth: maxDimension,
        maxHeight: maxDimension,
      });
    } catch {
      setState({ isUploading: false, isCompressing: false, error: 'Failed to process image', progress: 0 });
      return null;
    }

    setState(prev => ({ ...prev, isCompressing: false }));

    try {
      const formData = new FormData();
      formData.append('file', processedFile);

      const res = await fetch(`/api/upload?bucket=${bucket}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.error?.message || 'Upload failed';
        setState({ isUploading: false, isCompressing: false, error: message, progress: 0 });
        return null;
      }

      setState({ isUploading: false, isCompressing: false, error: null, progress: 100 });
      return data.url as string;
    } catch {
      setState({ isUploading: false, isCompressing: false, error: 'Upload failed', progress: 0 });
      return null;
    }
  }, [bucket]);

  const deleteFile = useCallback(async (url: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isUploading: false, isCompressing: false, error: null, progress: 0 });
  }, []);

  return { ...state, upload, deleteFile, reset };
}
