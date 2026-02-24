import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase storage not configured: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  : null;

export const BUCKETS = {
  avatars: { name: 'avatars', maxSize: 2 * 1024 * 1024 },
  covers: { name: 'covers', maxSize: 5 * 1024 * 1024 },
  reviews: { name: 'reviews', maxSize: 5 * 1024 * 1024 },
  posts: { name: 'posts', maxSize: 5 * 1024 * 1024 },
} as const;

export type BucketName = keyof typeof BUCKETS;

export function getPublicUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
