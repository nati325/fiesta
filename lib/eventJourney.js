/** Core journey categories for Fiesta personal path. */
export const JOURNEY_CATEGORIES = [
  { id: 'venue', label: 'אולם / מקום', short: 'אולם', icon: 'fa-building' },
  { id: 'dj', label: 'DJ ומוזיקה', short: 'DJ', icon: 'fa-music' },
  { id: 'photographer', label: 'צילום', short: 'צילום', icon: 'fa-camera-retro' },
  { id: 'design', label: 'עיצוב', short: 'עיצוב', icon: 'fa-palette' },
  { id: 'alcohol', label: 'אלכוהול ובר', short: 'אלכוהול', icon: 'fa-glass-cheers' },
  { id: 'attractions', label: 'אטרקציות', short: 'אטרקציות', icon: 'fa-wand-magic-sparkles' },
  { id: 'catering', label: 'קייטרינג', short: 'קייטרינג', icon: 'fa-utensils' },
  { id: 'invitations', label: 'הזמנות', short: 'הזמנות', icon: 'fa-envelope-open-text' },
];

export function getVendorCategoryId(vendor) {
  if (!vendor) return null;
  if (vendor.type) return String(vendor.type);
  if (Array.isArray(vendor.types) && vendor.types[0]) return String(vendor.types[0]);
  return null;
}

/**
 * Build journey progress from closed categories + cart vendor picks.
 * status: done (closed externally), selected (in cart), open
 */
export function buildJourneyProgress({ completedCategories = [], cartVendors = [] } = {}) {
  const closed = new Set((completedCategories || []).map(String));
  const selectedByType = new Map();

  (cartVendors || []).forEach((vendor) => {
    const type = getVendorCategoryId(vendor);
    if (!type) return;
    if (!selectedByType.has(type)) selectedByType.set(type, []);
    selectedByType.get(type).push(vendor);
  });

  const items = JOURNEY_CATEGORIES.map((cat) => {
    if (closed.has(cat.id)) {
      return { ...cat, status: 'done', vendors: [] };
    }
    if (selectedByType.has(cat.id)) {
      return { ...cat, status: 'selected', vendors: selectedByType.get(cat.id) };
    }
    return { ...cat, status: 'open', vendors: [] };
  });

  const next = items.find((item) => item.status === 'open') || null;
  const doneCount = items.filter((item) => item.status === 'done' || item.status === 'selected').length;

  return {
    items,
    next,
    doneCount,
    total: items.length,
  };
}

export function formatBudget(value) {
  const n = Number(String(value || '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  return `₪${Math.round(n).toLocaleString('he-IL')}`;
}

export function formatEventDate(value) {
  if (!value) return null;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('he-IL');
  } catch {
    return value;
  }
}
