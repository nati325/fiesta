'use client';

import { useMemo, useState } from 'react';
import { uploadVendorFile } from '@/lib/vendorFormUtils';
import {
  priceProduct,
  supplierNetPercent,
  isLowMargin,
  LOW_MARGIN_THRESHOLD_PERCENT,
  toAmount,
} from '@/lib/pricing';

const PRODUCT_KINDS = [
  { value: 'main', label: 'חבילה' },
  { value: 'addon', label: 'תוספת' },
];

function makeProduct(index) {
  return {
    id: `p${Date.now().toString(36)}${index}`,
    name: '',
    description: '',
    originalPrice: '',
    price: '',
    image: '',
    kind: 'main',
    commissionAmount: 0,
    order: index,
    active: true,
  };
}

function formatIls(value) {
  const n = Number(value) || 0;
  return `₪${n.toLocaleString('he-IL')}`;
}

/** A product is stale when its stored numbers no longer match the current rates. */
function isStale(product, discountPercent, commissionPercent) {
  const list = toAmount(product.originalPrice);
  if (!list) return false;
  const expected = priceProduct(list, discountPercent, commissionPercent);
  return (
    expected.clientPrice !== toAmount(product.price) ||
    expected.commission !== (Number(product.commissionAmount) || 0)
  );
}

function applyRates(product, discountPercent, commissionPercent) {
  const computed = priceProduct(product.originalPrice, discountPercent, commissionPercent);
  if (!computed.listPrice) return product;
  return {
    ...product,
    price: String(computed.clientPrice),
    commissionAmount: computed.commission,
  };
}

