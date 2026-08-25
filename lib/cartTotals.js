import { getVendorDisplayPrice, parsePrice } from '@/lib/vendorPrice';
import { normalizeVendorType } from '@/lib/vendorCategories';
import { getSupplierTypeMeta } from '@/lib/supplierGroups';

export function getCartCategoryKey(vendor) {
  return normalizeVendorType(vendor?.type);
}

export function formatCartRange(min, max) {
  const low = Math.round(Number(min) || 0);
  const high = Math.round(Number(max) || 0);
  if (low <= 0 && high <= 0) return '';
  if (high <= 0 || low === high) return `₪${low.toLocaleString('he-IL')}`;
  return `₪${low.toLocaleString('he-IL')}–₪${high.toLocaleString('he-IL')}`;
}

export function groupCartVendors(cartVendors) {
  const groups = [];
  const indexByKey = new Map();

  (cartVendors || []).forEach((vendor) => {
    const key = getCartCategoryKey(vendor);
    if (!indexByKey.has(key)) {
      indexByKey.set(key, groups.length);
      groups.push({
        key,
        label: getSupplierTypeMeta(key).label,
        vendors: [],
      });
    }
    groups[indexByKey.get(key)].vendors.push(vendor);
  });

  return groups.map((group) => ({
    ...group,
    isChoice: group.vendors.length > 1,
  }));
}

function categoryRange(vendors, eventType) {
  const rows = vendors
    .map((vendor) => getVendorDisplayPrice(vendor, eventType))
    .map((info) => {
      const price = parsePrice(info.raw);
      if (price == null) return null;
      const savings = info.savings || 0;
      return { price, savings, original: price + savings };
    })
    .filter(Boolean);

  if (!rows.length) {
    return { priceMin: 0, priceMax: 0, savingsMin: 0, savingsMax: 0, originalMin: 0, originalMax: 0 };
  }

  const prices = rows.map((row) => row.price);
  const savings = rows.map((row) => row.savings);
  const originals = rows.map((row) => row.original);
  return {
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    savingsMin: Math.min(...savings),
    savingsMax: Math.max(...savings),
    originalMin: Math.min(...originals),
    originalMax: Math.max(...originals),
  };
}

/**
 * Cart is a shortlist, not a stack of bookings.
 * Several vendors in one category are a choice set — the customer takes one.
 * Category totals are ranges (min–max). Different categories add up:
 * overall min = sum of category mins, overall max = sum of category maxes.
 */
export function getCartTotals(cartVendors, eventType) {
  const groups = groupCartVendors(cartVendors);

  const categories = groups.map((group) => {
    const range = categoryRange(group.vendors, eventType);
    return {
      ...group,
      ...range,
      priceLabel: formatCartRange(range.priceMin, range.priceMax),
      savingsLabel: formatCartRange(range.savingsMin, range.savingsMax),
    };
  });

  const priceMin = categories.reduce((sum, group) => sum + group.priceMin, 0);
  const priceMax = categories.reduce((sum, group) => sum + group.priceMax, 0);
  const savingsMin = categories.reduce((sum, group) => sum + group.savingsMin, 0);
  const savingsMax = categories.reduce((sum, group) => sum + group.savingsMax, 0);
  const originalMin = categories.reduce((sum, group) => sum + group.originalMin, 0);
  const originalMax = categories.reduce((sum, group) => sum + group.originalMax, 0);

  return {
    priceMin,
    priceMax,
    savingsMin,
    savingsMax,
    originalMin,
    originalMax,
    price: priceMax,
    savings: savingsMax,
    original: originalMax,
    isRange: priceMin !== priceMax || savingsMin !== savingsMax,
    isEstimate: categories.some((group) => group.isChoice),
    priceLabel: formatCartRange(priceMin, priceMax),
    savingsLabel: formatCartRange(savingsMin, savingsMax),
    originalLabel: formatCartRange(originalMin, originalMax),
    categories,
  };
}
