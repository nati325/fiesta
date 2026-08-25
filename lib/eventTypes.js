/** Canonical event types on the customer site and in the CRM push wizard. */

export const ALL_EVENTS_LABEL = 'מתאים לכל האירועים';

export const FIESTA_EVENT_TYPES = [
  'חתונה',
  'בר מצווה',
  'בת מצווה',
  'ברית',
  'אירוע עסקי',
  'יום הולדת',
];

export function eventAliases(pref) {
  const value = String(pref || '').trim();
  if (!value) return [];
  if (value === 'בר/בת מצווה' || value === 'בר מצווה' || value === 'בת מצווה') {
    return ['בר מצווה', 'בת מצווה', 'בר/בת מצווה'];
  }
  if (value === 'ברית' || value === 'בריתה' || value === 'בריתות') {
    return ['ברית', 'בריתה', 'בריתות'];
  }
  if (value === 'אירוע עסקי' || value === 'אירועים עסקיים') {
    return ['אירוע עסקי', 'אירועים עסקיים'];
  }
  return [value];
}

export function vendorEventTypes(vendor) {
  return Array.isArray(vendor?.eventTypes) ? vendor.eventTypes.filter(Boolean) : [];
}

export function vendorFitsAllEvents(vendor) {
  return vendorEventTypes(vendor).includes(ALL_EVENTS_LABEL);
}

/** True once an agent/admin actually chose event types. Legacy rows without this stay unscoped until a customer has chosen an event. */
export function vendorHasExplicitEventTypes(vendor) {
  if (!vendor) return false;
  if (vendor.eventTypesExplicit) return true;
  if (Array.isArray(vendor.eventPrices) && vendor.eventPrices.length) return true;
  return vendorEventTypes(vendor).includes(ALL_EVENTS_LABEL);
}

export function pickEventPrice(vendor, eventPreference) {
  const list = Array.isArray(vendor?.eventPrices) ? vendor.eventPrices : [];
  if (!list.length) return null;
  if (!eventPreference) return null;
  const aliases = eventAliases(eventPreference);
  return list.find((row) => aliases.includes(row?.eventType)) || null;
}

/**
 * After the customer picks an event, only vendors for that event (or also for
 * that event, including "all events") should appear — at that event's price.
 */
export function vendorFitsEvent(vendor, eventPreference) {
  if (!eventPreference) return true;
  if (!vendor) return false;
  if (vendorFitsAllEvents(vendor)) return true;
  const aliases = eventAliases(eventPreference);
  if (aliases.some((alias) => vendorEventTypes(vendor).includes(alias))) return true;
  return Boolean(pickEventPrice(vendor, eventPreference));
}

export function filterVendorsForEvent(vendors, eventPreference) {
  if (!eventPreference) return Array.isArray(vendors) ? vendors : [];
  return (vendors || []).filter((vendor) => vendorFitsEvent(vendor, eventPreference));
}

export function cheapestEventPrice(vendor) {
  const list = (Array.isArray(vendor?.eventPrices) ? vendor.eventPrices : []).filter(
    (row) => row && String(row.price || '').trim() && String(row.price) !== '0'
  );
  if (!list.length) return null;
  return list.slice().sort((a, b) => {
    const av = Number(String(a.price).replace(/[^\d.]/g, '')) || 0;
    const bv = Number(String(b.price).replace(/[^\d.]/g, '')) || 0;
    return av - bv;
  })[0];
}

export function formatEventTypesLabel(vendor) {
  const events = vendorEventTypes(vendor);
  if (!events.length || events.includes(ALL_EVENTS_LABEL)) return 'כל האירועים';
  return events.join(' · ');
}

export function normalizeEventTypes({ fitsAllEvents, eventTypes } = {}) {
  if (fitsAllEvents) return [ALL_EVENTS_LABEL];
  const selected = [...new Set((eventTypes || []).map((t) => String(t || '').trim()).filter(Boolean))];
  return selected.length ? selected : [ALL_EVENTS_LABEL];
}
