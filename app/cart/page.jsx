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
  { type: 'catering', short: 'קייטרינג' },
  { type: 'alcohol', short: 'אלכוהול' },
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

const BASE_CORE = ['venue', 'dj', 'photographer', 'alcohol', 'design'];
const WEDDING_CORE = ['rabbi', 'dresses', 'suits'];

const CORE_LABELS = {
  venue: 'אולם',
  dj: 'DJ',
  photographer: 'צילום',
  catering: 'קייטרינג',
  alcohol: 'אלכוהול',
  design: 'עיצוב',
  rabbi: 'רב',
  dresses: 'שמלת כלה',
  suits: 'חליפת חתן',
};

export default function CartPage() {
  const { vendors, loading, cart, removeFromCart, clearCart, replaceCart } = useVendors();
  const { user, eventPreference, eventProfile, hasOnboarded } = useAuth();
  const [sent, setSent] = useState(false);
  const [undo, setUndo] = useState(null);
  const undoTimer = useRef(null);
  const trackerRef = useRef(null);

  const scrollTracker = (direction) => {
    if (!trackerRef.current) return;
    const scrollAmount = 240;
    const multiplier = direction === 'left' ? -1 : 1;
    trackerRef.current.scrollBy({ left: multiplier * scrollAmount, behavior: 'smooth' });
  };

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

  const totals = useMemo(() => getCartTotals(cartVendors, eventPreference), [cartVendors, eventPreference]);
  
  const coreTypes = useMemo(() => {
    const list = [...BASE_CORE];
    if (eventPreference === 'חתונה') {
      list.push(...WEDDING_CORE);
    }
    return list;
  }, [eventPreference]);

  const { coreGroups, optionalGroups } = useMemo(() => {
    const core = [];
    const optional = [];
    (totals.categories || []).forEach((group) => {
      if (coreTypes.includes(group.key)) {
        core.push(group);
      } else {
        optional.push(group);
      }
    });
    return { coreGroups: core, optionalGroups: optional };
  }, [totals.categories, coreTypes]);

  const guestCount = Number(String(eventProfile.guests || '').replace(/[^\d]/g, ''));
  const eventFacts = useMemo(() => [
    eventPreference,
    eventProfile.date ? formatEventDate(eventProfile.date) : null,
    eventProfile.region,
    Number.isFinite(guestCount) && guestCount > 0
      ? `${guestCount.toLocaleString('he-IL')} מוזמנים`
      : null,
  ].filter(Boolean), [eventPreference, eventProfile.date, eventProfile.region, guestCount]);

  const eventCore = useMemo(() => {
    const coreList = [...BASE_CORE];
    if (eventPreference === 'חתונה') {
      coreList.push(...WEDDING_CORE);
    }
    return coreList.map((type, index) => {
      const count = cartVendors.filter((vendor) => vendorHasCategory(vendor, type)).length;
      return {
        type,
        short: CORE_LABELS[type] || 'ספק',
        n: String(index + 1).padStart(2, '0'),
        on: count > 0,
        count,
      };
    });
  }, [cartVendors, eventPreference]);

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
    event?.preventDefault?.();
    const name = user?.name || '';
    const phone = user?.username || '';
    const date = eventProfile?.date || '';

    const vendorList = (totals.categories || [])
      .map((group) => {
        const heading = group.isChoice
          ? `${group.label} — מבחר, לוקחים אחד:`
          : `${group.label}:`;
        const lines = group.vendors.map((vendor) => {
          const price = getVendorDisplayPrice(vendor, eventPreference);
          return `• ${vendor.name}${price.display ? ` — ${price.display}` : ''}`;
        });
        return [heading, ...lines].join('\n');
      })
      .join('\n\n');
    const message = [
      'היי Fiesta, סיימתי לבחור ספקים ורוצה להתקדם.',
      '',
      name ? `שם: ${name}` : null,
      phone ? `טלפון: ${phone}` : null,
      eventPreference ? `סוג אירוע: ${eventPreference}` : null,
      date ? `תאריך אירוע: ${formatEventDate(date)}` : null,
      eventProfile?.region ? `אזור: ${eventProfile.region}` : null,
      eventProfile?.guests ? `מוזמנים: ${eventProfile.guests}` : null,
      eventProfile?.budget ? `תקציב: ₪${Number(eventProfile.budget).toLocaleString('he-IL')}` : null,
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

              {/* באנר הסבר ברור על זרימת הסל ב-Fiesta */}
              <div className="cart-scene__info-banner">
                <i className="fas fa-info-circle" />
                <p>
                  הסל שלכם משמש כלוח טיוטה והשוואה. תוכלו להוסיף מספר ספקים באותה קטגוריה כדי להתלבט ביניהם, ואנחנו נעזור לכם לבחור ולסגור מול המועדפים עליכם במחיר הטוב ביותר.
                </p>
              </div>

              {/* טראקר התקדמות גרפי (Checklist) לקטגוריות הליבה בקרוסלה אופקית */}
              <div className="cart-scene__tracker-wrapper">
                <button
                  type="button"
                  className="cart-scene__tracker-arrow cart-scene__tracker-arrow--right"
                  onClick={() => scrollTracker('right')}
                  aria-label="גלול ימינה"
                >
                  <i className="fas fa-chevron-right" />
                </button>
                
                <div className="cart-scene__tracker" ref={trackerRef} aria-label="התקדמות בחירת ספקים">
                  {eventCore.map((item) => (
                    <Link
                      key={item.type}
                      href={`/category/${item.type}`}
                      className={`cart-scene__tracker-step${item.on ? ' is-on' : ''}`}
                      title={item.on ? `${item.short} נוסף לסל` : `הוסיפו ${item.short}`}
                    >
                      <div className="cart-scene__tracker-icon">
                        <i className={item.on ? 'fas fa-check-circle' : 'fas fa-plus-circle'} />
                      </div>
                      <span className="cart-scene__tracker-label">{item.short}</span>
                    </Link>
                  ))}
                </div>

                <button
                  type="button"
                  className="cart-scene__tracker-arrow cart-scene__tracker-arrow--left"
                  onClick={() => scrollTracker('left')}
                  aria-label="גלול שמאלה"
                >
                  <i className="fas fa-chevron-left" />
                </button>
              </div>

              {!hasOnboarded ? (
                <div className="cart-scene__onboarding-top hide-on-desktop">
                  <div className="cart-scene__onboarding-top-body">
                    <i className="fas fa-calendar-check" />
                    <div>
                      <h3>פרטי האירוע חסרים</h3>
                      <p>השלימו את פרטי האירוע כדי לראות טווח מחירים וחיסכון.</p>
                    </div>
                  </div>
                  <Link href="/event-setup" className="cart-scene__onboarding-btn-small">
                    להגדרת אירוע ➔
                  </Link>
                </div>
              ) : null}

              {coreGroups.map((group) => (
                <div key={group.key} className={`cart-scene__group${group.isChoice ? ' is-choice' : ''}`}>
                  <p className="cart-scene__group-label">
                    <span>
                      {group.label}
                      <Link href={`/category/${group.key}`} className="cart-scene__group-label-link">
                        + להשוואה נוספת
                      </Link>
                    </span>
                    {group.priceLabel ? <span>{group.priceLabel}</span> : null}
                  </p>
                  {group.isChoice ? (
                    <p className="cart-scene__group-note">מבחר · לוקחים אחד · טווח מחירים</p>
                  ) : null}
                  {group.vendors.map((vendor) => {
                    const price = getVendorDisplayPrice(vendor, eventPreference);
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
                          {location ? (
                            <p className="cart-scene__item-loc">
                              <i className="fas fa-map-marker-alt" style={{ marginLeft: '4px', fontSize: '0.8rem', color: '#a89f91' }} />
                              {location}
                            </p>
                          ) : null}
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
                            <em className="cart-scene__item-save">
                              <i className="fas fa-tags" style={{ marginLeft: '4px' }} />
                              חיסכון {toShekels(price.savings)}
                            </em>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="cart-scene__remove"
                          aria-label={`הסרה של ${vendor.name}`}
                          onClick={() => handleRemove(vendor)}
                        >
                          <i className="fas fa-trash-alt" style={{ marginLeft: '4px' }} />
                          הסרה
                        </button>
                      </article>
                    );
                  })}
                </div>
              ))}

              {optionalGroups.length > 0 ? (
                <>
                  <div className="cart-scene__section-title">
                    <h3>תוספות ופינוקים</h3>
                    <p>ספקים משלימים שבחרתם לעבות איתם את האירוע</p>
                  </div>
                  {optionalGroups.map((group) => (
                    <div key={group.key} className={`cart-scene__group${group.isChoice ? ' is-choice' : ''}`}>
                      <p className="cart-scene__group-label">
                        <span>
                          {group.label}
                          <Link href={`/category/${group.key}`} className="cart-scene__group-label-link">
                            + להשוואה נוספת
                          </Link>
                        </span>
                        {group.priceLabel ? <span>{group.priceLabel}</span> : null}
                      </p>
                      {group.isChoice ? (
                        <p className="cart-scene__group-note">מבחר · לוקחים אחד · טווח מחירים</p>
                      ) : null}
                      {group.vendors.map((vendor) => {
                        const price = getVendorDisplayPrice(vendor, eventPreference);
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
                              {location ? (
                                <p className="cart-scene__item-loc">
                                  <i className="fas fa-map-marker-alt" style={{ marginLeft: '4px', fontSize: '0.8rem', color: '#a89f91' }} />
                                  {location}
                                </p>
                              ) : null}
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
                                <em className="cart-scene__item-save">
                                  <i className="fas fa-tags" style={{ marginLeft: '4px' }} />
                                  חיסכון {toShekels(price.savings)}
                                </em>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              className="cart-scene__remove"
                              aria-label={`הסרה של ${vendor.name}`}
                              onClick={() => handleRemove(vendor)}
                            >
                              <i className="fas fa-trash-alt" style={{ marginLeft: '4px' }} />
                              הסרה
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  ))}
                </>
              ) : null}

              <div className="cart-scene__list-foot">
                <Link href="/vendors" className="cart-scene__more">הוסיפו עוד ספקים</Link>
                <button type="button" className="cart-scene__clear" onClick={handleClear}>
                  <i className="fas fa-trash-alt" style={{ marginLeft: '4px' }} />
                  ריקון הסל
                </button>
              </div>
            </section>

            <aside className="cart-scene__aside" id="cart-lead">
              {!hasOnboarded ? (
                /* חסימת הפאנל הצדי למשתמש שלא הגדיר אירוע (מפנה ל-event-setup) */
                <div className="cart-scene__onboarding-aside">
                  <div className="cart-scene__onboarding-aside-icon">
                    <i className="fas fa-calendar-check" />
                  </div>
                  <h3>פרטי האירוע חסרים</h3>
                  <p>
                    כדי שנוכל לחשב את טווח המחירים המדויק ואת גובה החיסכון שלכם מול הספקים, עלינו להכיר קודם את האירוע שלכם.
                  </p>
                  <Link href="/event-setup" className="cart-scene__onboarding-btn">
                    להגדרת האירוע והשלמת פרטים ➔
                  </Link>
                </div>
              ) : (
                /* פאנל מאוזן ויוקרתי */
                <>
                  <div className="cart-scene__aside-head">
                    <span className="cart-scene__aside-kicker">סגירת ספקים</span>
                    <h2>ההצעה שלכם</h2>
                  </div>

                  <div className="cart-scene__summary-box">
                    {totals.originalMax > totals.priceMax ? (
                      <div className="cart-scene__summary-row">
                        <span className="cart-scene__summary-label">מחיר מקורי</span>
                        <span className="cart-scene__summary-was">{totals.originalLabel}</span>
                      </div>
                    ) : null}

                    {totals.savingsMax > 0 ? (
                      <div className="cart-scene__summary-row is-savings">
                        <span className="cart-scene__summary-label">חיסכון Fiesta</span>
                        <span className="cart-scene__summary-save">-{totals.savingsLabel}</span>
                      </div>
                    ) : null}

                    {totals.priceLabel ? (
                      <div className="cart-scene__summary-row is-total">
                        <span className="cart-scene__summary-label">סה״כ משוער</span>
                        <span className="cart-scene__summary-total">{totals.priceLabel}</span>
                      </div>
                    ) : null}
                  </div>

                  <p className="cart-scene__aside-note">
                    היועץ שלנו יבדוק זמינות ויסגור עבורכם את המחיר.
                  </p>

                  {sent ? (
                    <div className="cart-scene__sent" role="status">
                      <p>נפתח אצלכם WhatsApp עם סיכום הסל.</p>
                      <button type="button" className="cart-scene__more" onClick={() => setSent(false)}>
                        לשלוח שוב
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="cart-scene__btn cart-scene__btn--full cart-scene__btn-wa"
                      onClick={submitLead}
                    >
                      <i className="fab fa-whatsapp" style={{ marginLeft: '8px', fontSize: '1.2rem' }} />
                      שלחו בוואטסאפ ליועץ
                    </button>
                  )}
                </>
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
        <Link className="cart-scene__dock" href={hasOnboarded ? "#cart-lead" : "/event-setup"}>
          <span>
            {hasOnboarded && totals.savingsMax > 0
              ? `חיסכון ${totals.savingsLabel}`
              : `${cartVendors.length} ${vendorWord}`}
          </span>
          <strong>{hasOnboarded ? 'ליועץ' : 'להגדרת אירוע'}</strong>
        </Link>
      ) : null}
    </div>
  );
}
