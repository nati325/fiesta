let cloudinary = null;
let configured = false;

const CLOUDINARY_DEFAULTS = {
  cloud_name: 'dek0tfcbr',
  api_key: '678917124175759',
  api_secret: 'DZ9CokBNV6HavSCsgCpMnMlBtO4',
};

function getCloudinaryCredentials() {
  return {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || CLOUDINARY_DEFAULTS.cloud_name,
    api_key: process.env.CLOUDINARY_API_KEY || CLOUDINARY_DEFAULTS.api_key,
    api_secret: process.env.CLOUDINARY_API_SECRET || CLOUDINARY_DEFAULTS.api_secret,
  };
}

export function isCloudinaryConfigured() {
  const { cloud_name, api_key, api_secret } = getCloudinaryCredentials();
  return Boolean(cloud_name && api_key && api_secret);
}

async function getCloudinary() {
  if (!cloudinary) {
    const mod = await import('cloudinary');
    cloudinary = mod.v2;
  }
  if (!configured) {
    cloudinary.config(getCloudinaryCredentials());
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
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '') || 'upload';
  const publicId = `${folder}/${safeName}_${Date.now()}`;

  const result = await new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
        folder: undefined,
      },
      (err, res) => {
        if (err) reject(err);
        else resolve(res);
      }
    );
    stream.end(buffer);
  });

  return { url: result.secure_url, fileName: originalName };
}
