import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { supabase, BUCKETS, BucketName, getPublicUrl } from '@/lib/storage/supabase';
import crypto from 'crypto';

// Image MIME types including iPhone formats
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'image/heic', 'image/heif', 'image/svg+xml', 'image/bmp', 'image/tiff',
];

function isImageFile(file: File): boolean {
  // Check MIME type
  if (file.type && (file.type.startsWith('image/') || ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()))) {
    return true;
  }
  // Fallback: check file extension for iPhone photos that may lack MIME type
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'svg', 'bmp', 'tiff'].includes(ext);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Look up user ID from email (JWT strategy may not have id)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: { message: 'Storage not configured', code: 'STORAGE_NOT_CONFIGURED' } },
        { status: 503 }
      );
    }

    const bucket = request.nextUrl.searchParams.get('bucket') as BucketName | null;
    if (!bucket || !BUCKETS[bucket]) {
      return NextResponse.json(
        { error: { message: 'Invalid bucket. Must be one of: avatars, covers, reviews, posts', code: 'INVALID_BUCKET' } },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json(
        { error: { message: 'No file provided', code: 'NO_FILE' } },
        { status: 400 }
      );
    }

    if (!isImageFile(file)) {
      return NextResponse.json(
        { error: { message: `Only image files are allowed. Got: ${file.type || 'unknown type'}, name: ${file.name}`, code: 'INVALID_FILE_TYPE' } },
        { status: 400 }
      );
    }

    const bucketConfig = BUCKETS[bucket];
    if (file.size > bucketConfig.maxSize) {
      const maxMB = bucketConfig.maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: { message: `File too large. Maximum size is ${maxMB}MB`, code: 'FILE_TOO_LARGE' } },
        { status: 400 }
      );
    }

    // Normalize extension for HEIC -> jpg since Supabase serves them as-is
    let ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = file.type || 'image/jpeg';

    const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(bucketConfig.name)
      .upload(fileName, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: { message: 'Upload failed', code: 'UPLOAD_FAILED' } },
        { status: 500 }
      );
    }

    const url = getPublicUrl(bucketConfig.name, fileName);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: { message: 'Storage not configured', code: 'STORAGE_NOT_CONFIGURED' } },
        { status: 503 }
      );
    }

    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: { message: 'URL is required', code: 'INVALID_REQUEST' } },
        { status: 400 }
      );
    }

    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
    if (!match) {
      return NextResponse.json(
        { error: { message: 'Invalid file URL', code: 'INVALID_URL' } },
        { status: 400 }
      );
    }

    const [, bucketName, path] = match;

    if (!path.startsWith(user.id + '/')) {
      return NextResponse.json(
        { error: { message: 'Not authorized to delete this file', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: { message: 'Delete failed', code: 'DELETE_FAILED' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('DELETE /api/upload error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
