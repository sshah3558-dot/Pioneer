'use client';

import { useState, useCallback } from 'react';
import { BucketName } from '@/lib/storage/supabase';

interface UploadState {
  isUploading: boolean;
  error: string | null;
  progress: number;
}

export function useImageUpload(bucket: BucketName) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    error: null,
    progress: 0,
  });

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setState({ isUploading: true, error: null, progress: 0 });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/upload?bucket=${bucket}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.error?.message || 'Upload failed';
        setState({ isUploading: false, error: message, progress: 0 });
        return null;
      }

      setState({ isUploading: false, error: null, progress: 100 });
      return data.url as string;
    } catch {
      setState({ isUploading: false, error: 'Upload failed', progress: 0 });
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
    setState({ isUploading: false, error: null, progress: 0 });
  }, []);

  return { ...state, upload, deleteFile, reset };
}
