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
        'alcohol': { label: 'אלכוהול ובר', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80' },
        'catering': { label: 'קייטרינג', img: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80' },
        'attractions': { label: 'אטרקציות', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80' },
        'makeup': { label: 'איפור כלה', img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80' },
        'hair': { label: 'עיצוב שיער', img: 'https://images.unsplash.com/photo-1560869713-7d0a29430039?auto=format&fit=crop&w=1200&q=80' },
        'singers': { label: 'זמרים ולהקות', img: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1200&q=80' },
        'cars': { label: 'השכרת רכבים', img: 'https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?auto=format&fit=crop&w=1200&q=80' },
        'invitations': { label: 'הזמנות', img: 'https://images.unsplash.com/photo-1607192233397-51493dd4aa70?auto=format&fit=crop&w=1200&q=80' },
        'arrivals': { label: 'אישורי הגעה', img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80' },
        'challa': { label: 'הפרשת חלה', img: 'https://images.unsplash.com/photo-1603533872295-88301f2f849e?auto=format&fit=crop&w=1200&q=80' },
        'religious-bands': { label: 'להקות דתיות', img: 'https://images.unsplash.com/photo-1514525253344-a81d1270ff2c?auto=format&fit=crop&w=1200&q=80' },
        'souvenirs': { label: 'מזכרות', img: 'https://images.unsplash.com/photo-1513201099475-4320703814de?auto=format&fit=crop&w=1200&q=80' },
        'design': { label: 'עיצוב אירועים', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80' },
        'dresses': { label: 'שמלות כלה', img: 'https://images.unsplash.com/photo-1594553939328-14936d6f5f3e?auto=format&fit=crop&w=1200&q=80' },
        'suits': { label: 'חליפות חתן', img: 'https://images.unsplash.com/photo-1594932224015-610b8116ce9f?auto=format&fit=crop&w=1200&q=80' },
        'rabbi': { label: 'רב לחופה', img: 'https://images.unsplash.com/photo-1505932794465-147d1f1b2c97?auto=format&fit=crop&w=1200&q=80' },
        'rings': { label: 'טבעות נישואין', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80' },
        'hotels': { label: 'מלונות וסוויטות', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
        'bachelor': { label: 'מסיבות רווקים', img: 'https://images.unsplash.com/photo-1519671482749-307615f74c2c?auto=format&fit=crop&w=1200&q=80' },
        'cantors': { label: 'פייטנים', img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd41?auto=format&fit=crop&w=1200&q=80' },
        'venue': { label: 'אולמות וגנים', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80' },
        'event-production': { label: 'הפקת אירועים', img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80' },
        'event-managers': { label: 'מנהלי אירועים', img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80' },
        'bride-shoes': { label: 'נעלי כלה', img: 'https://images.unsplash.com/photo-1549416878-b99b533e46bc?auto=format&fit=crop&w=1200&q=80' },
        'groom-shoes': { label: 'נעלי חתן', img: 'https://images.unsplash.com/photo-1539185441755-769473a23957?auto=format&fit=crop&w=1200&q=80' },
        'bride-escort': { label: 'מדריכת כלות', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80' },
        'groom-escort': { label: 'מדריך חתנים', img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80' },
        'rsvp-design': { label: 'אישורים ועיצוב', img: 'https://images.unsplash.com/photo-1512418490979-92798cfec83a?auto=format&fit=crop&w=1200&q=80' },
        'transportation': { label: 'הסעות', img: 'https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?auto=format&fit=crop&w=1200&q=80' },
        'equipment-rental': { label: 'השכרת ציוד', img: 'https://images.unsplash.com/photo-1517457373958-b7bdd058a548?auto=format&fit=crop&w=1200&q=80' },
        'car-decoration': { label: 'קישוט רכב', img: 'https://images.unsplash.com/photo-1494976388531-d105b79d94ab?auto=format&fit=crop&w=1200&q=80' },
        'spa-travel': { label: 'ספא וירח דבש', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80' },
        'getting-ready': { label: 'התארגנות', img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80' },
        'tanning': { label: 'שיזוף', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
        'dietitians': { label: 'דיאטניות', img: 'https://images.unsplash.com/photo-1490645935967-1306ba001491?auto=format&fit=crop&w=1200&q=80' },
        'personal-training': { label: 'כושר וחיטוב', img: 'https://images.unsplash.com/photo-15344383272d6-0a0e22b3b64e?auto=format&fit=crop&w=1200&q=80' },
        'aliexpress-ideas': { label: 'רעיונות מעליאקספרס', img: 'https://images.unsplash.com/photo-1607083206966-4c794acc4293?auto=format&fit=crop&w=1200&q=80' },
        'recording-studios': { label: 'אולפני הקלטה', img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80' },
        'blessings': { label: 'ברכות', img: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1200&q=80' },
        'live-streaming': { label: 'שידור לייב', img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80' },
        'guidance': { label: 'הדרכה', img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80' },
        'wedding-insurance': { label: 'ביטוח חתונה', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80' },
        'legal-advice': { label: 'ייעוץ משפטי', img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80' },
        'bridal-salons': { label: 'סלוני כלות', img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80' },
        'accessories': { label: 'אקססוריז', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80' },
        'bouquet': { label: 'זרי כלה', img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80' },
    };

    const currentCategory = categoryData[type] || { label: 'ספקים', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80' };

    return (
        <div style={{ minHeight: '100vh', background: '#fdfcf9', paddingTop: '0', paddingBottom: '80px', position: 'relative' }}>
            {/* Back Arrow */}
            <Link
                href="/"
                style={{
                    position: 'absolute',
                    top: '25px',
                    right: '25px',
                    zIndex: 10,
                    color: 'white',
                    background: 'rgba(0,0,0,0.4)',
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}
            >
                <i className="fas fa-arrow-right"></i>
            </Link>

            {/* Category Hero Header - Modern Luxury */}
            <div className="category-hero-container" style={{
                height: '35vh',
                minHeight: '280px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '40px',
                color: 'white',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                <img src={currentCategory.img} alt={currentCategory.label} style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover'
                }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)' }}></div>
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}
                >
                    <div style={{ textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '15px' }}>
                        גלריית ספקים
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontFamily: 'var(--font-display)', marginBottom: '10px', fontWeight: 900, textShadow: '0 5px 20px rgba(0,0,0,0.3)' }}>
                        {currentCategory.label}
                    </h1>
                    <div style={{ width: '60px', height: '4px', background: 'var(--primary-color)', margin: '0 auto 20px', borderRadius: '2px' }}></div>
                    <p style={{ fontSize: '1.2rem', opacity: 0.95, fontWeight: '500', maxWidth: '600px' }}>מצאנו עבורכם {vendors.length} ספקים מובחרים בתחום {currentCategory.label}</p>
                </motion.div>
            </div>

            <div className="container" style={{ maxWidth: '1400px' }}>
                {vendors.length === 0 ? (
                    <div style={{ 
                        padding: '120px 20px', 
                        borderRadius: '40px', 
                        textAlign: 'center', 
                        background: 'white',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
                        border: '1px solid #f0f0f0'
                    }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#fdfaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
                            <i className="fas fa-magic" style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}></i>
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', marginBottom: '15px' }}>עדיין לא נוספו ספקים לגלריה זו</h3>
                        <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                            אנחנו כרגע בתהליך סינון ובחירה של הספקים הטובים ביותר בתחום {currentCategory.label}. נשמח לעזור לכם למצוא ספק באופן אישי בוואטסאפ!
                        </p>
                        <a
                            href={`https://wa.me/972535378985?text=${encodeURIComponent(`היי, אני מחפש ספקים ב-${currentCategory.label} וראיתי שעוד אין באתר`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ 
                                padding: '18px 40px', 
                                background: '#25D366', 
                                borderColor: '#25D366', 
                                borderRadius: '20px',
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                boxShadow: '0 10px 25px rgba(37, 211, 102, 0.3)'
                            }}
                        >
                            <i className="fab fa-whatsapp" style={{ marginLeft: '10px', fontSize: '1.3rem' }}></i> דברו עם יועץ אירועים
                        </a>
                    </div>
                ) : (
                    <div className="services-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '30px',
                        padding: '20px 0'
                    }}>
                        {vendors.map((v, i) => (
                            <motion.div
                                key={v.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                whileHover={{ y: -10 }}
                                style={{
                                    background: 'white',
                                    borderRadius: '30px',
                                    overflow: 'hidden',
                                    boxShadow: '0 15px 40px rgba(0,0,0,0.06)',
                                    textAlign: 'right',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '1px solid #f5f5f5',
                                    height: '100%'
                                }}
                            >
                                <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                                    <img 
                                        src={v.image && v.image.trim() !== '' ? v.image : currentCategory.img} 
                                        alt={v.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        onError={(e) => {
                                            e.target.src = currentCategory.img;
                                        }}
                                    />
                                    <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'var(--primary-color)', color: 'white', padding: '5px 15px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                                        {currentCategory.label}
                                    </div>
                                    {v.discount && (
                                        <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: '#e74c3c', color: 'white', padding: '5px 15px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800' }}>
                                            מבצע Fiesta: {v.discount}% הנחה
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '30px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.6rem', marginBottom: '12px', color: '#1a1a1a', fontWeight: '900', fontFamily: 'var(--font-display)' }}>{v.name}</h3>
                                    
                                    <p style={{ color: '#666', fontSize: '1rem', marginBottom: '25px', lineHeight: '1.6', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {v.description || `ספק מובחר בקטגוריית ${currentCategory.label}. הצטרפו אלינו לחוויית אירוע בלתי נשכחת עם מיטב הספקים של Fiesta.`}
                                    </p>

                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <Link href={`/vendor/${v.id}`} className="btn btn-outline" style={{ flex: 1, padding: '15px 0', fontSize: '1rem', borderRadius: '15px', fontWeight: '800', border: '2px solid #f0f0f0' }}>
                                            לפרופיל
                                        </Link>
                                        <a
                                            href={`https://wa.me/972535378985?text=${encodeURIComponent(`היי, אשמח לפרטים על הספק ${v.name} מקטגוריית ${currentCategory.label}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                            style={{ 
                                                flex: 1.4, 
                                                padding: '15px 0', 
                                                fontSize: '1rem', 
                                                borderRadius: '15px', 
                                                background: '#25D366', 
                                                borderColor: '#25D366', 
                                                fontWeight: '800', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '8px',
                                                boxShadow: '0 8px 20px rgba(37, 211, 102, 0.2)'
                                            }}
                                        >
                                            <i className="fab fa-whatsapp" style={{ fontSize: '1.2rem' }}></i> וואטסאפ
                                        </a>
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
