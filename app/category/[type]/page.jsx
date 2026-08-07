'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useVendors } from '@/context/VendorContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { resolveVendorImage } from '@/lib/vendorImage';
import VendorCardImage from '@/components/VendorCardImage';
import { EditChip } from '@/components/SiteEditBar';
import { getVendorDisplayPrice, getVendorDiscountBadge, getCheapestPackage, getPackages, parsePrice, parsePriceRange } from '@/lib/vendorPrice';
import { formatVendorRegions } from '@/lib/vendorRegion';

function sortPriceValue(vendor) {
    const info = getVendorDisplayPrice(vendor);
    const range = parsePriceRange(info.raw);
    if (range) return range.min;
    return parsePrice(info.raw) ?? Number.POSITIVE_INFINITY;
}

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const type = params.type;
    const { getVendorsByType, toggleFavorite, isFavorite, loading: vendorsLoading } = useVendors();
    const { eventPreference } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [sortBy, setSortBy] = useState('popularity');
    
    useEffect(() => {
        const allVendors = getVendorsByType(type);
        const filtered = allVendors.filter(v => 
            !eventPreference || 
            v.eventTypes?.includes(eventPreference) || 
            v.eventTypes?.includes('מתאים לכל האירועים') ||
            // Match onboarding "בר/בת מצווה" with either DB value
            (eventPreference === 'בר/בת מצווה' && (
                v.eventTypes?.includes('בר מצווה') || v.eventTypes?.includes('בת מצווה')
            ))
        );

        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'price-low') return sortPriceValue(a) - sortPriceValue(b);
            if (sortBy === 'price-high') return sortPriceValue(b) - sortPriceValue(a);
            // Popularity: real rating first, then review count, then name
            const ra = Number(a.googleRating) || 0;
            const rb = Number(b.googleRating) || 0;
            if (rb !== ra) return rb - ra;
            const ca = Number(a.googleReviewsCount) || 0;
            const cb = Number(b.googleReviewsCount) || 0;
            if (cb !== ca) return cb - ca;
            return String(a.name || '').localeCompare(String(b.name || ''), 'he');
        });

        setVendors(sorted);
    }, [type, getVendorsByType, eventPreference, sortBy]);

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
                            {vendors.map((v, i) => {
                                const cheapest = getCheapestPackage(v);
                                const packageCount = getPackages(v).length;

                                // Same package the card prices, so picture and price agree.
                                const displayImage = resolveVendorImage(cheapest?.image || v.image, '');
                                const priceInfo = getVendorDisplayPrice(v);
                                const displayName = v.name;
                                const discountBadge = getVendorDiscountBadge(v);
                                const hasRating = v.googleRating != null && String(v.googleRating).trim() !== '' && Number(v.googleRating) > 0 && Number(v.googleReviewsCount) > 0;

                                return (
                                    <motion.article
                                        key={v.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(i * 0.04, 0.4) }}
                                        className="vendor-card"
                                        onClick={() => router.push(`/vendor/${v.id}`)}
                                    >
                                        <div className="vendor-card-media">
                                            <VendorCardImage src={displayImage} alt={displayName} />

                                            <div className="vendor-card-top">
                                                {discountBadge && (
                                                    <span className="vendor-card-badge">
                                                        {discountBadge.type === 'amount' ? '₪' : ''}{discountBadge.value}{discountBadge.type === 'amount' ? '' : '%'} הנחה
                                                    </span>
                                                )}
                                                <div className="vendor-card-top-actions">
                                                    <EditChip
                                                        href={`/admin/vendors/${v.id}`}
                                                        label="ערוך"
                                                        style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/admin/vendors/${v.id}`);
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className={`vendor-card-fav ${isFavorite(v.id) ? 'active' : ''}`}
                                                        aria-label="מועדפים"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleFavorite(v.id);
                                                        }}
                                                    >
                                                        <i className={isFavorite(v.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="vendor-card-body">
                                            <h3 className="vendor-card-title">{displayName}</h3>

                                            <div className="vendor-card-meta">
                                                {(v.location || formatVendorRegions(v)) ? (
                                                    <span className="vendor-card-loc">
                                                        <i className="fas fa-map-marker-alt"></i>
                                                        {v.location || formatVendorRegions(v)}
                                                    </span>
                                                ) : null}
                                                {hasRating && (
                                                    <span className="vendor-card-rating">
                                                        <i className="fas fa-star"></i>
                                                        {Number(v.googleRating).toFixed(1)}
                                                    </span>
                                                )}
                                            </div>

                                            {priceInfo.display ? (
                                                <div className="vendor-card-price-row">
                                                    <div className="vendor-card-prices">
                                                        {priceInfo.originalDisplay && (
                                                            <span className="vendor-card-old">{priceInfo.originalDisplay}</span>
                                                        )}
                                                        {priceInfo.isFrom && <span className="vendor-card-from">החל מ־</span>}
                                                        <span className="vendor-card-price">{priceInfo.display}</span>
                                                    </div>
                                                    {packageCount > 1 && (
                                                        <span className="vendor-card-packages">{packageCount} חבילות</span>
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                    </motion.article>
                                );
                            })}
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
                .vendor-card {
                    background: #fff;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    cursor: pointer;
                    border: 1px solid var(--border-color);
                    transition: border-color 0.2s;
                    display: flex;
                    flex-direction: column;
                }
                .vendor-card:hover { border-color: #cfc9be; }
                .vendor-card-media {
                    position: relative;
                    height: 200px;
                    background: #eee;
                    flex-shrink: 0;
                }
                .vendor-card-media img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .vendor-card-top {
                    position: absolute;
                    inset: 10px 10px auto 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 8px;
                    z-index: 2;
                }
                .vendor-card-badge {
                    background: var(--charcoal);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 0.72rem;
                    font-weight: 600;
                }
                .vendor-card-top-actions {
                    display: flex;
                    gap: 6px;
                    margin-right: auto;
                }
                .vendor-card-fav {
                    background: white;
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
                .vendor-card-fav.active { color: #c0392b; }
                .vendor-card-body {
                    padding: 14px 16px 16px;
                    text-align: right;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 1;
                }
                .vendor-card-title {
                    font-family: var(--font-main);
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-dark);
                    margin: 0;
                    line-height: 1.35;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .vendor-card-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    color: var(--text-light);
                    font-size: 0.82rem;
                    font-weight: 500;
                }
                .vendor-card-loc {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    min-width: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .vendor-card-loc i { color: var(--text-light); font-size: 0.75rem; flex-shrink: 0; }
                .vendor-card-rating {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: var(--text-dark);
                    flex-shrink: 0;
                }
                .vendor-card-rating i { color: var(--primary-color); font-size: 0.7rem; }
                .vendor-card-price-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    margin-top: auto;
                    padding-top: 4px;
                }
                .vendor-card-prices {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                }
                .vendor-card-old {
                    font-size: 0.8rem;
                    color: #aaa;
                    text-decoration: line-through;
                }
                .vendor-card-price {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--text-dark);
                }
                .vendor-card-from {
                    font-size: 0.78rem;
                    color: var(--text-light);
                    font-weight: 500;
                }
                .vendor-card-packages {
                    background: var(--off-white);
                    color: var(--text-light);
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 4px;
                    border: 1px solid var(--border-color);
                    white-space: nowrap;
                }
                .vendor-card-save {
                    background: var(--off-white);
                    color: var(--text-dark);
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 4px;
                    border: 1px solid var(--border-color);
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
                    .vendor-card-media { height: 160px; }
                    .vendor-card-title { font-size: 0.95rem; }
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
                    .vendor-card-media {
                        width: 100%;
                        height: 220px;
                        min-height: 220px;
                    }
                    .vendor-card-body { padding: 16px 18px 18px; gap: 10px; }
                    .vendor-card-title { font-size: 1.1rem; }
                    .vendor-card-meta { font-size: 0.88rem; }
                    .vendor-card-price { font-size: 1.2rem; }
                }

                @media (max-width: 480px) {
                    .category-hero { min-height: 160px; max-height: 200px; }
                    .category-hero-text h1 { font-size: 1.4rem; }
                    .vendor-card-media { height: 200px; min-height: 200px; }
                }
            `}</style>
        </div>
    );
}
