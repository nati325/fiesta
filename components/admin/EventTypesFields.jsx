'use client';

import { ALL_EVENTS_LABEL, FIESTA_EVENT_TYPES } from '@/lib/eventTypes';
import { priceProduct, toAmount, toPercent } from '@/lib/pricing';

function formatIls(n) {
  return `₪${Math.round(n).toLocaleString('he-IL')}`;
}

function blankRow(type, existing) {
  return existing || {
    eventType: type,
    originalPrice: '',
    price: '',
    discount: '',
    discountType: 'percent',
    commissionPercent: '',
    commissionAmount: 0,
  };
}

function computeRow(row) {
  const computed = priceProduct(row.originalPrice, row.discount, row.commissionPercent);
  return {
    ...row,
    discountType: 'percent',
    price: computed.listPrice ? String(computed.clientPrice) : '',
    commissionAmount: computed.commission,
  };
}

export default function EventTypesFields({
  eventTypes = [],
  eventPrices = [],
  onChange,
}) {
  const fitsAll = eventTypes.includes(ALL_EVENTS_LABEL);
  const selected = fitsAll
    ? []
    : FIESTA_EVENT_TYPES.filter((et) => eventTypes.includes(et));
  const samePrice = !(eventPrices || []).some((row) => row?.eventType);
  const hasMultiple = fitsAll || selected.length >= 2;
  const rowTypes = fitsAll ? FIESTA_EVENT_TYPES : selected;

  const emit = (nextTypes, nextPrices, { all, same } = {}) => {
    const isAll = Boolean(all);
    const isSame = same !== undefined ? same : samePrice;
    onChange({
      eventTypes: isAll ? [ALL_EVENTS_LABEL] : nextTypes,
      eventPrices: isSame ? [] : nextPrices,
      eventTypesExplicit: true,
    });
  };

  const setAll = () => {
    const prices = samePrice
      ? []
      : FIESTA_EVENT_TYPES.map((type) =>
          blankRow(type, (eventPrices || []).find((row) => row.eventType === type))
        );
    emit([], prices, { all: true, same: samePrice });
  };

  const toggle = (et) => {
    const next = selected.includes(et)
      ? selected.filter((item) => item !== et)
      : [...selected, et];
    const prices = samePrice
      ? []
      : next.map((type) =>
          blankRow(type, (eventPrices || []).find((row) => row.eventType === type))
        );
    emit(next, prices, { all: false, same: samePrice });
  };

  const setSamePrice = (same) => {
    if (same) {
      emit(selected, [], { all: fitsAll, same: true });
      return;
    }
    const prices = rowTypes.map((type) =>
      blankRow(type, (eventPrices || []).find((row) => row.eventType === type))
    );
    emit(selected, prices, { all: fitsAll, same: false });
  };

  const updateRow = (et, field, value) => {
    const prices = rowTypes.map((type) => {
      const existing = blankRow(
        type,
        (eventPrices || []).find((row) => row.eventType === type)
      );
      if (type !== et) return existing;
      return computeRow({ ...existing, [field]: value });
    });
    emit(selected, prices, { all: fitsAll, same: false });
  };

  const choiceBtn = (active) => ({
    padding: '10px 8px',
    borderRadius: '10px',
    border: active ? '2px solid #8F7344' : '1px solid #ddd',
    background: active ? '#f5efe6' : 'white',
    fontWeight: 800,
    fontSize: '0.82rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  });

  return (
    <div className="crm-input-group" style={{ gridColumn: '1 / -1' }}>
      <label>לאילו אירועים הספק מתאים?</label>
      <button
        type="button"
        onClick={setAll}
        style={{
          width: '100%',
          margin: '6px 0 10px',
          padding: '10px',
          borderRadius: '10px',
          border: fitsAll ? '2px solid #8F7344' : '1px solid #ddd',
          background: fitsAll ? '#f5efe6' : 'white',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        {fitsAll ? '✓ ' : ''}כל האירועים
      </button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {FIESTA_EVENT_TYPES.map((et) => {
          const on = selected.includes(et);
          return (
            <button
              key={et}
              type="button"
              onClick={() => toggle(et)}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                border: on ? '1.5px solid #8F7344' : '1px solid #ddd',
                background: on ? '#f5efe6' : 'white',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {on ? '✓ ' : ''}{et}
            </button>
          );
        })}
      </div>

      {hasMultiple && (
        <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', fontWeight: 700 }}>
            האם יש הבדל במחיר בין האירועים?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button type="button" onClick={() => setSamePrice(true)} style={choiceBtn(samePrice)}>
              {samePrice ? '✓ ' : ''}אותו מחיר לכולם
            </button>
            <button type="button" onClick={() => setSamePrice(false)} style={choiceBtn(!samePrice)}>
              {!samePrice ? '✓ ' : ''}מחיר שונה לכל סוג
            </button>
          </div>
        </div>
      )}

      {!samePrice && rowTypes.length > 0 && (
        <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', fontWeight: 700 }}>
            מחירון, הנחה ללקוח (%) ועמלת החברה (%) לכל סוג אירוע
          </p>
          {rowTypes.map((et) => {
            const row = (eventPrices || []).find((item) => item.eventType === et) || {};
            const computed = priceProduct(row.originalPrice, row.discount, row.commissionPercent);
            return (
              <div
                key={et}
                style={{
                  border: '1px solid #e8e4dc',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'grid',
                  gap: '8px',
                }}
              >
                <strong style={{ fontSize: '0.85rem' }}>{et}</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="מחירון ₪"
                    value={row.originalPrice || ''}
                    onChange={(e) => updateRow(et, 'originalPrice', e.target.value)}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="הנחה ללקוח %"
                    value={row.discount || ''}
                    onChange={(e) => updateRow(et, 'discount', e.target.value)}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="עמלה לחברה %"
                    value={row.commissionPercent || ''}
                    onChange={(e) => updateRow(et, 'commissionPercent', e.target.value)}
                  />
                </div>
                {computed.listPrice > 0 && (
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534' }}>
                    ללקוח {formatIls(computed.clientPrice)}
                    {toPercent(row.discount) > 0 ? ` · חוסך ${formatIls(computed.savings)}` : ''}
                    {toPercent(row.commissionPercent) > 0 ? ` · לחברה ${formatIls(computed.commission)}` : ''}
                    {toAmount(row.price) > 0 && Number(row.price) !== computed.clientPrice
                      ? ` · שמור: ${formatIls(row.price)}`
                      : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
