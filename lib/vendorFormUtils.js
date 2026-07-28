import { getAdminHeaders } from '@/lib/getAdminHeaders';
import { compressImageFile } from '@/lib/compressImageFile';

export const DOCUMENT_ACCEPT =
  '.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.heic,.gif,.txt,.xls,.xlsx,.mp4,.mov,.webm';

export const QUICK_VENDOR_DEFAULTS = {
  name: '',
  type: 'design',
  contact: '',
  region: 'מרכז',
  description: '',
  image: '',
  originalPrice: '',
  price: '',
  discount: '',
  discountType: 'percent',
  commissionAmount: '',
  agreementSigned: false,
  agreementImage: '',
  googleReviewsLink: '',
  googleRating: 0,
  googleReviewsCount: 0,
  eventTypes: ['חתונה'],
  priceIncludesVat: true,
  adminNotes: '',
  instagramLink: '',
  videos: [],
  products: [],
  mainProductId: '',
};

export function calculateClientPrice(form) {
  const orig = Number(form.originalPrice) || 0;
  const disc = Number(form.discount) || 0;
  if (form.discountType === 'percent') {
    return orig - orig * (disc / 100);
  }
  return orig - disc;
}

export async function uploadVendorFile(file, uploadType) {
  let ready = file;
  if (uploadType === 'image' || file?.type?.startsWith('image/')) {
    try {
      ready = await compressImageFile(file);
    } catch {
      ready = file;
    }
  }

  const formData = new FormData();
  formData.append('file', ready);
  formData.append('type', uploadType);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: getAdminHeaders(false),
    credentials: 'include',
    body: formData,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    throw new Error(res.status === 413 ? 'הקובץ גדול מדי לשרת' : 'שגיאה בהעלאה');
  }

  if (!res.ok || !data.url) {
    throw new Error(data.error || data.message || 'שגיאה בהעלאה');
  }
  return data;
}

export function buildVendorPayload(form) {
  const payload = { ...form };
  if (!payload.price && payload.originalPrice) {
    payload.price = String(Math.round(calculateClientPrice(payload)));
  }
  return payload;
}
