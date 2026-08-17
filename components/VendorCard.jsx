'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import VendorCardImage from '@/components/VendorCardImage';
import { EditChip } from '@/components/SiteEditBar';
import { resolveVendorImage } from '@/lib/vendorImage';
import {
  getVendorDisplayPrice,
  getVendorDiscountBadge,
  getCheapestPackage,
  getPackages,
} from '@/lib/vendorPrice';
import { formatVendorRegions } from '@/lib/vendorRegion';
import { useVendors } from '@/context/VendorContext';

function formatSavings(amount) {
  if (amount == null || amount <= 0) return null;
  return `₪${Math.round(amount).toLocaleString('he-IL')}`;
}

/**
 * Premium vendor card for catalog listings.
 * Shows large image, regular vs Fiesta price, savings, rating, and a clear CTA.
 */
export default function VendorCard({ vendor, index = 0 }) {
  const router = useRouter();
  const { toggleFavorite, isFavorite, toggleCart, isInCart } = useVendors();
  const [justAdded, setJustAdded] = useState(false);

  if (!vendor) return null;

  const cheapest = getCheapestPackage(vendor);
  const packageCount = getPackages(vendor).length;
  const displayImage = resolveVendorImage(cheapest?.image || vendor.image, '');
  const priceInfo = getVendorDisplayPrice(vendor);
  const discountBadge = getVendorDiscountBadge(vendor);
  const savingsLabel = formatSavings(priceInfo.savings);
  const rating = Number(vendor.googleRating);
  const reviewsCount = Number(vendor.googleReviewsCount);
  const hasRating = Number.isFinite(rating) && rating > 0 && Number.isFinite(reviewsCount) && reviewsCount > 0;
  const location = vendor.location || formatVendorRegions(vendor);
  const favored = isFavorite(vendor.id);
  const inCart = isInCart(vendor.id);

  const goToVendor = () => router.push(`/vendor/${vendor.id}`);

  return (
    <article
      className="pvc"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      onClick={goToVendor}
    >
      <div className="pvc-media">
        <VendorCardImage src={displayImage} alt={vendor.name} />

        <div className="pvc-top">
          {discountBadge ? (
            <span className="pvc-badge">
              {discountBadge.type === 'amount' ? '₪' : ''}
              {discountBadge.value}
              {discountBadge.type === 'amount' ? '' : '%'} הנחה
            </span>
          ) : (
            <span />
          )}

          <div className="pvc-top-actions">
            <EditChip
              href={`/admin/vendors/${vendor.id}`}
              label="ערוך"
              style={{ padding: '4px 10px', fontSize: '0.7rem' }}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/vendors/${vendor.id}`);
              }}
            />
            <button
              type="button"
              className={`pvc-fav${favored ? ' is-active' : ''}`}
              aria-label={favored ? 'הסרה ממועדפים' : 'הוספה למועדפים'}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(vendor.id);
              }}
            >
              <i className={favored ? 'fas fa-heart' : 'far fa-heart'} />
            </button>
          </div>
        </div>
      </div>

      <div className="pvc-body">
        <h3 className="pvc-title">{vendor.name}</h3>

        <div className="pvc-meta">
          {location ? (
            <span className="pvc-loc">
              <i className="fas fa-map-marker-alt" />
              {location}
            </span>
          ) : (
            <span />
          )}
          {hasRating ? (
            <span className="pvc-rating">
              <i className="fas fa-star" />
              <strong>{rating.toFixed(1)}</strong>
              <span className="pvc-reviews">({reviewsCount.toLocaleString('he-IL')})</span>
            </span>
          ) : null}
        </div>

        {priceInfo.display ? (
          <div className="pvc-pricing">
            {priceInfo.originalDisplay ? (
              <div className="pvc-price-compare">
                <div className="pvc-price-col">
                  <span className="pvc-price-label">מחיר רגיל</span>
                  <span className="pvc-price-old">{priceInfo.originalDisplay}</span>
                </div>
                <div className="pvc-price-col pvc-price-col--fiesta">
                  <span className="pvc-price-label">מחיר Fiesta</span>
                  <span className="pvc-price-now">
                    {priceInfo.isFrom ? <span className="pvc-from">החל מ־</span> : null}
                    {priceInfo.display}
                  </span>
                </div>
              </div>
            ) : (
              <div className="pvc-price-single">
                {priceInfo.isFrom ? <span className="pvc-from">החל מ־</span> : null}
                <span className="pvc-price-now">{priceInfo.display}</span>
              </div>
            )}

            <div className="pvc-price-footer">
              {savingsLabel ? (
                <span className="pvc-savings">חוסכים {savingsLabel}</span>
              ) : null}
              {packageCount > 1 ? (
                <span className="pvc-packages">{packageCount} חבילות</span>
              ) : null}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className="pvc-cta"
          onClick={(e) => {
            e.stopPropagation();
            goToVendor();
          }}
        >
          לפרטים ולחבילות
          <i className="fas fa-arrow-left" />
        </button>
        <button
          type="button"
          className={`pvc-cart${inCart ? ' is-added' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleCart(vendor.id);
            if (!inCart) {
              setJustAdded(true);
              window.setTimeout(() => setJustAdded(false), 2200);
            }
          }}
        >
          <i className={`fas ${inCart ? 'fa-check' : 'fa-cart-plus'}`} />
          {inCart ? 'נוסף לסל' : 'הוספה לסל'}
        </button>
        {justAdded ? (
          <div className="pvc-toast" role="status">
            נוסף לסל שלכם
            <span>אפשר להמשיך לבחור או לפתוח את הסל</span>
          </div>
        ) : null}
      </div>

      <style jsx>{`
        .pvc {
          background: #fff;
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          cursor: pointer;
          border: 1px solid var(--border-color);
          transition: border-color 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          animation: pvc-in 0.35s ease both;
        }
        .pvc:hover {
          border-color: #cfc9be;
          box-shadow: var(--shadow-premium);
        }
        @keyframes pvc-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pvc-media {
          position: relative;
          height: 220px;
          background: #eee;
          flex-shrink: 0;
        }
        .pvc-media :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .pvc-top {
          position: absolute;
          inset: 10px 10px auto 10px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          z-index: 2;
        }
        .pvc-badge {
          background: var(--charcoal);
          color: #fff;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .pvc-top-actions {
          display: flex;
          gap: 6px;
          margin-right: auto;
        }
        .pvc-fav {
          background: #fff;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #bbb;
          cursor: pointer;
          font-size: 0.95rem;
        }
        .pvc-fav.is-active { color: #c0392b; }

        .pvc-body {
          padding: 16px 16px 18px;
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }
        .pvc-title {
          font-family: var(--font-main);
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-dark);
          margin: 0;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pvc-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: var(--text-light);
          font-size: 0.84rem;
          font-weight: 500;
        }
        .pvc-loc {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pvc-loc i {
          color: var(--text-light);
          font-size: 0.75rem;
          flex-shrink: 0;
        }
        .pvc-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-dark);
          flex-shrink: 0;
        }
        .pvc-rating i {
          color: var(--primary-color);
          font-size: 0.72rem;
        }
        .pvc-rating strong { font-weight: 700; }
        .pvc-reviews {
          color: var(--text-light);
          font-weight: 500;
          font-size: 0.78rem;
        }

        .pvc-pricing {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 2px;
          padding-top: 10px;
          border-top: 1px solid var(--border-color);
        }
        .pvc-price-compare {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .pvc-price-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .pvc-price-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-light);
          letter-spacing: 0.02em;
        }
        .pvc-price-old {
          font-size: 0.92rem;
          color: #9a9a9a;
          text-decoration: line-through;
          font-weight: 500;
        }
        .pvc-price-col--fiesta .pvc-price-label {
          color: var(--primary-color);
        }
        .pvc-price-now {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-dark);
          display: inline-flex;
          align-items: baseline;
          gap: 4px;
          flex-wrap: wrap;
        }
        .pvc-price-single {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .pvc-from {
          font-size: 0.78rem;
          color: var(--text-light);
          font-weight: 500;
        }

        .pvc-price-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pvc-savings {
          background: rgba(143, 115, 68, 0.1);
          color: var(--primary-hover);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 4px 9px;
          border-radius: 4px;
        }
        .pvc-packages {
          background: var(--off-white);
          color: var(--text-light);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          white-space: nowrap;
          margin-right: auto;
        }

        .pvc-cta {
          margin-top: auto;
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 44px;
          padding: 10px 14px;
          border: none;
          border-radius: var(--radius-sm);
          background: var(--charcoal);
          color: #fff;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .pvc-cta:hover { background: #000; }
        .pvc-cta i { font-size: 0.75rem; opacity: 0.85; }
        .pvc-cart {
          width: 100%;
          min-height: 42px;
          padding: 9px 14px;
          border: 1px solid var(--charcoal);
          border-radius: var(--radius-sm);
          background: #fff;
          color: var(--charcoal);
          font-family: inherit;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, color 0.2s;
        }
        .pvc-cart:hover,
        .pvc-cart.is-added {
          background: var(--off-white);
          color: var(--primary-hover);
          border-color: var(--primary-color);
        }
        .pvc-toast {
          position: absolute;
          inset: auto 12px 12px;
          z-index: 3;
          padding: 10px 12px;
          border-radius: 8px;
          background: rgba(17,17,17,.95);
          color: #fff;
          font-size: .82rem;
          font-weight: 700;
          display: grid;
          gap: 2px;
          box-shadow: 0 8px 20px rgba(0,0,0,.18);
        }
        .pvc-toast span { font-size: .72rem; font-weight: 400; opacity: .8; }

        @media (max-width: 900px) {
          .pvc-media { height: 180px; }
          .pvc-title { font-size: 1rem; }
        }

        @media (max-width: 768px) {
          .pvc-media {
            height: 240px;
            min-height: 240px;
          }
          .pvc-body { padding: 16px 18px 18px; }
          .pvc-title { font-size: 1.12rem; }
          .pvc-price-now { font-size: 1.22rem; }
        }

        @media (max-width: 480px) {
          .pvc-media { height: 210px; min-height: 210px; }
          .pvc-price-compare { gap: 8px; }
        }
      `}</style>
    </article>
  );
}
