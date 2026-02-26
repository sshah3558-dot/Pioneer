/**
 * Client-side image compression using Canvas API.
 * Resizes and compresses images to fit within a target file size.
 */

interface CompressOptions {
  maxSizeBytes: number;
  maxWidth?: number;
  maxHeight?: number;
}

export async function compressImage(file: File, options: CompressOptions): Promise<File> {
  const { maxSizeBytes, maxWidth = 2048, maxHeight = 2048 } = options;

  // If already under the limit, return as-is
  if (file.size <= maxSizeBytes) {
    return file;
  }

  // Load image into an HTMLImageElement
  const img = await loadImage(file);

  // Calculate new dimensions preserving aspect ratio
  let { width, height } = img;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Try decreasing quality until under maxSizeBytes
  const qualities = [0.8, 0.6, 0.4, 0.2];
  for (const quality of qualities) {
    const blob = await canvasToBlob(img, width, height, quality);
    if (blob.size <= maxSizeBytes) {
      return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
        type: 'image/jpeg',
      });
    }
  }

  // Last resort: further reduce dimensions by half and use lowest quality
  const lastBlob = await canvasToBlob(
    img,
    Math.round(width / 2),
    Math.round(height / 2),
    0.2
  );
  return new File([lastBlob], file.name.replace(/\.[^.]+$/, '.jpg'), {
    type: 'image/jpeg',
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      'image/jpeg',
      quality
    );
  });
}
