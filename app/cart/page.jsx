'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useVendors } from '@/context/VendorContext';
import { useAuth } from '@/context/AuthContext';
import { getVendorDisplayPrice, parsePrice } from '@/lib/vendorPrice';

const WA_PHONE = '972535378985';

const toShekels = (amount) => `₪${Math.round(amount).toLocaleString('he-IL')}`;

export default function CartPage() {
  const { vendors, loading, cart, removeFromCart, clearCart } = useVendors();
  const { eventPreference, eventProfile } = useAuth();
  const [lead, setLead] = useState({
    name: '',
    phone: '',
    date: eventProfile.date || '',
  });

  const cartVendors = useMemo(
    () => vendors.filter((vendor) => cart.includes(String(vendor.id))),
    [vendors, cart],
  );

  const totals = useMemo(() => cartVendors.reduce((acc, vendor) => {
    const price = getVendorDisplayPrice(vendor);
    return {
      price: acc.price + (parsePrice(price.raw) || 0),
      savings: acc.savings + (price.savings || 0),
    };
  }, { price: 0, savings: 0 }), [cartVendors]);

  const submitLead = (event) => {
    event.preventDefault();
    const vendorList = cartVendors
      .map((vendor) => {
        const price = getVendorDisplayPrice(vendor);
        return `• ${vendor.name}${price.display ? ` — ${price.display}` : ''}`;
      })
      .join('\n');
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
      totals.price ? `סה"כ משוער: ${toShekels(totals.price)}` : null,
      totals.savings ? `חיסכון משוער: ${toShekels(totals.savings)}` : null,
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <main className="cart-page">
      <div className="container">
        <header className="cart-header">
          <p className="cart-kicker">האירוע שלכם</p>
          <h1>הסל שלי</h1>
          <p>הספקים שבחרתם מרוכזים כאן. המחיר הסופי ייקבע מול יועץ Fiesta.</p>
        </header>

        {loading && cart.length > 0 && cartVendors.length === 0 ? (
          <p className="cart-loading">טוען פרטי ספקים בסל...</p>
        ) : null}

        {!loading && cartVendors.length === 0 ? (
          <section className="cart-empty">
            <i className="fas fa-cart-shopping" />
            <h2>הסל עדיין ריק</h2>
            <p>מצאו ספקים, השוו מחירים והוסיפו את מי שאהבתם.</p>
            <Link href="/vendors" className="cart-primary">למציאת ספקים</Link>
          </section>
        ) : null}

        {cartVendors.length > 0 ? (
          <div className="cart-layout">
            <section className="cart-items" aria-label="ספקים שנבחרו">
              {cartVendors.map((vendor) => {
                const price = getVendorDisplayPrice(vendor);
                return (
                  <article key={vendor.id} className="cart-item">
                    <div>
                      <h2>{vendor.name}</h2>
                      {price.display ? (
                        <p>
                          מחיר Fiesta: <strong>{price.display}</strong>
                          {price.originalDisplay ? <span className="cart-original"> במקום {price.originalDisplay}</span> : null}
                        </p>
                      ) : <p>המחיר ייקבע מול Fiesta</p>}
                    </div>
                    <button type="button" onClick={() => removeFromCart(vendor.id)}>
                      הסרה
                    </button>
                  </article>
                );
              })}
              <button type="button" className="cart-clear" onClick={clearCart}>רוקנו את הסל</button>
            </section>

            <aside className="cart-summary">
              <h2>סיכום האירוע</h2>
              <div className="summary-line"><span>{cartVendors.length} ספקים</span><span>{totals.price ? toShekels(totals.price) : 'לפי הצעה'}</span></div>
              {totals.savings > 0 ? (
                <div className="summary-saving">החיסכון המשוער שלכם דרך Fiesta: {toShekels(totals.savings)}</div>
              ) : null}
              <p className="summary-note">המחירים הם הערכה לפי החבילה הזולה של כל ספק.</p>

              <form onSubmit={submitLead}>
                <h3>סיימתם לבחור? בואו נתקדם</h3>
                <input required value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder="שם מלא" autoComplete="name" />
                <input required type="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} placeholder="טלפון" autoComplete="tel" />
                <input type="date" value={lead.date} onChange={(e) => setLead({ ...lead, date: e.target.value })} aria-label="תאריך האירוע" />
                <button type="submit" className="cart-primary">שלחו לי יועץ Fiesta</button>
              </form>
            </aside>
          </div>
        ) : null}
      </div>

      <style jsx>{`
        .cart-page { min-height: 100vh; background: var(--off-white); padding: 96px 0 calc(var(--mobile-chrome-clearance, 32px) + 48px); }
        .container { max-width: 1080px; padding: 0 20px; margin: 0 auto; }
        .cart-header { text-align: right; margin-bottom: 32px; }
        .cart-kicker { color: var(--primary-color); font-weight: 700; font-size: .82rem; margin: 0 0 5px; }
        .cart-header h1 { margin: 0 0 8px; font-size: clamp(1.8rem, 4vw, 2.5rem); }
        .cart-header p, .summary-note { color: var(--text-light); margin: 0; }
        .cart-layout { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(300px, .8fr); gap: 24px; align-items: start; }
        .cart-items, .cart-summary, .cart-empty { background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; }
        .cart-item { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--border-color); text-align: right; }
        .cart-item:first-child { padding-top: 0; }
        .cart-item h2 { margin: 0 0 5px; font-family: var(--font-main); font-size: 1.05rem; }
        .cart-item p { margin: 0; color: var(--text-light); font-size: .9rem; }
        .cart-original { text-decoration: line-through; color: #999; margin-right: 6px; }
        .cart-item button, .cart-clear { border: 0; background: none; color: #b42318; font: inherit; cursor: pointer; white-space: nowrap; }
        .cart-clear { margin-top: 18px; font-size: .88rem; }
        .cart-summary { position: sticky; top: 90px; text-align: right; }
        .cart-summary h2 { margin: 0 0 18px; font-size: 1.25rem; }
        .summary-line { display: flex; justify-content: space-between; gap: 12px; padding: 14px 0; border-top: 1px solid var(--border-color); font-weight: 700; }
        .summary-saving { background: rgba(143,115,68,.1); color: var(--primary-hover); padding: 10px; border-radius: var(--radius-sm); font-size: .88rem; font-weight: 700; }
        .summary-note { font-size: .78rem; line-height: 1.5; margin: 12px 0 20px; }
        form { border-top: 1px solid var(--border-color); padding-top: 20px; display: grid; gap: 10px; }
        form h3 { margin: 0 0 2px; font-family: var(--font-main); font-size: 1rem; }
        input { width: 100%; padding: 13px; text-align: right; font: inherit; border-radius: var(--radius-sm); border: 1px solid #e5e2dc; }
        .cart-primary { display: inline-flex; justify-content: center; align-items: center; min-height: 46px; padding: 12px 18px; border: 0; border-radius: var(--radius-sm); background: var(--charcoal); color: #fff; text-decoration: none; font: inherit; font-weight: 700; cursor: pointer; }
        .cart-empty { text-align: center; padding: 70px 20px; }
        .cart-empty i { font-size: 2.5rem; color: var(--primary-color); margin-bottom: 16px; }
        .cart-empty h2 { margin: 0 0 8px; }
        .cart-empty p { color: var(--text-light); margin: 0 0 20px; }
        .cart-loading { text-align: center; color: var(--text-light); padding: 60px; }
        @media (max-width: 768px) {
          .cart-page { padding-top: 84px; }
          .container { padding: 0 16px; }
          .cart-layout { grid-template-columns: 1fr; }
          .cart-summary { position: static; }
        }
      `}</style>
    </main>
  );
}
