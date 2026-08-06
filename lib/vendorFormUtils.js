import { getAdminHeaders } from '@/lib/getAdminHeaders';
import { compressImageFile } from '@/lib/compressImageFile';
import { toAmount } from '@/lib/pricing';

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
  commissionPercent: '',
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

/** Cheapest active package — the offer the vendor card advertises. */
export function getBaseProduct(products) {
  return (products || [])
    .filter((p) => p.active !== false && (p.kind || 'main') === 'main' && toAmount(p.price) > 0)
    .sort((a, b) => toAmount(a.price) - toAmount(b.price))[0];
}

/** If prices show a real gap but discount was left at 0, fill it in. */
export function syncDiscountFromPrices(form) {
  const next = { ...form };
  const orig = toAmount(next.originalPrice);
  const price = toAmount(next.price);
  const disc = Number(next.discount) || 0;
  if (orig > 0 && price > 0 && price < orig && disc <= 0) {
    next.discount =
      next.discountType === 'amount'
        ? String(Math.round(orig - price))
        : String(Math.round((1 - price / orig) * 100));
  }
  return next;
}

export function buildVendorPayload(form) {
  const payload = syncDiscountFromPrices({ ...form });
  // Client-only mirrors of Mongo _id — must not be written back.
  delete payload.id;
  delete payload._id;

  if (!payload.price && payload.originalPrice) {
    payload.price = String(Math.round(calculateClientPrice(payload)));
  }

  // Once a vendor has packages they are the source of truth. Mirroring the base
  // package onto the vendor keeps the commission reports in /admin working,
  // since a closed lead still points at the vendor rather than a product.
  const base = getBaseProduct(payload.products);
  if (base) {
    payload.price = String(base.price);
    payload.originalPrice = String(base.originalPrice || base.price);
    payload.commissionAmount = Number(base.commissionAmount) || 0;
    payload.mainProductId = base.id;
  }

  return syncDiscountFromPrices(payload);
}
