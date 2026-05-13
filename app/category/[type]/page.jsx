'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useVendors } from '@/context/VendorContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const type = params.type;
    const { getVendorsByType, toggleFavorite, isFavorite } = useVendors();
    const { eventPreference } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [sortBy, setSortBy] = useState('popularity');
    
    useEffect(() => {
        const allVendors = getVendorsByType(type);
        const filtered = allVendors.filter(v => 
            !eventPreference || 
            v.eventTypes?.includes(eventPreference) || 
            v.eventTypes?.includes('מתאים לכל האירועים')
        );

        // Sort vendors
        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
            if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
            if (sortBy === 'rating') return 4.9 - 4.9; // Placeholder for real ratings
            return 0; // Default popularity
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
        'makeup': { label: 'איפור', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80' },
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
        <div style={{ minHeight: '100vh', background: '#fdfcf9', paddingBottom: '100px' }}>
            {/* Header Hero Area - More Impactful */}
            <div style={{
                height: '35vh',
                minHeight: '280px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <img src={currentCategory.img} alt={currentCategory.label} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: '40px', right: '40px', color: 'white', textAlign: 'right' }}>
                    <h1 style={{ 
                        fontSize: '3rem', 
                        fontWeight: 900, 
                        marginBottom: '8px',
                        textShadow: '0 4px 15px rgba(0,0,0,0.9)',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.02em'
                    }}>{currentCategory.label}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                        <div style={{ height: '2px', width: '40px', background: 'var(--primary-color)' }}></div>
                        <p style={{ 
                            fontSize: '1.1rem', 
                            opacity: 0.95, 
                            fontWeight: 600,
                            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                        }}>{vendors.length} ספקים מובילים מחכים לכם</p>
                    </div>
                </div>
                <button
                    onClick={() => router.back()}
                    style={{
                        position: 'absolute', top: '15px', left: '20px', zIndex: 10,
                        color: 'white', background: 'rgba(255,255,255,0.2)', width: '32px', height: '32px',
                        borderRadius: '50%', border: 'none', cursor: 'pointer', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <i className="fas fa-arrow-left" style={{ fontSize: '0.8rem' }}></i>
                </button>
            </div>

            <div className="container" style={{ maxWidth: '1200px', marginTop: '20px' }}>
                {/* Sorting Bar */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '20px', 
                    padding: '0 10px',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a' }}>
                        {vendors.length} ספקים נמצאו
                    </div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                        {[
                            { id: 'popularity', label: 'פופולריות' },
                            { id: 'price-low', label: 'מהזול ליקר' },
                            { id: 'price-high', label: 'מהיקר לזול' },
                            { id: 'rating', label: 'דירוג גוגל' }
                        ].map(btn => (
                            <button
                                key={btn.id}
                                onClick={() => setSortBy(btn.id)}
                                style={{
                                    padding: '6px 15px',
                                    borderRadius: '50px',
                                    border: '1px solid #eee',
                                    background: sortBy === btn.id ? 'var(--primary-color)' : 'white',
                                    color: sortBy === btn.id ? 'white' : '#666',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s',
                                    boxShadow: sortBy === btn.id ? '0 5px 15px rgba(212,175,55,0.2)' : 'none'
                                }}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {vendors.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '30px' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>מיד נציג את הספקים...</h2>
                        </div>
                    ) : (
                        <div className="gallery-grid-full-image" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '15px',
                            padding: '0 10px'
                        }}>
                            {vendors.map((v, i) => {
                                const mainProduct = v.products?.find(p => p.id === v.mainProductId) || (v.products && v.products.length > 0 ? v.products[0] : null);
                                
                                // Dynamic unique image logic
                                let displayImage = mainProduct?.image || v.image;
                                if (!displayImage || displayImage.trim() === '' || displayImage === currentCategory.img) {
                                    // Generate a unique unsplash image based on index and category type
                                    const seeds = [
                                        '1516280440614-37939bbacd41', '1571266028243-3716f02d2d2e', '1470229722913-7c090be05e7f', 
                                        '1598387181032-a3103a2db5b3', '1514525253161-7a46d19cd819', '1511285560929-80b456fea0bc',
                                        '1520854221256-17451cc331bf', '1537151608828-ea2b11777ee8'
                                    ];
                                    const seed = seeds[i % seeds.length];
                                    displayImage = `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=800&q=80`;
                                }

                                const displayPrice = mainProduct?.price || v.price;
                                const displayOriginalPrice = mainProduct?.originalPrice || v.originalPrice;
                                const displayName = mainProduct ? `${v.name} - ${mainProduct.name}` : v.name;

                                return (
                                <motion.div
                                    key={v.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        position: 'relative',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        aspectRatio: '1 / 1',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => router.push(`/vendor/${v.id}`)}
                                >
                                    {/* Full Background Image */}
                                    <img 
                                        src={displayImage} 
                                        alt={displayName} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        onError={(e) => { e.target.src = currentCategory.img; }}
                                    />
                                    
                                    {/* Overlay Gradient - Stronger for better contrast */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 35%, transparent 75%)'
                                    }} />

                                    {/* Badges & Favorites */}
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                                        {v.discount && (
                                            <div style={{ background: 'var(--primary-color)', color: 'white', padding: '3px 8px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 'bold', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                                                {v.discountType === 'amount' ? '₪' : ''}{v.discount}{v.discountType === 'amount' ? '' : '%'} הנחה
                                            </div>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(v.id);
                                            }}
                                            style={{
                                                background: 'white',
                                                border: 'none',
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: isFavorite(v.id) ? '#e74c3c' : '#ccc',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <i className={isFavorite(v.id) ? "fas fa-heart" : "far fa-heart"}></i>
                                        </button>
                                    </div>

                                    {/* Content Overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '12px',
                                        right: '12px',
                                        left: '12px',
                                        color: '#ffffff',
                                        textAlign: 'right',
                                        zIndex: 2
                                    }}>
                                        <h3 style={{ 
                                            fontSize: '0.95rem', 
                                            fontWeight: '800', 
                                            lineHeight: '1.2',
                                            marginBottom: '4px',
                                            color: '#ffffff',
                                            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                                        }}>
                                            {displayName}
                                        </h3>
                                        
                                        {displayPrice && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                                                {displayOriginalPrice && (
                                                    <span style={{ fontSize: '0.7rem', textDecoration: 'line-through', opacity: 0.6, color: '#fff' }}>₪{displayOriginalPrice}</span>
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary-color)' }}>₪{displayPrice}</span>
                                                    {displayOriginalPrice && (
                                                        <span style={{ 
                                                            background: 'rgba(46, 125, 50, 0.9)', 
                                                            color: 'white', 
                                                            fontSize: '0.6rem', 
                                                            fontWeight: 800, 
                                                            padding: '2px 6px', 
                                                            borderRadius: '4px'
                                                        }}>
                                                            -{Math.round((1 - (displayPrice / displayOriginalPrice)) * 100)}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff', fontSize: '0.7rem', fontWeight: 600 }}>
                                            <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-color)', fontSize: '0.65rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}></i>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{v.location || 'כל הארץ'}</span>
                                            <span style={{ margin: '0 4px', opacity: 0.7 }}>|</span>
                                            <span style={{ color: '#FFD700', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}><i className="fas fa-star" style={{ fontSize: '0.6rem' }}></i> 4.9</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )})}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
                @media (min-width: 900px) {
                    .gallery-grid-full-image {
                        grid-template-columns: repeat(4, 1fr) !important;
                        gap: 25px !important;
                    }
                    h1 { font-size: 2.5rem !important; }
                }
            `}</style>
        </div>
    );
}
