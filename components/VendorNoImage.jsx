'use client';

/**
 * Neutral placeholder when a vendor has no real photo.
 * Not a stock/category image — signals that a photo still needs to be added.
 */
export default function VendorNoImage({ compact = false, label = 'אין תמונה כרגע' }) {
  return (
    <div
      className={`vendor-no-image${compact ? ' is-compact' : ''}`}
      role="img"
      aria-label={label}
    >
      <i className="fas fa-image" aria-hidden="true" />
      <span>{label}</span>
      {!compact && <small>צריך למצוא תמונה לספק הזה</small>}
      <style jsx>{`
        .vendor-no-image {
          width: 100%;
          height: 100%;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(160deg, #f3f1ec 0%, #e8e4dc 100%);
          color: #6b6560;
          text-align: center;
          padding: 16px;
          box-sizing: border-box;
        }
        .vendor-no-image i {
          font-size: 1.6rem;
          opacity: 0.55;
        }
        .vendor-no-image span {
          font-size: 0.95rem;
          font-weight: 700;
        }
        .vendor-no-image small {
          font-size: 0.75rem;
          opacity: 0.8;
          max-width: 220px;
          line-height: 1.4;
        }
        .vendor-no-image.is-compact {
          min-height: 0;
          gap: 6px;
          padding: 10px;
        }
        .vendor-no-image.is-compact i {
          font-size: 1.2rem;
        }
        .vendor-no-image.is-compact span {
          font-size: 0.78rem;
        }
      `}</style>
    </div>
  );
}
