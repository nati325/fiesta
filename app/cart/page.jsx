'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useVendors } from '@/context/VendorContext';
import { useAuth } from '@/context/AuthContext';
import { getCheapestPackage, getVendorDisplayPrice } from '@/lib/vendorPrice';
import { getSupplierTypeMeta } from '@/lib/supplierGroups';
import { resolveVendorImage } from '@/lib/vendorImage';
import { formatVendorRegions } from '@/lib/vendorRegion';
import { vendorHasCategory } from '@/lib/vendorCategories';
import { getCartTotals } from '@/lib/cartTotals';
import HomeStepVisual from '@/components/HomeStepVisual';
import VendorCardImage from '@/components/VendorCardImage';

const WA_PHONE = '972535378985';

const CORE_EVENT = [
  { type: 'venue', short: 'אולם' },
  { type: 'dj', short: 'DJ' },
  { type: 'photographer', short: 'צילום' },
  { type: 'design', short: 'עיצוב' },
];

const toShekels = (amount) => `₪${Math.round(amount).toLocaleString('he-IL')}`;

function vendorCartId(vendor) {
  return String(vendor?.id || vendor?._id || '');
}

function Flourish() {
  return (
    <div className="cart-scene__flourish" aria-hidden>
      <svg viewBox="0 0 140 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 9h46" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M86 9h46" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M70 2.2L73.8 9 70 15.8 66.2 9 70 2.2Z" fill="currentColor" />
        <path d="M62 9h6M72 9h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function formatEventDate(value) {
  if (!value) return '';
  const parts = String(value).split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return value;
}

export default function CartPage() {
  const { vendors, loading, cart, removeFromCart, clearCart, replaceCart } = useVendors();
  const { eventPreference, eventProfile, hasOnboarded } = useAuth();
  const [lead, setLead] = useState({
    name: '',
    phone: '',
    date: eventProfile.date || '',
  });
  const [sent, setSent] = useState(false);
  const [undo, setUndo] = useState(null);
  const undoTimer = useRef(null);

  useEffect(() => {
    if (!eventProfile.date) return;
    setLead((prev) => (prev.date ? prev : { ...prev, date: eventProfile.date }));
  }, [eventProfile.date]);

  useEffect(() => () => {
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
  }, []);

  const cartVendors = useMemo(
    () => vendors.filter((vendor) => {
      const id = vendorCartId(vendor);
      return id && cart.includes(id);
    }),
    [vendors, cart],
  );

  const totals = useMemo(() => getCartTotals(cartVendors), [cartVendors]);
  const cartGroups = totals.categories;

  const guestCount = Number(String(eventProfile.guests || '').replace(/[^\d]/g, ''));
  const eventFacts = useMemo(() => [
    eventPreference,
    eventProfile.date ? formatEventDate(eventProfile.date) : null,
    eventProfile.region,
    Number.isFinite(guestCount) && guestCount > 0
      ? `${guestCount.toLocaleString('he-IL')} מוזמנים`
      : null,
  ].filter(Boolean), [eventPreference, eventProfile.date, eventProfile.region, guestCount]);

  const eventCore = useMemo(
    () => CORE_EVENT.map((item, index) => {
      const count = cartVendors.filter((vendor) => vendorHasCategory(vendor, item.type)).length;
      return {
        ...item,
        n: String(index + 1).padStart(2, '0'),
        on: count > 0,
        count,
      };
    }),
    [cartVendors],
  );

  const showUndo = (payload) => {
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    setUndo(payload);
    undoTimer.current = window.setTimeout(() => setUndo(null), 6000);
  };

  const restoreUndo = () => {
    if (!undo) return;
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    if (undo.type === 'clear') {
      replaceCart(undo.ids);
    } else {
      const next = [...cart];
      const at = Math.min(undo.index ?? next.length, next.length);
      next.splice(at, 0, undo.ids[0]);
      replaceCart(next);
    }
    setUndo(null);
  };

  const handleRemove = (vendor) => {
    const id = vendorCartId(vendor);
    const index = cart.indexOf(id);
    removeFromCart(id);
    showUndo({
      type: 'remove',
      ids: [id],
      index: index < 0 ? cart.length : index,
      name: vendor.name,
    });
  };

  const handleClear = () => {
    showUndo({ type: 'clear', ids: [...cart] });
    clearCart();
  };

  const submitLead = (event) => {
    event.preventDefault();
    const vendorList = cartGroups
      .map((group) => {
        const heading = group.isChoice
          ? `${group.label} — מבחר, לוקחים אחד:`
          : `${group.label}:`;
        const lines = group.vendors.map((vendor) => {
          const price = getVendorDisplayPrice(vendor);
          return `• ${vendor.name}${price.display ? ` — ${price.display}` : ''}`;
        });
        return [heading, ...lines].join('\n');
      })
      .join('\n\n');
    const message = [
      'היי Fiesta, סיימתי לבחור ספקים ורוצה להתקדם.',
      '',
      `שם: ${lead.name}`,
      `טלפון: ${lead.phone}`,
      eventPreference ? `סוג אירוע: ${eventPreference}` : null,
      lead.date ? `תאריך אירוע: ${lead.date}` : null,
      eventProfile.region ? `אזור: ${eventProfile.region}` : null,
      eventProfile.guests ? `מוזמנים: ${eventProfile.guests}` : null,
      eventProfile.budget ? `תקציב: ₪${Number(eventProfile.budget).toLocaleString('he-IL')}` : null,
      '',
      'הספקים שבחרתי:',
      vendorList,
      '',
      totals.priceLabel ? `סה"כ משוער (טווח לפי ספק אחד בכל קטגוריה): ${totals.priceLabel}` : null,
      totals.savingsLabel ? `חיסכון Fiesta לפי קטגוריות: ${totals.savingsLabel}` : null,
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
    setSent(true);
  };

  const hasItems = cartVendors.length > 0;
  const showSkeleton = loading && cart.length > 0 && !hasItems;
  const showEmpty = !loading && cart.length === 0;
  const vendorWord = cartVendors.length === 1 ? 'ספק' : 'ספקים';

  return (
    <div className={`cart-scene${hasItems ? ' cart-scene--filled' : ''}`}>
      <div className="cart-scene__inner">
        {!hasItems && !showSkeleton ? (
          <header className="cart-scene__head">
            <HomeStepVisual kind="cart" label="סל" />
            <p className="cart-scene__kicker">שלב 02</p>
            <h1>הסל שלכם</h1>
            <Flourish />
            <p className="cart-scene__lead">
              מרכזים הכול במקום אחד — ואז יועץ Fiesta סוגר איתכם.
            </p>
          </header>
        ) : null}

        {showSkeleton ? (
          <div className="cart-scene__grid" aria-busy="true" aria-label="טוען את הסל">
            <section className="cart-scene__list">
              <div className="cart-scene__skel cart-scene__skel--line" />
              <div className="cart-scene__skel-item" />
              <div className="cart-scene__skel-item" />
            </section>
            <aside className="cart-scene__aside">
              <div className="cart-scene__skel cart-scene__skel--title" />
              <div className="cart-scene__skel cart-scene__skel--line" />
              <div className="cart-scene__skel cart-scene__skel--btn" />
            </aside>
          </div>
        ) : null}

        {showEmpty ? (
          <section className="cart-scene__empty">
            <h2>עדיין אין ספקים בסל</h2>
            <p>בחרו מקום, מוזיקה וצילום — ואנחנו נרכז הכול.</p>
            <div className="cart-scene__shortcuts">
              <Link href="/vendors" className="cart-scene__shortcut">לכל הספקים</Link>
              <Link
                href={hasOnboarded ? '/my-event' : '/event-setup'}
                className="cart-scene__shortcut"
              >
                {hasOnboarded ? 'האירוע שלי' : 'בואו נכיר את האירוע'}
              </Link>
              <Link href="/budget-planner" className="cart-scene__shortcut">תכנון תקציב</Link>
            </div>
          </section>
        ) : null}

        {!loading && cart.length > 0 && !hasItems ? (
          <section className="cart-scene__empty">
            <h2>הספקים שבסל לא נטענו</h2>
            <p>רעננו את הדף, או הוסיפו שוב מהקטגוריה.</p>
            <div className="cart-scene__shortcuts">
              <Link href="/vendors" className="cart-scene__shortcut">לכל הספקים</Link>
            </div>
          </section>
        ) : null}

        {hasItems ? (
          <div className="cart-scene__grid">
            <section className="cart-scene__list" aria-label="ספקים שנבחרו">
              <header className="cart-scene__mast">
                <div className="cart-scene__mast-title">
                  <h1>הסל שלכם</h1>
                  <p className="cart-scene__count">{cartVendors.length} {vendorWord}</p>
                </div>
                {eventFacts.length > 0 ? (
                  <p className="cart-scene__mast-facts">{eventFacts.join(' · ')}</p>
                ) : null}
              </header>

              {eventCore.some((item) => !item.on) ? (
                <div className="cart-scene__missing">
                  <span>עוד אפשר להוסיף:</span>
                  {eventCore.filter((item) => !item.on).map((item) => (
                    <Link key={item.type} href={`/category/${item.type}`}>{item.short}</Link>
                  ))}
                </div>
              ) : null}

              {cartGroups.map((group) => (
                <div key={group.key} className="cart-scene__group">
                  <p className="cart-scene__group-label">
                    <span>{group.label}</span>
                    {group.priceLabel ? <span>{group.priceLabel}</span> : null}
                  </p>
                  {group.isChoice ? (
                    <p className="cart-scene__group-note">מבחר · לוקחים אחד · טווח מחירים</p>
                  ) : null}
                  {group.vendors.map((vendor) => {
                    const price = getVendorDisplayPrice(vendor);
                    const meta = getSupplierTypeMeta(vendor.type);
                    const cheapest = getCheapestPackage(vendor);
                    const image = resolveVendorImage(cheapest?.image || vendor.image, '');
                    const location = vendor.location || formatVendorRegions(vendor);
                    const id = vendorCartId(vendor);
                    return (
                      <article key={id} className="cart-scene__item">
                        <Link href={`/vendor/${id}`} className="cart-scene__item-media">
                          <VendorCardImage src={image} alt={vendor.name} />
                        </Link>
                        <div className="cart-scene__item-body">
                          <p className="cart-scene__item-type">{meta.label}</p>
                          <h2>
                            <Link href={`/vendor/${id}`}>{vendor.name}</Link>
                          </h2>
                          {location ? <p className="cart-scene__item-loc">{location}</p> : null}
                        </div>
                        <div className="cart-scene__item-cost">
                          {price.originalDisplay ? (
                            <span className="cart-scene__was">{price.originalDisplay}</span>
                          ) : null}
                          {price.display ? (
                            <strong>{price.isFrom ? 'מ־' : ''}{price.display}</strong>
                          ) : (
                            <span>מול Fiesta</span>
                          )}
                          {price.savings ? (
                            <em className="cart-scene__item-save">חיסכון {toShekels(price.savings)}</em>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="cart-scene__remove"
                          aria-label={`הסרה של ${vendor.name}`}
                          onClick={() => handleRemove(vendor)}
                        >
                          הסרה
                        </button>
                      </article>
                    );
                  })}
                </div>
              ))}

              <div className="cart-scene__list-foot">
                <Link href="/vendors" className="cart-scene__more">הוסיפו עוד ספקים</Link>
                <button type="button" className="cart-scene__clear" onClick={handleClear}>
                  ריקון
                </button>
              </div>
            </section>

            <aside className="cart-scene__aside" id="cart-lead">
              <p className="cart-scene__kicker">הצעד הבא</p>
              <h2>יועץ Fiesta</h2>
              <p>נחזור אליכם עם הספקים שבסל, במחיר Fiesta.</p>

              {(totals.priceLabel || totals.savingsLabel) ? (
                <dl className="cart-scene__totals">
                  {totals.originalMax > totals.priceMax ? (
                    <div>
                      <dt>מחיר רגיל</dt>
                      <dd className="cart-scene__was">{totals.originalLabel}</dd>
                    </div>
                  ) : null}
                  {totals.priceLabel ? (
                    <div>
                      <dt>מחיר Fiesta</dt>
                      <dd>{totals.priceLabel}</dd>
                    </div>
                  ) : null}
                  {totals.savingsMax > 0 ? (
                    <div className="cart-scene__totals-save">
                      <dt>חיסכון</dt>
                      <dd>{totals.savingsLabel}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
              {totals.isEstimate ? (
                <p className="cart-scene__totals-note">
                  הטווח לפי ספק אחד בכל קטגוריה. כמה אפשרויות באותה קטגוריה הן מבחר — לא חיבור.
                </p>
              ) : null}

              {sent ? (
                <div className="cart-scene__sent" role="status">
                  <p>נפתח אצלכם WhatsApp עם סיכום הסל.</p>
                  <button type="button" className="cart-scene__more" onClick={() => setSent(false)}>
                    לשלוח שוב
                  </button>
                </div>
              ) : (
                <form onSubmit={submitLead}>
                  <label className="cart-scene__field">
                    <span>שם מלא</span>
                    <input
                      required
                      value={lead.name}
                      onChange={(e) => setLead({ ...lead, name: e.target.value })}
                      autoComplete="name"
                    />
                  </label>
                  <label className="cart-scene__field">
                    <span>טלפון</span>
                    <input
                      required
                      type="tel"
                      value={lead.phone}
                      onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </label>
                  <label className="cart-scene__field">
                    <span>תאריך האירוע</span>
                    <input
                      type="date"
                      lang="he-IL"
                      value={lead.date}
                      onChange={(e) => setLead({ ...lead, date: e.target.value })}
                    />
                  </label>
                  <button type="submit" className="cart-scene__btn cart-scene__btn--full">
                    שלחו בוואטסאפ
                  </button>
                  <p className="cart-scene__hint">בלי התחייבות · נפתח WhatsApp עם הסיכום</p>
                </form>
              )}
            </aside>
          </div>
        ) : null}
      </div>

      {undo ? (
        <div className="cart-scene__toast" role="status">
          <span>
            {undo.type === 'clear'
              ? 'הסל רוקן'
              : `${undo.name || 'הספק'} הוסר`}
          </span>
          <button type="button" onClick={restoreUndo}>בטל</button>
        </div>
      ) : hasItems ? (
        <a className="cart-scene__dock" href="#cart-lead">
          <span>
            {totals.savingsMax > 0
              ? `חיסכון ${totals.savingsLabel}`
              : `${cartVendors.length} ${vendorWord}`}
          </span>
          <strong>ליועץ</strong>
        </a>
      ) : null}
    </div>
  );
}
