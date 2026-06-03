let cloudinary = null;
let configured = false;

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

async function getCloudinary() {
  if (!cloudinary) {
    const mod = await import('cloudinary');
    cloudinary = mod.v2;
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    configured = true;
  }
  return cloudinary;
}

function getResourceType(ext) {
  const video = new Set(['mp4', 'mov', 'webm', 'avi']);
  const raw = new Set(['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx']);
  if (video.has(ext)) return 'video';
  if (raw.has(ext)) return 'raw';
  return 'image';
}

/**
 * Upload a file buffer to Cloudinary.
 * @returns {Promise<{ url: string, fileName: string }>}
 */
export async function uploadBufferToCloudinary(buffer, { originalName, uploadType = 'image', folder = 'fiesta-vendors' }) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials not configured');
  }

  const cld = await getCloudinary();
  const ext = (originalName.split('.').pop() || '').toLowerCase();
  const resourceType = uploadType === 'document' ? getResourceType(ext) : 'image';
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '');
  const publicId = `${folder}/${safeName}_${Date.now()}`;

  const result = await cld.uploader.upload(
    `data:application/octet-stream;base64,${buffer.toString('base64')}`,
    {
      public_id: publicId,
      resource_type: resourceType,
      overwrite: true,
    }
  );

  return { url: result.secure_url, fileName: originalName };
}
