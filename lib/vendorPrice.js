/**
 * Safe vendor price helpers — never show ₪0 / NaN as real prices.
 */

import { pickEventPrice, cheapestEventPrice, eventAliases } from './eventTypes.js';

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

/** Products cloned from eventPrices (legacy CRM pushes) are not real packages. */
function isEventPriceMirror(vendor, product) {
  const prices = Array.isArray(vendor?.eventPrices) ? vendor.eventPrices : [];
  if (!prices.length) return false;
  const tagged = String(product?.eventType || '').trim();
  if (!tagged) return false;
  return prices.some((row) => row?.eventType === tagged);
}

function productFitsEvent(product, eventType) {
  const tagged = String(product?.eventType || '').trim();
  if (!tagged || !eventType) return true;
  return eventAliases(eventType).includes(tagged);
}

/** Packages the customer chooses between. These set the vendor's headline price. */
export function getPackages(vendor, eventType) {
  return (vendor?.products || []).filter((p) => (
    isSellable(p)
    && (p.kind || 'main') === 'main'
    && !isEventPriceMirror(vendor, p)
    && productFitsEvent(p, eventType)
  ));
}

/** Extras sold on top of a package. Never set the headline price. */
export function getAddons(vendor, eventType) {
  return (vendor?.products || []).filter((p) => (
    isSellable(p)
    && p.kind === 'addon'
    && !isEventPriceMirror(vendor, p)
    && productFitsEvent(p, eventType)
  ));
}

/** The package a vendor is advertised by: the cheapest one they offer. */
export function getCheapestPackage(vendor, eventType) {
  const packages = getPackages(vendor, eventType);
  if (!packages.length) return null;
  return packages.reduce((min, p) => (sortablePrice(p.price) < sortablePrice(min.price) ? p : min));
}

/**
 * Best display price for a vendor card/page: the cheapest package the vendor
 * offers, so the card never advertises a number the customer cannot actually
 * get. Falls back to the vendor-level price when there are no packages.
 * `isFrom` marks the price as a starting point rather than the whole story.
 */
export function getVendorDisplayPrice(vendor, eventType) {
  if (!vendor) {
    return { display: null, raw: null, original: null, originalDisplay: null, savings: null, isFrom: false };
  }

  const matchedEvent = pickEventPrice(vendor, eventType);
  const fallbackEvent = eventType ? null : cheapestEventPrice(vendor);
  const eventRow = matchedEvent || fallbackEvent;
  if (eventRow && parsePrice(eventRow.price)) {
    const raw = eventRow.price;
    const original = eventRow.originalPrice || vendor.originalPrice;
    const display = formatPrice(raw);
    const savings = getSavings(original, raw);
    const originalDisplay = savings != null ? formatPrice(original) : null;
    const eventCount = Array.isArray(vendor.eventPrices) ? vendor.eventPrices.length : 0;
    return {
      display,
      raw,
      original,
      originalDisplay,
      savings,
      isFrom: !matchedEvent && eventCount > 1,
    };
  }

  const packages = getPackages(vendor, eventType);
  const cheapest = getCheapestPackage(vendor, eventType);

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
export function getVendorDiscountBadge(vendor, eventType) {
  if (!vendor) return null;

  const eventRow = pickEventPrice(vendor, eventType) || (!eventType ? cheapestEventPrice(vendor) : null);
  const stored = eventRow?.discount ?? vendor.discount;
  const type = (eventRow?.discountType || vendor.discountType) === 'amount' ? 'amount' : 'percent';
  if (stored != null && String(stored).trim() !== '' && String(stored) !== '0') {
    return { value: String(stored).trim(), type };
  }

  const { savings, original, raw } = getVendorDisplayPrice(vendor, eventType);
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