export default function VendorProductsManager({
  products = [],
  discountPercent = 0,
  commissionPercent = 0,
  discountIsPercent = true,
  onChange,
}) {
  const [uploadingId, setUploadingId] = useState('');

  const rate = discountIsPercent ? discountPercent : 0;

  const emit = (nextProducts) => {
    onChange(nextProducts.map((p, i) => ({ ...p, order: i })));
  };

  const updateRow = (index, patch) => {
    const next = products.map((p, i) => {
      if (i !== index) return p;
      const merged = { ...p, ...patch };
      // Editing the list price re-derives that row; editing the client price is
      // treated as a deliberate override and is left alone.
      return 'originalPrice' in patch ? applyRates(merged, rate, commissionPercent) : merged;
    });
    emit(next);
  };

  const removeRow = (index) => emit(products.filter((_, i) => i !== index));

  const moveRow = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= products.length) return;
    const next = [...products];
    [next[index], next[target]] = [next[target], next[index]];
    emit(next);
  };

  const addRow = () => emit([...products, makeProduct(products.length)]);

  const handleRowImage = async (index, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const rowId = products[index]?.id;
    setUploadingId(rowId);
    try {
      const data = await uploadVendorFile(file, 'image');
      updateRow(index, { image: data.url });
    } catch (err) {
      alert(err.message || 'שגיאה בהעלאת התמונה');
    } finally {
      setUploadingId('');
    }
  };

  const staleCount = useMemo(
    () => products.filter((p) => isStale(p, rate, commissionPercent)).length,
    [products, rate, commissionPercent]
  );

  const recalculateAll = () => {
    emit(products.map((p) => applyRates(p, rate, commissionPercent)));
  };

  const totals = useMemo(() => {
    const active = products.filter((p) => p.active !== false);
    return {
      list: active.reduce((sum, p) => sum + toAmount(p.originalPrice), 0),
      client: active.reduce((sum, p) => sum + toAmount(p.price), 0),
      commission: active.reduce((sum, p) => sum + (Number(p.commissionAmount) || 0), 0),
    };
  }, [products]);

  const netPercent = supplierNetPercent(rate, commissionPercent);
  const lowMargin = products.length > 0 && isLowMargin(rate, commissionPercent);

  return (
    <div style={{ marginTop: '16px' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800 }}>
        מוצרים ומחירים ({products.length})
      </h3>
      <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#64748b' }}>
        הזינו מחיר מחירון לכל מוצר. מחיר הלקוח והעמלה מחושבים לפי ההנחה ואחוז העמלה שלמעלה.
        חבילות הן חלופות שהלקוח בוחר ביניהן, תוספות נמכרות על גבי חבילה.
      </p>

      {!discountIsPercent && products.length > 0 && (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '10px',
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#92400e',
            marginBottom: '12px',
          }}
        >
          ההנחה מוגדרת בשקלים, ולכן לא ניתן להחיל אותה על כל המוצרים. עברו להנחה באחוזים כדי
          שהמחירים יחושבו אוטומטית.
        </div>
      )}

      {lowMargin && (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#991b1b',
            marginBottom: '12px',
          }}
        >
          אחרי הנחה של {rate}% ועמלה של {commissionPercent}%, הספק מקבל רק {netPercent}% מהמחירון
          (הסף המומלץ הוא {LOW_MARGIN_THRESHOLD_PERCENT}%).
        </div>
      )}

      {staleCount > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
            padding: '10px 12px',
            borderRadius: '10px',
            background: '#eff6ff',
            border: '1px solid #93c5fd',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e40af' }}>
            {staleCount} מוצרים לא תואמים לאחוזים הנוכחיים.
          </span>
          <button
            type="button"
            onClick={recalculateAll}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563eb',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            חשב מחדש את כולם
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gap: '10px' }}>
        {products.map((product, index) => {
          const computed = priceProduct(product.originalPrice, rate, commissionPercent);
          const inactive = product.active === false;
          return (
            <div
              key={product.id || index}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                background: inactive ? '#f8fafc' : 'white',
                opacity: inactive ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <label
                  style={{
                    width: 68,
                    height: 68,
                    flexShrink: 0,
                    borderRadius: '10px',
                    border: '1.5px dashed #94a3b8',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <i
                      className={uploadingId === product.id ? 'fas fa-spinner fa-spin' : 'fas fa-camera'}
                      style={{ color: '#94a3b8' }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleRowImage(index, e)}
                  />
                </label>

                <div style={{ flex: '1 1 240px', display: 'grid', gap: '8px' }}>
                  <input
                    value={product.name}
                    onChange={(e) => updateRow(index, { name: e.target.value })}
                    placeholder="שם המוצר, למשל: שמלה בעיצוב אישי"
                    style={{
                      width: '100%',
                      padding: '9px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                    }}
                  />
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                      gap: '8px',
                    }}
                  >
                    <select
                      value={product.kind || 'main'}
                      onChange={(e) => updateRow(index, { kind: e.target.value })}
                      style={{
                        padding: '9px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontFamily: 'inherit',
                        fontSize: '0.85rem',
                      }}
                    >
                      {PRODUCT_KINDS.map((k) => (
                        <option key={k.value} value={k.value}>
                          {k.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={product.originalPrice}
                      onChange={(e) => updateRow(index, { originalPrice: e.target.value })}
                      placeholder="מחירון ₪"
                      style={{
                        padding: '9px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontFamily: 'inherit',
                        fontSize: '0.85rem',
                      }}
                    />
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => updateRow(index, { price: e.target.value })}
                      placeholder="ללקוח ₪"
                      style={{
                        padding: '9px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontFamily: 'inherit',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                    {computed.listPrice > 0 ? (
                      <>
                        חוסך {formatIls(computed.savings)} · עמלת Fiesta{' '}
                        {formatIls(Number(product.commissionAmount) || computed.commission)}
                      </>
                    ) : (
                      'הזינו מחיר מחירון כדי לחשב'
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => moveRow(index, -1)}
                      disabled={index === 0}
                      title="הזז למעלה"
                      style={iconBtn}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRow(index, 1)}
                      disabled={index === products.length - 1}
                      title="הזז למטה"
                      style={iconBtn}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      title="מחק מוצר"
                      style={{ ...iconBtn, color: '#dc2626', borderColor: '#fecaca' }}
                    >
                      ✕
                    </button>
                  </div>
                  <label style={miniToggle}>
                    <input
                      type="checkbox"
                      checked={product.active !== false}
                      onChange={(e) => updateRow(index, { active: e.target.checked })}
                    />
                    פעיל
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addRow}
        style={{
          marginTop: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          borderRadius: 10,
          border: '1.5px dashed #94a3b8',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.85rem',
          color: '#334155',
          background: '#f8fafc',
          fontFamily: 'inherit',
        }}
      >
        <i className="fas fa-plus" />
        הוסף מוצר
      </button>

      {products.length > 0 && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: '#f1f5f9',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#334155',
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <span>סה״כ מחירון: {formatIls(totals.list)}</span>
          <span>סה״כ ללקוח: {formatIls(totals.client)}</span>
          <span>סה״כ עמלה: {formatIls(totals.commission)}</span>
        </div>
      )}
    </div>
  );
}

const iconBtn = {
  width: 30,
  height: 30,
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: 'white',
  cursor: 'pointer',
  fontWeight: 800,
  fontSize: '0.8rem',
  color: '#475569',
  fontFamily: 'inherit',
};

const miniToggle = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#475569',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
};
