'use client';

export default function AudienceTabs({ value = 'customer', onChange, id = 'audience' }) {
    return (
        <div className="audience-tabs" role="tablist" aria-label="בחירת סוג משתמש">
            <button
                type="button"
                id={`${id}-customer`}
                role="tab"
                aria-selected={value === 'customer'}
                className={value === 'customer' ? 'is-active' : ''}
                onClick={() => onChange?.('customer')}
            >
                לקוח
            </button>
            <button
                type="button"
                id={`${id}-vendor`}
                role="tab"
                aria-selected={value === 'vendor'}
                className={value === 'vendor' ? 'is-active' : ''}
                onClick={() => onChange?.('vendor')}
            >
                ספקים
            </button>
        </div>
    );
}
