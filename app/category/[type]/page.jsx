'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useVendors } from '@/context/VendorContext';
import { motion } from 'framer-motion';

export default function CategoryPage() {
    const params = useParams();
    const type = params.type;
    const { getVendorsByType } = useVendors();
    const vendors = getVendorsByType(type);

    const categoryData = {
        'dj': { label: 'DJ ומוזיקה', img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd41?auto=format&fit=crop&w=1200&q=80' },
        'photographer': { label: 'צלמים', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80' },
        'alcohol': { label: 'אלכוהול ובר', img: '/images/bar_hero.png' },
        'catering': { label: 'קייטרינג', img: '/images/catering.jpeg' },
        'attractions': { label: 'אטרקציות', img: '/images/attractions_hero.png' },
        'makeup': { label: 'איפור כלה', img: '/images/beauty_hero.png' },
        'hair': { label: 'עיצוב שיער', img: '/images/beauty_hero.png' },
        'singers': { label: 'זמרים ולהקות', img: '/images/entertainment_hero.png' },
        'cars': { label: 'השכרת רכבים', img: '/images/car_hero.png' },
        'invitations': { label: 'הזמנות', img: '/images/invitations_hero.png' },
        'arrivals': { label: 'אישורי הגעה', img: '/images/invitations_hero.png' },
        'challa': { label: 'הפרשת חלה', img: '/images/wedding_table_detail_1765744408525.png' },
        'religious-bands': { label: 'להקות דתיות', img: '/images/entertainment_hero.png' },
        'souvenirs': { label: 'מזכרות', img: '/images/attractions_hero.png' },
        'design': { label: 'עיצוב אירועים', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80' },
        'dresses': { label: 'שמלות כלה', img: 'https://images.unsplash.com/photo-1594553939328-14936d6f5f3e?auto=format&fit=crop&w=1200&q=80' },
        'suits': { label: 'חליפות חתן', img: 'https://images.unsplash.com/photo-1594932224015-610b8116ce9f?auto=format&fit=crop&w=1200&q=80' },
        'rabbi': { label: 'רב לחופה', img: '/images/rabbi.jpeg' },
        'rings': { label: 'טבעות נישואין', img: '/images/jewelry_hero.png' },
        'hotels': { label: 'מלונות וסוויטות', img: '/images/wedding_lounge_1765744440712.png' },
        'bachelor': { label: 'מסיבות רווקים', img: '/images/bar_hero.png' },
        'cantors': { label: 'פייטנים', img: '/images/entertainment_hero.png' },
        'venue': { label: 'אולמות וגנים', img: '/images/venue_hero.png' },
        'event-production': { label: 'הפקת אירועים', img: '/images/event_production.jpeg' },
        'event-managers': { label: 'מנהלי אירועים', img: '/images/venue_hero.png' },
        'bride-shoes': { label: 'נעלי כלה', img: 'https://images.unsplash.com/photo-1549416878-b99b533e46bc?auto=format&fit=crop&w=1200&q=80' },
        'groom-shoes': { label: 'נעלי חתן', img: 'https://images.unsplash.com/photo-1539185441755-769473a23957?auto=format&fit=crop&w=1200&q=80' },
        'bride-escort': { label: 'מדריכת כלות', img: '/images/beauty_hero.png' },
        'groom-escort': { label: 'מדריך חתנים', img: '/images/groom_suits.jpeg' },
        'rsvp-design': { label: 'אישורים ועיצוב', img: '/images/invitations_hero.png' },
        'transportation': { label: 'הסעות', img: '/images/car_hero.png' },
        'equipment-rental': { label: 'השכרת ציוד', img: '/images/attractions_hero.png' },
        'car-decoration': { label: 'קישוט רכב', img: '/images/car_hero.png' },
        'spa-travel': { label: 'ספא וירח דבש', img: '/images/wedding_lounge_1765744440712.png' },
        'getting-ready': { label: 'התארגנות', img: '/images/beauty_hero.png' },
        'tanning': { label: 'שיזוף', img: '/images/beauty_hero.png' },
        'dietitians': { label: 'דיאטניות', img: 'https://images.unsplash.com/photo-1490645935967-1306ba001491?auto=format&fit=crop&w=1200&q=80' },
        'personal-training': { label: 'כושר וחיטוב', img: 'https://images.unsplash.com/photo-15344383272d6-0a0e22b3b64e?auto=format&fit=crop&w=1200&q=80' },
        'aliexpress-ideas': { label: 'רעיונות מעליאקספרס', img: '/images/invitations_hero.png' },
        'recording-studios': { label: 'אולפני הקלטה', img: '/images/entertainment_hero.png' },
        'blessings': { label: 'ברכות', img: '/images/entertainment_hero.png' },
        'live-streaming': { label: 'שידור לייב', img: '/images/entertainment_hero.png' },
        'guidance': { label: 'הדרכה', img: '/images/venue_hero.png' },
        'wedding-insurance': { label: 'ביטוח חתונה', img: '/images/venue_hero.png' },
        'legal-advice': { label: 'ייעוץ משפטי', img: '/images/venue_hero.png' },
        'bridal-salons': { label: 'סלוני כלות', img: '/images/beauty_hero.png' },
        'accessories': { label: 'אקססוריז', img: '/images/jewelry_hero.png' },
        'bouquet': { label: 'זרי כלה', img: '/images/beauty_hero.png' },
    };

    const currentCategory = categoryData[type] || { label: 'ספקים', img: '/images/hero_wedding_bg_1765744390134.png' };

    return (
        <div style={{ minHeight: '100vh', background: '#f9f9f9', paddingTop: '20px', paddingBottom: '80px', position: 'relative' }}>
            {/* Back Arrow */}
            <Link
                href="/"
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 10,
                    color: 'white',
                    background: 'rgba(0,0,0,0.3)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    backdropFilter: 'blur(5px)',
                    transition: 'all 0.3s'
                }}
            >
                <i className="fas fa-arrow-right"></i>
            </Link>

            {/* Category Hero Header */}
            <div className="category-hero-container" style={{
                height: '180px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                color: 'white',
                textAlign: 'center'
            }}>
                <img src={currentCategory.img} alt={currentCategory.label} style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)'
                }} />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}
                >
                    <h1 style={{ fontSize: '2.2rem', fontFamily: 'Playfair Display, serif', marginBottom: '2px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        {currentCategory.label}
                    </h1>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: '500' }}>{vendors.length} ספקים מצאנו עבורכם</p>
                </motion.div>
            </div>

            <div className="container" style={{ maxWidth: '1200px' }}>
                {vendors.length === 0 ? (
                    <div style={{ padding: '100px 0', border: '1px dashed #ccc', borderRadius: '20px', textAlign: 'center', background: 'white' }}>
                        <i className="fas fa-search" style={{ fontSize: '3rem', color: '#eee', marginBottom: '20px' }}></i>
                        <h3 style={{ color: '#888', fontStyle: 'italic' }}>עדיין לא נוספו ספקים לקטגוריית {currentCategory.label}</h3>
                        <p style={{ color: '#aaa' }}>אנחנו עובדים על הוספת ספקים מובחרים עבורכם.</p>
                        <a
                            href={`https://wa.me/972535378985?text=${encodeURIComponent(`היי, אני מחפש ספקים ב-${currentCategory.label} וראיתי שעוד אין באתר`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ marginTop: '20px', background: '#25D366', borderColor: '#25D366' }}
                        >
                            <i className="fab fa-whatsapp" style={{ marginLeft: '8px' }}></i> דברו איתנו, נמצא לכם ספק!
                        </a>
                    </div>
                ) : (
                    <div className="services-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        padding: '0 5px'
                    }}>
                        {vendors.map((v, i) => (
                            <motion.div
                                key={v.id}
                                className="service-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                                    textAlign: 'right',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <div style={{ height: '100px', position: 'relative', overflow: 'hidden' }}>
                                    <img 
                                        src={v.image && v.image.trim() !== '' ? v.image : currentCategory.img} 
                                        alt={v.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        onError={(e) => {
                                            e.target.src = currentCategory.img;
                                        }}
                                    />
                                    <div style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(255,127,80,0.9)', color: 'white', padding: '1px 6px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 'bold' }}>
                                        {currentCategory.label}
                                    </div>
                                </div>
                                <div style={{ padding: '10px 8px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '0.95rem', marginBottom: '4px', color: '#1a1a1a', fontWeight: '800', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</h3>

                                    {(v.price || v.discount) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                            {v.price && (
                                                <span style={{ textDecoration: 'line-through', textDecorationColor: '#e74c3c', color: '#999', fontSize: '0.85rem', fontWeight: '500' }}>₪{v.price}</span>
                                            )}
                                            {v.discount && (
                                                <span style={{ color: '#e74c3c', fontSize: '0.85rem', fontWeight: '800' }}>
                                                    {v.discount}% הנחה
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div style={{ marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <Link href={`/vendor/${v.id}`} className="btn btn-secondary" style={{ flex: 1, padding: '5px 0', fontSize: '0.65rem' }}>
                                                פרטים
                                            </Link>
                                            <a
                                                href={`https://wa.me/972535378985?text=${encodeURIComponent(`היי, אשמח לפרטים על הספק ${v.name} מקטגוריית ${currentCategory.label}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary"
                                                style={{ flex: 1.4, padding: '5px 0', fontSize: '0.65rem', background: '#25D366', borderColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
                                            >
                                                <i className="fab fa-whatsapp"></i> נציג
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
