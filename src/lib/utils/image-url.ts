export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  if (!url) return '';
  if (!url.includes('supabase.co/storage/v1/object/public/')) return url;

  const { width, height, quality = 75 } = options;
  const transformUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  if (height) params.set('height', String(height));
  params.set('quality', String(quality));
  params.set('format', 'origin');
  return `${transformUrl}?${params.toString()}`;
}

export const IMAGE_SIZES = {
  cardThumb: { width: 400, height: 300, quality: 75 },
  cardFull: { width: 800, height: 600, quality: 80 },
  carousel: { width: 1200, height: 800, quality: 85 },
  thumbnail: { width: 128, height: 128, quality: 70 },
  avatar: { width: 96, height: 96, quality: 75 },
  cover: { width: 1200, height: 400, quality: 80 },
} as const;
