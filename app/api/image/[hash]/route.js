import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { getImage, isInlineContentType } from '@/lib/imageStore';

export const dynamic = 'force-dynamic';

/**
 * Serves a file out of MongoDB.
 *
 * The path segment is the SHA-256 of the bytes, so a given URL can only ever
 * return one payload. That lets us promise the CDN it will never change: the
 * edge answers virtually every request, and the free-tier cluster only sees the
 * first miss per region. Without this header the 10 GB weekly transfer cap would
 * become the site's bottleneck.
 */
const IMMUTABLE = 'public, max-age=31536000, s-maxage=31536000, immutable';

export async function GET(request, { params }) {
  const { hash } = params;
  const etag = `"${hash}"`;

  // Content is immutable, so a matching validator needs no database round-trip.
  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, {
      status: 304,
      headers: { ETag: etag, 'Cache-Control': IMMUTABLE },
    });
  }

  try {
    await dbConnect();
    const file = await getImage(mongoose.connection.db, hash);

    if (!file) {
      return new Response('Not found', {
        status: 404,
        headers: { 'Cache-Control': 'public, max-age=60' },
      });
    }

    const disposition = isInlineContentType(file.contentType) ? 'inline' : 'attachment';
    const headers = {
      'Content-Type': file.contentType,
      'Content-Length': String(file.data.length),
      'Cache-Control': IMMUTABLE,
      ETag: etag,
      'X-Content-Type-Options': 'nosniff',
    };

    if (file.fileName) {
      headers['Content-Disposition'] =
        `${disposition}; filename*=UTF-8''${encodeURIComponent(file.fileName)}`;
    }

    return new Response(file.data, { status: 200, headers });
  } catch (error) {
    console.error('Image serve error:', error);
    return new Response('Error', { status: 500 });
  }
}
