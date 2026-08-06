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

/** Comparable number for sorting; ranges sort by their lower bound. */
function sortablePrice(value) {
  const range = parsePriceRange(value);
  if (range) return range.min;
  return parsePrice(value) ?? Number.POSITIVE_INFINITY;
}

function isSellable(product) {
  return product?.active !== false && hasValidPrice(product?.price);
}

/** Packages the customer chooses between. These set the vendor's headline price. */
export function getPackages(vendor) {
  return (vendor?.products || []).filter((p) => isSellable(p) && (p.kind || 'main') === 'main');
}

/** Extras sold on top of a package. Never set the headline price. */
export function getAddons(vendor) {
  return (vendor?.products || []).filter((p) => isSellable(p) && p.kind === 'addon');
}

/** The package a vendor is advertised by: the cheapest one they offer. */
export function getCheapestPackage(vendor) {
  const packages = getPackages(vendor);
  if (!packages.length) return null;
  return packages.reduce((min, p) => (sortablePrice(p.price) < sortablePrice(min.price) ? p : min));
}

/**
 * Best display price for a vendor card/page: the cheapest package the vendor
 * offers, so the card never advertises a number the customer cannot actually
 * get. Falls back to the vendor-level price when there are no packages.
 * `isFrom` marks the price as a starting point rather than the whole story.
 */
export function getVendorDisplayPrice(vendor) {
  if (!vendor) {
    return { display: null, raw: null, original: null, originalDisplay: null, savings: null, isFrom: false };
  }

  const packages = getPackages(vendor);
  const cheapest = getCheapestPackage(vendor);

  const raw = cheapest ? cheapest.price : vendor.price;
  const original = cheapest
    ? cheapest.originalPrice || vendor.originalPrice
    : vendor.originalPrice;

  const display = formatPrice(raw);
  const savings = getSavings(original, raw);
  const originalDisplay = savings != null ? formatPrice(original) : null;

  return { display, raw, original, originalDisplay, savings, isFrom: packages.length > 1 };
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

/**
 * Discount badge for cards/pages.
 * Prefer the stored discount field; if it is missing/0 but there is a real
 * price gap, derive % (or ₪) so the site matches what the customer saves.
 */
export function getVendorDiscountBadge(vendor) {
  if (!vendor) return null;

  const stored = vendor.discount;
  const type = vendor.discountType === 'amount' ? 'amount' : 'percent';
  if (stored != null && String(stored).trim() !== '' && String(stored) !== '0') {
    return { value: String(stored).trim(), type };
  }

  const { savings, original, raw } = getVendorDisplayPrice(vendor);
  if (savings == null) return null;

  if (type === 'amount') {
    return { value: String(savings), type: 'amount' };
  }

  const o = parsePrice(original);
  const p = parsePrice(raw);
  if (o == null || p == null || o <= p) return null;
  const pct = Math.round((1 - p / o) * 100);
  if (pct <= 0) return null;
  return { value: String(pct), type: 'percent' };
}
