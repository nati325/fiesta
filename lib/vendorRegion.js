/** Canonical region chips used by search + admin. */
export const VENDOR_REGIONS = ['מרכז', 'צפון', 'דרום', 'כל הארץ'];

/** Unique list of regions for a vendor (supports legacy `region` + `regions[]`). */
export function getVendorRegions(vendor) {
  const list = [
    ...(Array.isArray(vendor?.regions) ? vendor.regions : []),
    vendor?.region,
  ]
    .map((r) => String(r || '').trim())
    .filter(Boolean);
  return [...new Set(list)];
}

export function formatVendorRegions(vendor) {
  return getVendorRegions(vendor).join(' · ');
}

/**
 * Does this vendor appear when the user filters by `area`?
 * Empty region = show everywhere (legacy behaviour).
 */
export function vendorMatchesArea(vendor, area) {
  const a = String(area || '').trim();
  if (!a || a === 'כל הארץ') return true;
  const regions = getVendorRegions(vendor);
  if (!regions.length) return true;
  if (regions.includes('כל הארץ')) return true;
  return regions.some((r) => r === a || r.includes(a));
}
