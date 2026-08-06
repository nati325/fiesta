const HOMEPAGE_FALLBACK =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

/** Empty by default — no stock/category placeholders outside homepage. */
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

/** Homepage vendor cards only — keep a visual fill when vendor has no photo. */
export function resolveHomepageVendorImage(url, categoryFallback = '') {
  return resolveVendorImage(url, categoryFallback || HOMEPAGE_FALLBACK);
}

export { HOMEPAGE_FALLBACK };
