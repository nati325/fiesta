'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { vendorHasCategory } from '@/lib/vendorCategories';
import VendorCard from '@/components/VendorCard';
import { getVendorDisplayPrice, parsePrice, parsePriceRange } from '@/lib/vendorPrice';
import { vendorMatchesArea } from '@/lib/vendorRegion';

function sortPriceValue(vendor) {
    const info = getVendorDisplayPrice(vendor);
    const range = parsePriceRange(info.raw);
    if (range) return range.min;
    return parsePrice(info.raw) ?? Number.POSITIVE_INFINITY;
}

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const type = Array.isArray(params.type) ? params.type[0] : params.type;
    const { eventPreference, rememberCategoryVisit } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [vendorsLoading, setVendorsLoading] = useState(true);
    const [sortBy, setSortBy] = useState('popularity');
    const [area, setArea] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState('');

    useEffect(() => {
        if (type) rememberCategoryVisit(type);
    }, [type, rememberCategoryVisit]);

    const matchesEventPreference = (v) => {
        if (!eventPreference) return true;
        const events = Array.isArray(v.eventTypes) ? v.eventTypes : [];
        if (events.length === 0 || events.includes('מתאים לכל האירועים')) return true;
        if (events.includes(eventPreference)) return true;
        if (eventPreference === 'בר/בת מצווה' || eventPreference === 'בר מצווה' || eventPreference === 'בת מצווה') {
            return events.includes('בר מצווה') || events.includes('בת מצווה') || events.includes('בר/בת מצווה');
        }
        if (eventPreference === 'ברית' || eventPreference === 'בריתה') {
            return events.includes('ברית') || events.includes('בריתה');
        }
        return false;
    };
    
    useEffect(() => {
        // Same source as the homepage — don't depend on VendorContext for the list.
        let cancelled = false;
        setVendorsLoading(true);

        fetch('/api/vendors')
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return;
                const all = Array.isArray(data) ? data : [];
                const matched = all.filter((v) => {
                    if (!vendorHasCategory(v, type)) return false;
                    if (!vendorMatchesArea(v, area)) return false;
                    const price = sortPriceValue(v);
                    if (maxPrice && price !== Number.POSITIVE_INFINITY && price > Number(maxPrice)) return false;
                    if (minRating && Number(v.googleRating || 0) < Number(minRating)) return false;
                    return true;
                });

                const sorted = [...matched].sort((a, b) => {
                    if (eventPreference) {
                        const am = matchesEventPreference(a) ? 1 : 0;
                        const bm = matchesEventPreference(b) ? 1 : 0;
                        if (bm !== am) return bm - am;
                    }
                    if (sortBy === 'price-low') return sortPriceValue(a) - sortPriceValue(b);
                    if (sortBy === 'price-high') return sortPriceValue(b) - sortPriceValue(a);
                    const ra = Number(a.googleRating) || 0;
                    const rb = Number(b.googleRating) || 0;
                    if (rb !== ra) return rb - ra;
                    const ca = Number(a.googleReviewsCount) || 0;
                    const cb = Number(b.googleReviewsCount) || 0;
                    if (cb !== ca) return cb - ca;
                    return String(a.name || '').localeCompare(String(b.name || ''), 'he');
                });

                setVendors(sorted);
            })
            .catch(() => {
                if (!cancelled) setVendors([]);
            })
            .finally(() => {
                if (!cancelled) setVendorsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [type, eventPreference, sortBy, area, maxPrice, minRating]);

    const categoryData = {
        'dj': { label: 'DJ ומוזיקה', img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80' },
        'photographer': { label: 'צילום אירועים', img: '/images/event_photographer.png' },
        'alcohol': { label: 'אלכוהול ובר', img: '/images/bar_hero.png' },
        'catering': { label: 'קייטרינג', img: '/images/catering.jpeg' },
        'venue': { label: 'אולמות וגנים', img: '/images/venue_hero.png' },
        'design': { label: 'עיצוב אירועים', img: '/images/wedding_floral_arch_1765744424651.png' },
        'dresses': { label: 'שמלות כלה', img: '/images/wedding_dress.jpeg' },
        'suits': { label: 'חליפות חתן', img: '/images/groom_suits.jpeg' },
        'bride-shoes': { label: 'נעלי כלה', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80' },
        'groom-shoes': { label: 'נעלי חתן', img: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=1200&q=80' },
        'hair': { label: 'עיצוב שיער', img: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=80' },
        'makeup': { label: 'איפור', img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80' },
        'rings': { label: 'טבעות נישואין', img: '/images/jewelry_hero.png' },
        'event-production': { label: 'הפקת אירועים', img: '/images/event_production.jpeg' },
        'rsvp': { label: 'אישורי הגעה', img: 'https://images.unsplash.com/photo-1512418490979-92798ccc13fb?auto=format&fit=crop&w=1200&q=80' },
        'invitations': { label: 'הזמנות', img: '/images/invitations_hero.png' },
        'transportation': { label: 'הסעות', img: '/images/car_hero.png' },
        'cars': { label: 'רכבי יוקרה', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80' },
        'equipment-rental': { label: 'השכרת ציוד', img: '/images/wedding_table_detail_1765744408525.png' },
        'rabbi': { label: 'רב לחופה', img: '/images/rabbi.jpeg' },
        'cantors': { label: 'חזנים ופייטנים', img: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=1200&q=80' },
        'singers': { label: 'זמרים ולהקות', img: '/images/entertainment_hero.png' },
        'religious-bands': { label: 'להקות דתיות', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80' },
        'challa': { label: 'הפרשת חלה', img: 'https://images.unsplash.com/photo-1610452399201-9a7076594d2f?auto=format&fit=crop&w=1200&q=80' },
        'attractions': { label: 'אטרקציות', img: '/images/attractions_hero.png' },
        'souvenirs': { label: 'מזכרות', img: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=80' },
        'hotels': { label: 'מלונות', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
        'bachelor': { label: 'מסיבות רווקים', img: 'https://images.unsplash.com/photo-1514525253344-f81bcd3ce942?auto=format&fit=crop&w=1200&q=80' },
        'getting-ready': { label: 'התארגנות כלה', img: '/images/wedding_lounge_1765744440712.png' },
        'dietitians': { label: 'תזונה ודיאטה', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80' },
        'personal-training': { label: 'כושר ואימון', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80' }
    };

    const currentCategory = categoryData[type] || { label: 'ספקים', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80' };

    return (
        <div className="category-page">
            {/* Header Hero Area */}
            <div className="category-hero">
                <img src={currentCategory.img} alt={currentCategory.label} className="category-hero-img" />
                <div className="category-hero-overlay" />
                <div className="category-hero-text">
                    <h1>{currentCategory.label}</h1>
                    <div className="category-hero-meta">
                        <div className="category-hero-line"></div>
                        <p>{vendors.length} ספקים מובילים מחכים לכם</p>
                    </div>
                </div>
                <button
                    onClick={() => router.back()}
                    className="category-back-btn"
                    aria-label="חזרה"
                >
                    <i className="fas fa-arrow-right"></i>
                </button>
            </div>

            <div className="container category-content">
                <div className="category-filters" aria-label="סינון ספקים">
                    <select value={area} onChange={(e) => setArea(e.target.value)} aria-label="אזור">
                        <option value="">כל האזורים</option>
                        <option value="מרכז">מרכז</option>
                        <option value="צפון">צפון</option>
                        <option value="דרום">דרום</option>
                        <option value="ירושלים">ירושלים</option>
                        <option value="שרון">שרון</option>
                    </select>
                    <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} aria-label="תקציב">
                        <option value="">כל התקציבים</option>
                        <option value="3000">עד ₪3,000</option>
                        <option value="5000">עד ₪5,000</option>
                        <option value="10000">עד ₪10,000</option>
                        <option value="20000">עד ₪20,000</option>
                    </select>
                    <select value={minRating} onChange={(e) => setMinRating(e.target.value)} aria-label="דירוג">
                        <option value="">כל הדירוגים</option>
                        <option value="4">4 כוכבים ומעלה</option>
                        <option value="4.5">4.5 כוכבים ומעלה</option>
                    </select>
                </div>
                {/* Sorting Bar */}
                <div className="category-sort-bar">
                    <div className="category-count">
                        {vendors.length} ספקים נמצאו
                    </div>
                    <div className="category-sort-chips">
                        {[
                            { id: 'popularity', label: 'פופולריות' },
                            { id: 'price-low', label: 'מהזול ליקר' },
                            { id: 'price-high', label: 'מהיקר לזול' },
                        ].map(btn => (
                            <button
                                key={btn.id}
                                onClick={() => setSortBy(btn.id)}
                                className={`category-sort-chip ${sortBy === btn.id ? 'active' : ''}`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {vendorsLoading ? (
                        <div className="category-empty">
                            <h2>טוענים ספקים...</h2>
                        </div>
                    ) : vendors.length === 0 ? (
                        <div className="category-empty">
                            <h2>אין עדיין ספקים בקטגוריה זו</h2>
                            <p style={{ color: 'var(--text-light)', marginTop: 8 }}>נחזור אליכם בקרוב עם נבחרת מעודכנת.</p>
                        </div>
                    ) : (
                        <div className="vendor-cards-grid">
                            {vendors.map((v, i) => (
                                <VendorCard key={v.id} vendor={v} index={i} />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .category-page {
                    min-height: 100vh;
                    background: var(--white);
                    padding-bottom: calc(var(--mobile-chrome-clearance, 24px) + 8px);
                }
                .category-hero {
                    height: 32vh;
                    min-height: 240px;
                    position: relative;
                    overflow: hidden;
                }
                .category-hero-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    filter: brightness(0.72);
                }
                .category-hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(12,12,12,0.75) 0%, rgba(12,12,12,0.2) 55%, transparent 100%);
                }
                .category-hero-text {
                    position: absolute;
                    bottom: 32px;
                    right: 40px;
                    left: 40px;
                    color: white;
                    text-align: right;
                }
                .category-hero-text h1 {
                    font-size: clamp(1.7rem, 4vw, 2.4rem);
                    font-weight: 500;
                    margin-bottom: 6px;
                    font-family: var(--font-display);
                    color: #fff;
                }
                .category-hero-meta {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    justify-content: flex-end;
                }
                .category-hero-line { display: none; }
                .category-hero-text p {
                    font-size: 0.95rem;
                    opacity: 0.8;
                    font-weight: 400;
                    margin: 0;
                }
                .category-back-btn {
                    position: absolute;
                    top: calc(12px + env(safe-area-inset-top, 0px));
                    left: 20px;
                    z-index: 10;
                    color: white;
                    background: rgba(0,0,0,0.35);
                    width: 44px;
                    height: 44px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.15);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .category-back-btn i { font-size: 0.85rem; }
                .category-content {
                    max-width: 1200px;
                    margin-top: 24px;
                }
                .category-filters {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin: 0 8px 18px;
                }
                .category-filters select {
                    min-height: 42px;
                    min-width: 150px;
                    padding: 8px 12px;
                    border: 1px solid #e5e2dc;
                    border-radius: var(--radius-sm);
                    background: #fff;
                    color: var(--text-dark);
                    font: inherit;
                }
                .category-sort-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding: 0 8px;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .category-count {
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: var(--text-light);
                }
                .category-sort-chips {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding-bottom: 4px;
                    -webkit-overflow-scrolling: touch;
                    max-width: 100%;
                }
                .category-sort-chip {
                    padding: 8px 14px;
                    border-radius: 6px;
                    border: 1px solid #e5e2dc;
                    background: white;
                    color: var(--text-light);
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: border-color 0.2s, background 0.2s, color 0.2s;
                    font-family: inherit;
                    min-height: 44px;
                    flex-shrink: 0;
                }
                .category-sort-chip.active {
                    background: var(--charcoal);
                    color: white;
                    border-color: var(--charcoal);
                }
                .category-empty {
                    text-align: center;
                    padding: 60px 20px;
                    background: var(--off-white);
                    border-radius: var(--radius-md);
                }
                .category-empty h2 {
                    font-size: 1.2rem;
                    font-weight: 500;
                }

                .vendor-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    padding: 0 8px 16px;
                }

                @media (min-width: 1100px) {
                    .vendor-cards-grid {
                        grid-template-columns: repeat(4, 1fr);
                        gap: 20px;
                    }
                }

                @media (max-width: 900px) {
                    .vendor-cards-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                    }
                }

                @media (max-width: 768px) {
                    .category-hero {
                        height: 26vh;
                        min-height: 180px;
                        max-height: 220px;
                    }
                    .category-hero-text {
                        bottom: 18px;
                        right: 16px;
                        left: 16px;
                    }
                    .category-hero-text h1 { font-size: 1.55rem; margin-bottom: 4px; }
                    .category-hero-text p { font-size: 0.85rem; }
                    .category-back-btn { top: 12px; left: 12px; }
                    .category-content { margin-top: 14px; padding: 0 14px; }
                    .category-filters { margin: 0 0 14px; }
                    .category-filters select { flex: 1 1 140px; min-width: 0; }
                    .category-sort-bar {
                        flex-direction: column;
                        align-items: stretch;
                        padding: 0;
                        margin-bottom: 14px;
                        gap: 10px;
                    }
                    .category-count { font-size: 0.9rem; }
                    .vendor-cards-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                        padding: 0 0 24px;
                    }
                }

                @media (max-width: 480px) {
                    .category-hero { min-height: 160px; max-height: 200px; }
                    .category-hero-text h1 { font-size: 1.4rem; }
                }
            `}</style>
        </div>
    );
}
