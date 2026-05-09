'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useVendors } from '@/context/VendorContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const type = params.type;
    const { getVendorsByType } = useVendors();
    const [vendors, setVendors] = useState([]);
    
    useEffect(() => {
        setVendors(getVendorsByType(type));
    }, [type, getVendorsByType]);

    const categoryData = {
        'dj': { label: 'DJ ומוזיקה', img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd41?auto=format&fit=crop&w=1200&q=80' },
        'photographer': { label: 'צלמים', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80' },
        'alcohol': { label: 'אלכוהול ובר', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80' },
        'catering': { label: 'קייטרינג', img: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80' },
        'attractions': { label: 'אטרקציות', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80' },
        'makeup': { label: 'איפור כלה', img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80' },
        'hair': { label: 'עיצוב שיער', img: 'https://images.unsplash.com/photo-1560869713-7d0a29430039?auto=format&fit=crop&w=1200&q=80' },
        'singers': { label: 'זמרים ולהקות', img: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1200&q=80' },
        'venue': { label: 'אולמות וגנים', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80' },
        'dresses': { label: 'שמלות כלה', img: 'https://images.unsplash.com/photo-1594553939328-14936d6f5f3e?auto=format&fit=crop&w=1200&q=80' },
        'suits': { label: 'חליפות חתן', img: 'https://images.unsplash.com/photo-1594932224015-610b8116ce9f?auto=format&fit=crop&w=1200&q=80' },
        'event-production': { label: 'הפקת אירועים', img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80' },
        'rabbi': { label: 'רב לחופה', img: 'https://images.unsplash.com/photo-1505932794465-147d1f1b2c97?auto=format&fit=crop&w=1200&q=80' },
        'rings': { label: 'טבעות נישואין', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80' },
        'hotels': { label: 'מלונות וסוויטות', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
        'bride-shoes': { label: 'נעלי כלה', img: 'https://images.unsplash.com/photo-1549416878-b99b533e46bc?auto=format&fit=crop&w=1200&q=80' },
        'groom-shoes': { label: 'נעלי חתן', img: 'https://images.unsplash.com/photo-1539185441755-769473a23957?auto=format&fit=crop&w=1200&q=80' },
        'dietitians': { label: 'דיאטניות', img: 'https://images.unsplash.com/photo-1490645935967-1306ba001491?auto=format&fit=crop&w=1200&q=80' },
        'personal-training': { label: 'כושר וחיטוב', img: 'https://images.unsplash.com/photo-15344383272d6-0a0e22b3b64e?auto=format&fit=crop&w=1200&q=80' },
        'invitations': { label: 'הזמנות', img: 'https://images.unsplash.com/photo-1607192233397-51493dd4aa70?auto=format&fit=crop&w=1200&q=80' }
    };

    const currentCategory = categoryData[type] || { label: 'ספקים', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80' };

    return (
        <div style={{ minHeight: '100vh', background: '#fdfcf9', paddingBottom: '100px' }}>
            {/* Header Hero Area - More Compact */}
            <div style={{
                height: '18vh',
                minHeight: '140px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <img src={currentCategory.img} alt={currentCategory.label} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: '20px', right: '30px', color: 'white', textAlign: 'right' }}>
                    <h1 style={{ 
                        fontSize: '2.2rem', 
                        fontWeight: 900, 
                        marginBottom: '4px',
                        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                        fontFamily: 'var(--font-display)'
                    }}>{currentCategory.label}</h1>
                    <p style={{ 
                        fontSize: '0.95rem', 
                        opacity: 0.95, 
                        fontWeight: 600,
                        textShadow: '0 1px 5px rgba(0,0,0,0.8)'
                    }}>{vendors.length} ספקים מובחרים</p>
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
                            {vendors.map((v, i) => (
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
                                        src={v.image && v.image.trim() !== '' ? v.image : currentCategory.img} 
                                        alt={v.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        onError={(e) => { e.target.src = currentCategory.img; }}
                                    />
                                    
                                    {/* Overlay Gradient - Stronger for better contrast */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 35%, transparent 75%)'
                                    }} />

                                    {/* Badges */}
                                    {v.discount && (
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--primary-color)', color: 'white', padding: '3px 8px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 'bold', zIndex: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                                            {v.discountType === 'amount' ? '₪' : ''}{v.discount}{v.discountType === 'amount' ? '' : '%'}
                                        </div>
                                    )}

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
                                            {v.name}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff', fontSize: '0.7rem', fontWeight: 600 }}>
                                            <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-color)', fontSize: '0.65rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}></i>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{v.location || 'כל הארץ'}</span>
                                            <span style={{ margin: '0 4px', opacity: 0.7 }}>|</span>
                                            <span style={{ color: '#FFD700', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}><i className="fas fa-star" style={{ fontSize: '0.6rem' }}></i> 4.9</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
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
