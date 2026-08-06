/**
 * Cloudinary is retired. All vendor files go through lib/imageStore.js
 * (MongoDB `images` collection) and are served from /api/image/<hash>.
 *
 * These stubs remain so any leftover script import fails loudly instead of
 * silently uploading to a third-party CDN.
 */

export function isCloudinaryConfigured() {
  return false;
}

export async function uploadBufferToCloudinary() {
  throw new Error(
    'Cloudinary בוטל. השתמשו ב-putImage מ-lib/imageStore.js (מונגו fiesta.images).'
  );
}

export async function uploadToCloudinary() {
  return uploadBufferToCloudinary();
}

export async function uploadRemoteImageToCloudinary() {
  return uploadBufferToCloudinary();
}

export async function ensureCloudUrl(url) {
  // Pass through — callers that still expect a remote URL must migrate to putImage.
  return url || '';
}
