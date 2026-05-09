'use client';

import { useParams, useRouter } from 'next/navigation';
import { useVendors } from '@/context/VendorContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function VendorDetailPage() {
    const params = useParams();
    const id = params.id;
    const router = useRouter();
    const { vendors } = useVendors();

    const vendor = vendors.find(v => v.id.toString() === id);

    if (!vendor) {
        return (
            <div style={{ paddingTop: '150px', textAlign: 'center', minHeight: '80vh' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>אופס! הספק לא נמצא</h2>
                <button onClick={() => router.push('/')} className="btn btn-primary" style={{ padding: '15px 40px', borderRadius: '50px' }}>חזרה לדף הבית</button>
            </div>
        );
    }

    const categoryData = {
        'dj': { label: 'DJ ומוזיקה', img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd41?auto=format&fit=crop&w=1200&q=80' },
        'photographer': { label: 'צלמים', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80' },
        'alcohol': { label: 'אלכוהול ובר', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80' },
        'catering': { label: 'קייטרינג', img: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80' },
        'venue': { label: 'אולמות וגנים', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80' }
    };

    const currentCategory = categoryData[vendor.type] || { label: 'ספק מובחר', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80' };

    return (
        <div style={{ minHeight: '100vh', background: '#fdfcf9', paddingBottom: '80px' }}>
            {/* Elegant Hero Header */}
            <div style={{ height: '45vh', minHeight: '400px', position: 'relative', overflow: 'hidden' }}>
                <img src={currentCategory.img} alt={vendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))' }} />
                
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    style={{
                        position: 'absolute', top: '30px', right: '30px', zIndex: 10,
                        color: 'white', background: 'rgba(0,0,0,0.3)', width: '45px', height: '45px',
                        borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', backdropFilter: 'blur(10px)'
                    }}
                >
                    <i className="fas fa-arrow-right"></i>
                </button>
            </div>

            {/* Profile Content */}
            <div className="container" style={{ maxWidth: '1000px', marginTop: '-120px', position: 'relative', zIndex: 10 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'white',
                        borderRadius: '40px',
                        padding: '60px 40px',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.1)',
                        textAlign: 'center',
                        border: '1px solid #f0f0f0'
                    }}
                >
                    {/* Avatar */}
                    <div style={{ 
                        width: '200px', height: '200px', borderRadius: '50%', border: '10px solid white', 
                        overflow: 'hidden', margin: '-160px auto 30px', boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
                        background: '#eee'
                    }}>
                        <img 
                            src={vendor.image && vendor.image.trim() !== '' ? vendor.image : currentCategory.img} 
                            alt={vendor.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = currentCategory.img; }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--primary-color)', padding: '6px 20px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 800 }}>
                            {currentCategory.label}
                        </div>
                        {vendor.discount && (
                            <div style={{ background: '#e74c3c', color: 'white', padding: '6px 20px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 800, boxShadow: '0 5px 15px rgba(231, 76, 60, 0.2)' }}>
                                {vendor.discountType === 'amount' ? '₪' : ''}{vendor.discount}{vendor.discountType === 'amount' ? '' : '%'} הנחה לחברים
                            </div>
                        )}
                    </div>
                    
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#1a1a1a', marginBottom: '15px', fontFamily: 'var(--font-display)' }}>{vendor.name}</h1>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', color: '#888', marginBottom: '40px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-color)' }}></i>
                            <span>{vendor.location || 'כל הארץ'}</span>
                        </div>
                        <div style={{ width: '1px', height: '15px', background: '#eee' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFD700' }}>
                            <i className="fas fa-star"></i>
                            <span style={{ color: '#1a1a1a' }}>4.9 (120 חוות דעת)</span>
                        </div>
                    </div>

                    <div style={{ maxWidth: '750px', margin: '0 auto 50px' }}>
                        <p style={{ fontSize: '1.25rem', color: '#555', lineHeight: '1.8' }}>
                            {vendor.description || `אנחנו ב-${vendor.name} מאמינים שכל אירוע הוא סיפור ייחודי. עם ניסיון של מעל עשור בתחום ה-${currentCategory.label}, אנחנו מביאים איתנו שילוב מנצח של יצירתיות, מקצועיות ללא פשרות ויחס אישי לכל זוג. המטרה שלנו היא אחת: להפוך את החלום שלכם למציאות נוצצת.`}
                        </p>
                    </div>

                    {/* Action Bar */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
                        <a
                            href={`https://wa.me/972535378985?text=${encodeURIComponent(`היי, אני רוצה לקבוע פגישה עם ${vendor.name}`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ 
                                padding: '20px 50px', background: '#25D366', borderColor: '#25D366', 
                                borderRadius: '20px', fontWeight: 900, fontSize: '1.2rem',
                                display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 15px 30px rgba(37, 211, 102, 0.3)'
                            }}
                        >
                            <i className="fab fa-whatsapp" style={{ fontSize: '1.8rem' }}></i> פנו אלינו בוואטסאפ
                        </a>
                        
                        <button className="btn btn-outline" style={{ 
                            padding: '20px 50px', borderRadius: '20px', fontWeight: 800, fontSize: '1.1rem', 
                            border: '2px solid #f0f0f0', color: '#1a1a1a' 
                        }}>
                            <i className="far fa-heart" style={{ marginLeft: '10px' }}></i> שמירה במועדפים
                        </button>
                    </div>
                </motion.div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '40px' }}>
                    <div style={{ background: 'white', padding: '35px', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', textAlign: 'right' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '20px', color: 'var(--primary-color)' }}>שירותים מובילים</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#666', fontWeight: 600 }}>
                            <li><i className="fas fa-check" style={{ marginLeft: '10px', color: '#25D366' }}></i> ליווי אישי מיום הסגירה</li>
                            <li><i className="fas fa-check" style={{ marginLeft: '10px', color: '#25D366' }}></i> ציוד טכנולוגי המתקדם בעולם</li>
                            <li><i className="fas fa-check" style={{ marginLeft: '10px', color: '#25D366' }}></i> פגישת תיאום ציפיות מפורטת</li>
                        </ul>
                    </div>
                    
                    <div style={{ background: 'white', padding: '35px', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', textAlign: 'right' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '20px', color: 'var(--primary-color)' }}>למה אנחנו?</h4>
                        <p style={{ color: '#666', lineHeight: 1.6 }}>אנחנו לא רק מספקים שירות, אנחנו בונים חוויה. האיכות שלנו נמדדת בפרטים הקטנים ובחיוך שלכם בסוף הערב.</p>
                    </div>
                </div>

                {/* Portfolio Preview */}
                <div style={{ marginTop: '80px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>גלריה ועבודות</h2>
                        <div style={{ width: '100px', height: '2px', background: '#eee' }}></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <motion.div 
                                key={i} 
                                whileHover={{ scale: 1.03 }}
                                style={{ height: '300px', borderRadius: '25px', overflow: 'hidden', background: '#eee', cursor: 'zoom-in' }}
                            >
                                <img src={currentCategory.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="portfolio" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    h1 { font-size: 2.5rem !important; }
                    .container { margin-top: -80px !important; }
                    button, a { width: 100% !important; }
                }
            `}</style>
        </div>
    );
}
