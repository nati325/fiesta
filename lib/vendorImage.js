/** Empty by default — never invent stock/Unsplash photos for vendors. */
export function mediaPathToFiestaVendorPath(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed.startsWith('/media/suppliers/')) return trimmed;

  const parts = trimmed.split('/').filter(Boolean);
  const fileName = parts[parts.length - 1];
  const folder = parts[parts.length - 2] || 'supplier';
  return `/images/vendors/${folder.replace(/[^\w.-]/g, '_')}_${fileName}`;
}

export function resolveVendorImage(url, fallback = '') {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback || '';

  const trimmed = url.trim();
  if (trimmed === '0') return fallback || '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

  // Files stored in MongoDB are served by this app and must never be rewritten
  // onto the scraping dashboard's host.
  if (trimmed.startsWith('/api/image/')) return trimmed;

  if (trimmed.startsWith('/media/')) {
    const mapped = mediaPathToFiestaVendorPath(trimmed);
    return mapped || fallback || '';
  }

  const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (trimmed.startsWith('/') && mediaBase) {
    return `${mediaBase.replace(/\/$/, '')}${trimmed}`;
  }

  return trimmed || fallback || '';
}

export function resolvePortfolioImage(item, fallback = '') {
  if (!item) return fallback || '';
  if (typeof item === 'string') return resolveVendorImage(item, fallback);
  return resolveVendorImage(item.image, fallback);
}

export function hasRealImage(url) {
  const resolved = resolveVendorImage(url, '');
  return !!(resolved && resolved.trim());
}

/** Homepage vendor cards — real photo only, never a stock fill. */
export function resolveHomepageVendorImage(url) {
  return resolveVendorImage(url, '');
}
