'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SUPPLIER_GROUPS, CATEGORY_IMAGES, CATEGORY_FALLBACK_IMAGE } from '@/lib/supplierGroups';
import { useAuth } from '@/context/AuthContext';

function VendorsHubContent() {
    const searchParams = useSearchParams();
    const { setEventPreference, eventPreference, eventProfile } = useAuth();
    const [vendors, setVendors] = useState([]);
    const eventFromUrl = searchParams.get('event');

    useEffect(() => {
        if (eventFromUrl) setEventPreference(eventFromUrl);
    }, [eventFromUrl, setEventPreference]);

    useEffect(() => {
        fetch('/api/vendors')
            .then((res) => res.json())
            .then((data) => setVendors(Array.isArray(data) ? data : []))
            .catch(() => setVendors([]));
    }, []);

    const categoryCounts = useMemo(() => {
        const counts = {};
        vendors.forEach((v) => {
            const type = v.type;
            counts[type] = (counts[type] || 0) + 1;
        });
        return counts;
    }, [vendors]);

    const activeEvent = eventFromUrl || eventPreference;
    const completedCount = eventProfile.completedCategories?.length || 0;

    return (
        <div className="vendors-hub">
            <section className="categories-section">
                <div className="container">
                    <div className="section-header">
                        <h1>איזה ספקים אתם מחפשים?</h1>
                        <p>
                            {activeEvent
                                ? `בונים אירוע מסוג ${activeEvent} — בחרו קטגוריה והמשיכו לסל.`
                                : 'בואו נבנה את האירוע — בחרו קטגוריה, השוו מחירים והוסיפו לסל.'}
                        </p>
                    </div>
                    <div className="event-context">
                        <div>
                            <strong>{activeEvent ? `האירוע: ${activeEvent}` : 'עוד לא הגדרתם אירוע'}</strong>
                            <span>
                                {completedCount > 0
                                    ? `${completedCount} קטגוריות כבר סגורות — נציג רק מה שעוד רלוונטי.`
                                    : 'הגדירו מה כבר סגרתם וקבלו בחירה ממוקדת יותר.'}
                            </span>
                        </div>
                        <div className="event-context-links">
                            <Link href="/my-event">האירוע שלי</Link>
                            <Link href="/event-setup">עדכון פרטים</Link>
                        </div>
                    </div>

                    <div className="categories-grouped">
                        {SUPPLIER_GROUPS.map((group) => {
                            const availableSuppliers = group.suppliers.filter(
                                (supplier) => !eventProfile.completedCategories?.includes(supplier.type),
                            );
                            if (availableSuppliers.length === 0) return null;
                            return (
                            <div key={group.id} className="cat-group-block">
                                <div className="cat-group-header">
                                    <i className={`fas ${group.icon}`}></i>
                                    <h2>{group.label}</h2>
                                </div>
                                <div className="categories-visual-grid">
                                    {availableSuppliers.map((s) => {
                                        const count = categoryCounts[s.type] || 0;
                                        return (
                                            <Link href={`/category/${s.type}`} key={s.type} className="cat-card-link">
                                                <div className="cat-card-visual">
                                                    <div className="cat-img-wrapper">
                                                        <img
                                                            src={CATEGORY_IMAGES[s.type] || CATEGORY_FALLBACK_IMAGE}
                                                            alt={s.title}
                                                            loading="lazy"
                                                        />
                                                        <div className="cat-overlay-premium"></div>
                                                    </div>
                                                    <div className="cat-info-premium">
                                                        <div className="cat-meta">
                                                            <i className={`fas ${s.icon}`}></i>
                                                            {count > 0 && <span className="cat-count">{count} ספקים</span>}
                                                        </div>
                                                        <h3>{s.title}</h3>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <style jsx>{`
                .vendors-hub { background: var(--white); min-height: 70vh; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }

                .categories-section { padding: 72px 0 80px; background: var(--white); }
                .section-header { text-align: right; margin-bottom: 36px; }
                .section-header h1 {
                    font-size: clamp(1.7rem, 3vw, 2.2rem);
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: var(--text-dark);
                }
                .section-header p { color: var(--text-light); font-size: 1rem; }
                .event-context {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 14px 16px;
                    margin-bottom: 34px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    background: var(--off-white);
                }
                .event-context div { display: grid; gap: 3px; }
                .event-context strong { font-size: .9rem; color: var(--text-dark); }
                .event-context span { font-size: .84rem; color: var(--text-light); }
                .event-context a { color: var(--primary-hover); font-size: .85rem; font-weight: 700; white-space: nowrap; }
                .event-context-links { display: flex; gap: 14px; flex-shrink: 0; }

                .categories-grouped { display: flex; flex-direction: column; gap: 40px; }
                .cat-group-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 16px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid var(--border-color);
                }
                .cat-group-header i { color: var(--primary-color); font-size: 0.9rem; opacity: 0.85; }
                .cat-group-header h2 {
                    font-family: var(--font-main);
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--text-dark);
                    margin: 0;
                }

                .categories-visual-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 12px;
                }
                .cat-card-link { text-decoration: none; display: block; }
                .cat-card-visual {
                    position: relative;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    height: 160px;
                    background: #f0eeea;
                    transition: opacity 0.2s;
                }
                .cat-card-visual:hover { opacity: 0.92; }
                .cat-img-wrapper { position: absolute; inset: 0; z-index: 1; }
                .cat-img-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.5s ease;
                    filter: brightness(0.78);
                }
                .cat-card-visual:hover .cat-img-wrapper img { transform: scale(1.04); }
                .cat-overlay-premium {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 55%, transparent 100%);
                    z-index: 2;
                }
                .cat-info-premium {
                    position: relative;
                    z-index: 3;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 14px;
                    color: #fff;
                    text-align: right;
                }
                .cat-meta { display: flex; flex-direction: row-reverse; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 8px; }
                .cat-count { font-size: 0.72rem; color: rgba(255,255,255,0.8); font-weight: 500; }
                .cat-info-premium i { font-size: 0.85rem; color: rgba(255,255,255,0.75); }
                .cat-info-premium h3 {
                    font-family: var(--font-main);
                    font-size: 0.98rem;
                    font-weight: 600;
                    margin: 0;
                    line-height: 1.25;
                    color: #fff;
                }

                @media (max-width: 768px) {
                    .container { padding: 0 16px; }
                    .categories-section { padding: 48px 0 calc(var(--mobile-chrome-clearance, 64px) + 24px); }
                    .categories-visual-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    .cat-card-visual { height: 140px; }
                    .section-header { text-align: center; }
                    .event-context { align-items: flex-start; text-align: right; }
                }

                @media (max-width: 480px) {
                    .cat-card-visual { height: 128px; }
                }
            `}</style>
        </div>
    );
}

export default function VendorsPage() {
    return (
        <Suspense fallback={<div style={{ padding: '80px 20px', textAlign: 'center' }}>טוען...</div>}>
            <VendorsHubContent />
        </Suspense>
    );
}
