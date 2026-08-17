'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useVendors } from '@/context/VendorContext';
import {
  buildJourneyProgress,
  formatBudget,
  formatEventDate,
} from '@/lib/eventJourney';
import { getVendorDisplayPrice, parsePrice } from '@/lib/vendorPrice';
import BrandMark from '@/components/BrandMark';

const toShekels = (amount) => `₪${Math.round(amount).toLocaleString('he-IL')}`;

export default function MyEventPage() {
  const { user, eventPreference, eventProfile, hasOnboarded, eventReady } = useAuth();
  const { vendors, cart, loading: vendorsLoading } = useVendors();

  const cartVendors = useMemo(
    () => vendors.filter((v) => cart.includes(String(v.id))),
    [vendors, cart],
  );

  const journey = useMemo(
    () => buildJourneyProgress({
      completedCategories: eventProfile.completedCategories,
      cartVendors,
    }),
    [eventProfile.completedCategories, cartVendors],
  );

  const totals = useMemo(() => cartVendors.reduce((acc, vendor) => {
    const price = getVendorDisplayPrice(vendor);
    return {
      price: acc.price + (parsePrice(price.raw) || 0),
      savings: acc.savings + (price.savings || 0),
    };
  }, { price: 0, savings: 0 }), [cartVendors]);

  if (!eventReady) {
    return (
      <main className="my-event">
        <div className="container"><p className="muted">טוען את האירוע שלכם...</p></div>
      </main>
    );
  }

  if (!hasOnboarded) {
    return (
      <main className="my-event">
        <div className="container empty">
          <h1>עוד לא הכרנו את האירוע שלכם</h1>
          <p>Onboarding קצר וחד־פעמי — ואז Fiesta זוכרת וממשיכה איתכם.</p>
          <Link href="/event-setup" className="btn-primary">בואו נכיר את האירוע</Link>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  const next = journey.next;
  const lastCategory = eventProfile.lastCategory
    ? journey.items.find((item) => item.id === eventProfile.lastCategory)
    : null;

  const resumeHref = lastCategory && lastCategory.status === 'open'
    ? `/category/${lastCategory.id}`
    : next
      ? `/category/${next.id}`
      : '/vendors';

  const resumeLabel = lastCategory && lastCategory.status === 'open'
    ? `המשיכו ב${lastCategory.short}`
    : next
      ? `מצאו לי ${next.short}`
      : 'לכל הספקים';

  const greetingName = user?.name ? `, ${user.name}` : '';

  return (
    <main className="my-event">
      <div className="container">
        <header className="hero-card">
          <BrandMark variant="auth" className="event-brand" />
          <p className="kicker">האירוע שלי</p>
          <h1>ברוכים הבאים חזרה{greetingName}</h1>
          <p className="lead">
            ממשיכים מאיפה שעצרתם — בלי לענות שוב על אותן שאלות.
          </p>

          <div className="meta-row">
            {eventPreference ? <span>{eventPreference}</span> : null}
            {formatEventDate(eventProfile.date) ? <span>{formatEventDate(eventProfile.date)}</span> : null}
            {eventProfile.region ? <span>{eventProfile.region}</span> : null}
            {eventProfile.guests ? <span>{eventProfile.guests} מוזמנים</span> : null}
            {formatBudget(eventProfile.budget) ? <span>{formatBudget(eventProfile.budget)}</span> : null}
          </div>

          <div className="progress-line">
            התקדמות: {journey.doneCount}/{journey.total} קטגוריות
          </div>

          <div className="cta-row">
            <Link href={resumeHref} className="btn-primary">{resumeLabel}</Link>
            <Link href="/cart" className="btn-secondary">לסל ({cartVendors.length})</Link>
            <Link href="/event-setup" className="btn-ghost">עדכון פרטים</Link>
          </div>
        </header>

        <section className="grid-2">
          <div className="panel">
            <h2>הספקים שלי</h2>
            <ul className="journey-list">
              {journey.items.map((item) => (
                <li key={item.id} className={`status-${item.status}`}>
                  <span className="dot" aria-hidden />
                  <div>
                    <strong>{item.label}</strong>
                    <small>
                      {item.status === 'done' && 'סגור'}
                      {item.status === 'selected' && `נבחר · ${item.vendors.map((v) => v.name).join(', ')}`}
                      {item.status === 'open' && 'טרם נבחר'}
                    </small>
                  </div>
                  {item.status === 'open' ? (
                    <Link href={`/category/${item.id}`}>לבחירה</Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="side">
            <div className="panel">
              <h2>הסל שלי</h2>
              {vendorsLoading && cart.length > 0 ? (
                <p className="muted">טוען פרטי ספקים...</p>
              ) : null}
              {!vendorsLoading && cartVendors.length === 0 ? (
                <p className="muted">עדיין אין ספקים בסל.</p>
              ) : null}
              {cartVendors.length > 0 ? (
                <>
                  <p className="cart-count">{cartVendors.length} ספקים</p>
                  {totals.price > 0 ? <p className="cart-total">{toShekels(totals.price)}</p> : null}
                  {totals.savings > 0 ? (
                    <p className="cart-save">חיסכון פוטנציאלי {toShekels(totals.savings)}</p>
                  ) : null}
                  <Link href="/cart" className="btn-secondary wide">פתחו את הסל</Link>
                </>
              ) : null}
            </div>

            <div className="panel next-panel">
              <h2>השלב הבא</h2>
              {next ? (
                <>
                  <p>למצוא {next.label}</p>
                  <Link href={`/category/${next.id}`} className="btn-primary wide">
                    {`מצאו לי ${next.short}`}
                  </Link>
                </>
              ) : (
                <>
                  <p>סימנתם את כל הקטגוריות המרכזיות. אפשר לעבור לסל ולסגור עם יועץ.</p>
                  <Link href="/cart" className="btn-primary wide">לסיכום בסל</Link>
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  .my-event {
    min-height: 100vh;
    background: var(--off-white);
    padding: 96px 0 calc(var(--mobile-chrome-clearance, 32px) + 48px);
  }
  .container { max-width: 1080px; margin: 0 auto; padding: 0 20px; }
  .empty { text-align: center; padding: 80px 16px; background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
  .empty h1 { margin: 0 0 10px; }
  .empty p { color: var(--text-light); margin: 0 0 22px; }
  .hero-card, .panel {
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 24px;
    text-align: right;
  }
  .hero-card { margin-bottom: 20px; }
  .event-brand { display: flex; justify-content: flex-start; margin: 0 0 14px; }
  .kicker { margin: 0 0 6px; color: var(--primary-color); font-weight: 700; font-size: .82rem; }
  h1 { margin: 0 0 8px; font-size: clamp(1.7rem, 4vw, 2.4rem); }
  h2 { margin: 0 0 14px; font-size: 1.15rem; }
  .lead { margin: 0 0 16px; color: var(--text-light); }
  .meta-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
  .meta-row span {
    background: var(--off-white);
    border: 1px solid var(--border-color);
    border-radius: 999px;
    padding: 6px 10px;
    font-size: .82rem;
    font-weight: 600;
  }
  .progress-line { font-weight: 700; margin-bottom: 18px; }
  .cta-row, .grid-2 { display: flex; gap: 12px; flex-wrap: wrap; }
  .grid-2 { display: grid; grid-template-columns: 1.4fr .9fr; gap: 16px; align-items: start; }
  .side { display: grid; gap: 16px; }
  .journey-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
  .journey-list li {
    display: grid;
    grid-template-columns: 12px 1fr auto;
    gap: 10px;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-color);
  }
  .journey-list li:last-child { border-bottom: 0; }
  .dot { width: 10px; height: 10px; border-radius: 50%; background: #d0cbc2; }
  .status-done .dot { background: #2f9e44; }
  .status-selected .dot { background: #8F7344; }
  .status-open .dot { background: #cfc9be; }
  .journey-list strong { display: block; font-size: .95rem; }
  .journey-list small { color: var(--text-light); font-size: .8rem; }
  .journey-list a { color: var(--primary-hover); font-size: .82rem; font-weight: 700; }
  .cart-count { margin: 0 0 4px; color: var(--text-light); }
  .cart-total { margin: 0 0 6px; font-size: 1.4rem; font-weight: 800; }
  .cart-save { margin: 0 0 14px; color: var(--primary-hover); font-weight: 700; font-size: .9rem; }
  .muted { color: var(--text-light); }
  .btn-primary, .btn-secondary, .btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 10px 16px;
    border-radius: var(--radius-sm);
    font-weight: 700;
    text-decoration: none;
  }
  .btn-primary { background: var(--charcoal); color: #fff; }
  .btn-secondary { background: #fff; border: 1px solid #e5e2dc; color: var(--text-dark); }
  .btn-ghost { color: var(--primary-hover); }
  .wide { width: 100%; }
  @media (max-width: 800px) {
    .my-event { padding-top: 84px; }
    .grid-2 { grid-template-columns: 1fr; }
    .cta-row { flex-direction: column; }
    .cta-row a { width: 100%; }
  }
`;
