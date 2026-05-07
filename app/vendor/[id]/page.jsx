'use client';

import { useParams, useRouter } from 'next/navigation';
import { useVendors } from '@/context/VendorContext';
import { motion } from 'framer-motion';

export default function VendorDetailPage() {
    const params = useParams();
    const id = params.id;
    const router = useRouter();
    const { vendors } = useVendors();

    const vendor = vendors.find(v => v.id.toString() === id);

    if (!vendor) {
        return (
            <div style={{ paddingTop: '100px', textAlign: 'center', minHeight: '80vh' }}>
                <h2>ספק לא נמצא</h2>
                <button onClick={() => router.push('/')} className="btn btn-primary" style={{ marginTop: '20px' }}>חזרה לדף הבית</button>
            </div>
        );
    }

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
        'design': { label: 'עיצוב אירועים', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80' },
        'dresses': { label: 'שמלות כלה', img: 'https://images.unsplash.com/photo-1594553939328-14936d6f5f3e?auto=format&fit=crop&w=1200&q=80' },
        'suits': { label: 'חליפות חתן', img: 'https://images.unsplash.com/photo-1594932224015-610b8116ce9f?auto=format&fit=crop&w=1200&q=80' },
        'rabbi': { label: 'רב לחופה', img: '/images/rabbi.jpeg' },
        'rings': { label: 'טבעות נישואין', img: '/images/jewelry_hero.png' },
        'hotels': { label: 'מלונות וסוויטות', img: '/images/wedding_lounge_1765744440712.png' },
        'venue': { label: 'אולמות וגנים', img: '/images/venue_hero.png' },
        'bride-shoes': { label: 'נעלי כלה', img: 'https://images.unsplash.com/photo-1549416878-b99b533e46bc?auto=format&fit=crop&w=1200&q=80' },
        'groom-shoes': { label: 'נעלי חתן', img: 'https://images.unsplash.com/photo-1539185441755-769473a23957?auto=format&fit=crop&w=1200&q=80' },
        'dietitians': { label: 'דיאטניות', img: 'https://images.unsplash.com/photo-1490645935967-1306ba001491?auto=format&fit=crop&w=1200&q=80' },
        'personal-training': { label: 'כושר וחיטוב', img: 'https://images.unsplash.com/photo-15344383272d6-0a0e22b3b64e?auto=format&fit=crop&w=1200&q=80' }
    };

    const currentCategory = categoryData[vendor.type] || { label: 'ספק', img: '/images/hero_wedding_bg_1765744390134.png' };

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: '60px', position: 'relative' }}>
            {/* Header Hero Area */}
            <div style={{ height: '300px', position: 'relative', overflow: 'hidden' }}>
                <img src={currentCategory.img} alt={vendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))' }} />
                <button
                    onClick={() => router.back()}
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
                        border: 'none',
                        cursor: 'pointer',
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    <i className="fas fa-arrow-right"></i>
                </button>
            </div>

            <div className="container" style={{ maxWidth: '900px', marginTop: '-100px', position: 'relative', zIndex: 5 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'white', borderRadius: '30px', padding: '40px', boxShadow: '0 25px 60px rgba(0,0,0,0.1)', textAlign: 'center' }}
                >
                    {/* Vendor Profile Image */}
                    <div style={{ 
                        width: '180px', 
                        height: '180px', 
                        borderRadius: '50%', 
                        border: '8px solid white', 
                        overflow: 'hidden', 
                        margin: '-130px auto 20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        background: '#eee'
                    }}>
                        <img 
                            src={vendor.image && vendor.image.trim() !== '' ? vendor.image : currentCategory.img} 
                            alt={vendor.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.src = currentCategory.img;
                            }}
                        />
                    </div>

                    <div style={{ color: '#D4AF37', fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                        {currentCategory.label}
                    </div>

                    <h1 style={{ fontSize: '3rem', fontFamily: 'Playfair Display, serif', color: '#1a1a1a', marginBottom: '15px', lineHeight: '1.1' }}>
                        {vendor.name}
                    </h1>

                    {(vendor.price || vendor.discount) && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
                            {vendor.price && (
                                <span style={{ textDecoration: 'line-through', textDecorationColor: '#e74c3c', color: '#999', fontSize: '1.6rem' }}>₪{vendor.price}</span>
                            )}
                            {vendor.discount && (
                                <div style={{ background: '#fff5f5', color: '#e74c3c', padding: '8px 20px', borderRadius: '50px', fontSize: '1.3rem', fontWeight: '800' }}>
                                    {vendor.discount}% הנחה לחברי Fiesta
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ background: '#fdfaf0', padding: '20px', borderRadius: '15px', marginBottom: '30px', textAlign: 'right' }}>
                        <h4 style={{ color: '#D4AF37', marginBottom: '10px', fontSize: '1.1rem' }}>קצת עלינו</h4>
                        <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6', margin: 0 }}>
                            {vendor.description || 'ספק מובחר מבית Fiesta. הצטרפו אלינו לחוויית אירוע בלתי נשכחת.'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', maxWidth: '400px', margin: '0 auto' }}>
                        <a
                            href={`https://wa.me/972535378985?text=${encodeURIComponent(`היי, אני מעוניין בפרטים על הספק: ${vendor.name}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 15px', background: '#25D366', borderColor: '#25D366', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600' }}
                        >
                            <i className="fab fa-whatsapp" style={{ fontSize: '1.1rem' }}></i>
                            נציג לפרטים וסגירת ספק
                        </a>
                        <button
                            onClick={() => router.back()}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '10px', borderRadius: '12px', fontSize: '0.9rem' }}
                        >
                            חזרה
                        </button>
                    </div>

                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', gap: '30px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#999', fontSize: '0.75rem' }}>זמינות</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>24/7</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#999', fontSize: '0.75rem' }}>ייעוץ</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>חינם לגמרי</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
