/** Slugs must match /category/[type] and the public site. */
export const VENDOR_CATEGORIES = [
  { value: 'venue', label: 'אולמות וגנים' },
  { value: 'dj', label: 'DJ ומוזיקה' },
  { value: 'photographer', label: 'צילום אירועים' },
  { value: 'design', label: 'עיצוב אירועים' },
  { value: 'catering', label: 'קייטרינג' },
  { value: 'makeup', label: 'איפור' },
  { value: 'dresses', label: 'שמלות כלה' },
  { value: 'suits', label: 'חליפות חתן' },
  { value: 'hair', label: 'עיצוב שיער' },
  { value: 'bar', label: 'שירותי בר' },
  { value: 'alcohol', label: 'אלכוהול ובר' },
  { value: 'rings', label: 'טבעות נישואין' },
  { value: 'transportation', label: 'הסעות' },
  { value: 'cars', label: 'רכבי יוקרה' },
  { value: 'singers', label: 'זמרים ולהקות' },
  { value: 'attractions', label: 'אטרקציות' },
  { value: 'event-production', label: 'הפקת אירועים' },
  { value: 'invitations', label: 'הזמנות' },
  { value: 'rabbi', label: 'רב לחופה' },
  { value: 'cantors', label: 'חזנים ופייטנים' },
  { value: 'religious-bands', label: 'להקות דתיות' },
  { value: 'challa', label: 'הפרשת חלה' },
  { value: 'hotels', label: 'מלונות' },
  { value: 'getting-ready', label: 'התארגנות כלה' },
  { value: 'bachelor', label: 'מסיבות רווקים' },
  { value: 'souvenirs', label: 'מזכרות' },
  { value: 'bride-shoes', label: 'נעלי כלה' },
  { value: 'groom-shoes', label: 'נעלי חתן' },
  { value: 'equipment-rental', label: 'השכרת ציוד' },
  { value: 'rsvp', label: 'אישורי הגעה' },
  { value: 'dietitians', label: 'תזונה ודיאטה' },
  { value: 'personal-training', label: 'כושר ואימון' },
];

export function getCategoryLabel(type) {
  return VENDOR_CATEGORIES.find((c) => c.value === type)?.label || type;
}

/** Old admin slugs → site slugs */
export const LEGACY_VENDOR_TYPE_MAP = {
  photography: 'photographer',
  music: 'dj',
  'family-vip': 'design',
};

export function normalizeVendorType(type) {
  if (!type) return 'design';
  return LEGACY_VENDOR_TYPE_MAP[type] || type;
}

export const VALID_VENDOR_TYPES = new Set(VENDOR_CATEGORIES.map((c) => c.value));
