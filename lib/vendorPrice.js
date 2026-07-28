/**
 * Safe vendor price helpers — never show ₪0 / NaN as real prices.
 */

function toFiniteNumber(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  const cleaned = String(value).replace(/[^\d.]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Parse a single price; returns null for 0 / empty / invalid. */
export function parsePrice(value) {
  if (value == null || value === '') return null;
  const str = String(value).trim();
  if (!str || str === '0' || /^0(\.0+)?$/.test(str)) return null;
  if (/^\d[\d,\s]*\s*[-–—]\s*\d/.test(str)) return null;
  return toFiniteNumber(str);
}

/** Detect and parse price ranges e.g. "4500-10000". */
export function parsePriceRange(value) {
  if (value == null || value === '') return null;
  const str = String(value).trim();
  const m = str.match(/^(\d[\d,]*)\s*[-–—]\s*(\d[\d,]*)$/);
  if (!m) return null;
  const min = toFiniteNumber(m[1]);
  const max = toFiniteNumber(m[2]);
  if (!min || !max) return null;
  return { min, max };
}

function formatIls(n) {
  return `₪${Math.round(n).toLocaleString('he-IL')}`;
}

/**
 * Format any price field for display.
 * @returns {string|null}
 */
export function formatPrice(value) {
  const range = parsePriceRange(value);
  if (range) return `${formatIls(range.min)}–${formatIls(range.max)}`;
  const n = parsePrice(value);
  if (n == null) return null;
  return formatIls(n);
}

/**
 * Best display price for a vendor card/page.
 * Prefer main product only when it has a valid price.
 */
export function getVendorDisplayPrice(vendor) {
  if (!vendor) {
    return { display: null, raw: null, original: null, originalDisplay: null, savings: null };
  }

  const mainProduct =
    vendor.products?.find((p) => p.id === vendor.mainProductId) ||
    (vendor.products && vendor.products.length > 0 ? vendor.products[0] : null);

  const useProduct = hasValidPrice(mainProduct?.price);
  const raw = useProduct ? mainProduct.price : vendor.price;
  const original = useProduct
    ? mainProduct.originalPrice || vendor.originalPrice
    : vendor.originalPrice;

  const display = formatPrice(raw);
  const savings = getSavings(original, raw);
  const originalDisplay = savings != null ? formatPrice(original) : null;

  return { display, raw, original, originalDisplay, savings };
}

/** Numeric savings only when both sides are valid single prices. */
export function getSavings(original, price) {
  const o = parsePrice(original);
  const p = parsePrice(price);
  if (o == null || p == null || o <= p) return null;
  return Math.round(o - p);
}

/** True if product/service row should show a price. */
export function hasValidPrice(value) {
  return formatPrice(value) != null;
}
