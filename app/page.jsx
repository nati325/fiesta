'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PackagesCarousel from '@/components/PackagesCarousel';
import { useAuth } from '@/context/AuthContext';
import { resolveVendorImage } from '@/lib/vendorImage';

const SUPPLIER_GROUPS = [
    {
        id: 'main', label: 'מרכז האירוע', icon: 'fa-star', suppliers: [
            { type: 'dj', icon: 'fa-music', title: 'DJ ומוזיקה' },
            { type: 'photographer', icon: 'fa-camera-retro', title: 'צילום אירועים' },
            { type: 'alcohol', icon: 'fa-glass-cheers', title: 'אלכוהול ובר' },
            { type: 'catering', icon: 'fa-utensils', title: 'קייטרינג' },
            { type: 'venue', icon: 'fa-building', title: 'אולמות וגנים' },
            { type: 'design', icon: 'fa-palette', title: 'עיצוב אירועים' }
        ]
    },
    {
        id: 'look', label: 'לוק חתן-כלה', icon: 'fa-user-tie', suppliers: [
            { type: 'dresses', icon: 'fa-person-dress', title: 'שמלות כלה' },
            { type: 'suits', icon: 'fa-user-tie', title: 'חליפות חתן' },
            { type: 'bride-shoes', icon: 'fa-shoe-prints', title: 'נעלי כלה' },
            { type: 'groom-shoes', icon: 'fa-shoe-prints', title: 'נעלי חתן' },
            { type: 'hair', icon: 'fa-scissors', title: 'עיצוב שיער' },
            { type: 'makeup', icon: 'fa-eye', title: 'איפור' },
            { type: 'rings', icon: 'fa-ring', title: 'טבעות נישואין' }
        ]
    },
    {
        id: 'planning', label: 'ארגון ולוגיסטיקה', icon: 'fa-calendar-check', suppliers: [
            { type: 'event-production', icon: 'fa-star', title: 'הפקת אירועים' },
            { type: 'rsvp', icon: 'fa-check-to-slot', title: 'אישורי הגעה' },
            { type: 'invitations', icon: 'fa-envelope-open-text', title: 'הזמנות' },
            { type: 'transportation', icon: 'fa-bus', title: 'הסעות' },
            { type: 'cars', icon: 'fa-car', title: 'רכבי יוקרה' },
            { type: 'equipment-rental', icon: 'fa-chair', title: 'השכרת ציוד' }
        ]
    },
    {
        id: 'content', label: 'מסורת ותוכן', icon: 'fa-heart', suppliers: [
            { type: 'rabbi', icon: 'fa-book-open', title: 'רב לחופה' },
            { type: 'cantors', icon: 'fa-microphone-lines', title: 'חזנים ופייטנים' },
            { type: 'singers', icon: 'fa-microphone', title: 'זמרים ולהקות' },
            { type: 'religious-bands', icon: 'fa-guitar', title: 'להקות דתיות' },
            { type: 'challa', icon: 'fa-bread-slice', title: 'הפרשת חלה' },
            { type: 'attractions', icon: 'fa-wand-magic-sparkles', title: 'אטרקציות' },
            { type: 'souvenirs', icon: 'fa-gift', title: 'מזכרות' }
        ]
    },
    {
        id: 'extra', label: 'אירוח ופינוק', icon: 'fa-spa', suppliers: [
            { type: 'hotels', icon: 'fa-bed', title: 'מלונות' },
            { type: 'bachelor', icon: 'fa-glass-cheers', title: 'מסיבות רווקים' },
            { type: 'getting-ready', icon: 'fa-house-user', title: 'התארגנות כלה' },
            { type: 'dietitians', icon: 'fa-apple-whole', title: 'תזונה ודיאטה' },
            { type: 'personal-training', icon: 'fa-dumbbell', title: 'כושר ואימון' }
        ]
    }
];

const CATEGORY_IMAGES = {
    'dj': 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=500&q=80',
    'photographer': '/images/event_photographer.png',
    'alcohol': '/images/bar_hero.png',
    'catering': '/images/catering.jpeg',
    'venue': '/images/venue_hero.png',
    'design': '/images/wedding_floral_arch_1765744424651.png',
    'dresses': '/images/wedding_dress.jpeg',
    'suits': '/images/groom_suits.jpeg',
    'bride-shoes': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80',
    'groom-shoes': 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=500&q=80',
    'hair': 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=500&q=80',
    'makeup': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=500&q=80',
    'rings': '/images/jewelry_hero.png',
    'event-production': '/images/event_production.jpeg',
    'rsvp': 'https://images.unsplash.com/photo-1512418490979-92798ccc13fb?auto=format&fit=crop&w=500&q=80',
    'invitations': '/images/invitations_hero.png',
    'transportation': '/images/car_hero.png',
    'cars': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80',
    'equipment-rental': '/images/wedding_table_detail_1765744408525.png',
    'rabbi': '/images/rabbi.jpeg',
    'cantors': 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=500&q=80',
    'singers': '/images/entertainment_hero.png',
    'religious-bands': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
    'challa': 'https://images.unsplash.com/photo-1610452399201-9a7076594d2f?auto=format&fit=crop&w=500&q=80',
    'attractions': '/images/attractions_hero.png',
    'souvenirs': 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=500&q=80',
    'hotels': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80',
    'bachelor': 'https://images.unsplash.com/photo-1514525253344-f81bcd3ce942?auto=format&fit=crop&w=500&q=80',
    'getting-ready': '/images/wedding_lounge_1765744440712.png',
    'dietitians': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=80',
    'personal-training': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=80'
};

export default function HomePage() {
    const [articles, setArticles] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [contactData, setContactData] = useState({ name: '', email: '', phone: '', date: '' });
    const { user, eventPreference, setEventPreference } = useAuth();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (user && !eventPreference) setShowOnboarding(true);
        fetch('/api/articles').then(res => res.json()).then(data => setArticles(Array.isArray(data) ? data : []));
        fetch('/api/vendors').then(res => res.json()).then(data => setVendors(Array.isArray(data) ? data : []));
    }, [user, eventPreference]);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        const message = `היי Fiesta! ✨\nהשארתי פרטים באתר ואשמח שתחזרו אליי:\n\n*שם:* ${contactData.name}\n*טלפון:* ${contactData.phone}`;
        window.open(`https://wa.me/972535378985?text=${encodeURIComponent(message)}`, '_blank');
        setContactData({ name: '', email: '', phone: '', date: '' });
    };

    // Calculate counts per category
    const categoryCounts = useMemo(() => {
        const counts = {};
        vendors.forEach(v => {
            const type = v.type;
            counts[type] = (counts[type] || 0) + 1;
        });
        return counts;
    }, [vendors]);

    return (
        <div className="home-container">
            {/* 1. Hero Section */}
            <section className="hero-premium">
                <div className="hero-bg">
                    <img src="/images/hero_wedding_bg_1765744390134.png" alt="Fiesta" />
                    <div className="hero-overlay"></div>
                </div>
                
                <div className="container hero-inner">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="hero-card"
                    >
                        <div className="hero-badge">הסטנדרט החדש בתכנון אירועים</div>
                        <h1><span className="fashion-white">אירוע החלומות שלכם,</span><br /><span className="gold-text">בלי פשרות.</span></h1>
                        <p style={{ color: 'white' }}>
                            Fiesta מחברת אתכם לספקים המובילים בישראל תחת קורת גג אחת. 
                            תיהנו ממחירים בלעדיים, שקיפות מלאה וליווי מקצועי - והכל ללא עלות.
                        </p>
                        <div className="hero-btns">
                            <button className="btn-premium-gold" onClick={() => document.getElementById('browse').scrollIntoView({ behavior: 'smooth' })}>
                                <span>מצאו ספק מושלם</span>
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <button className="btn-premium-outline" onClick={() => setShowOnboarding(true)}>
                                <span>התאמה אישית חכמה</span>
                                <i className="fas fa-magic"></i>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 1.5 Trust Stats Bar */}
            <section className="stats-bar">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-num">1,200+</span>
                            <span className="stat-label">ספקים מאומתים</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">15,000+</span>
                            <span className="stat-label">זוגות מרוצים</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">24/7</span>
                            <span className="stat-label">ליווי אישי</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">₪0</span>
                            <span className="stat-label">עמלת שירות</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Key Benefits */}
            <section className="benefits-section">
                <div className="container">
                    <div className="benefits-grid">
                        <div className="benefit">
                            <div className="b-icon"><i className="fas fa-gift"></i></div>
                            <h4>שירות חינם לגמרי</h4>
                            <p>אנחנו לא גובים מכם שקל. המטרה שלנו היא להוזיל לכם את האירוע.</p>
                        </div>
                        <div className="benefit">
                            <div className="b-icon"><i className="fas fa-tags"></i></div>
                            <h4>מחיר פייסטה בלעדי</h4>
                            <p>סגרנו עבורכם מחירים נמוכים משמעותית ממחיר השוק המקורי.</p>
                        </div>
                        <div className="benefit">
                            <div className="b-icon"><i className="fas fa-check-double"></i></div>
                            <h4>איכות ללא פשרות</h4>
                            <p>רק ספקים מומלצים שעברו סינון קפדני נכנסים לנבחרת שלנו.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Packages Carousel */}
            <section className="carousel-section">
                <PackagesCarousel />
            </section>

            {/* 4. Browse by Category (Visual Grid) */}
            <section id="browse" className="categories-section">
                <div className="container">
                    <div className="section-header">
                        <h2>מצאו לפי <span className="gold-text">קטגוריה</span></h2>
                        <p>אלפי ספקים מחכים לכם ב-23 קטגוריות שונות</p>
                        <div className="h-line"></div>
                    </div>
                    
                    <div className="categories-grouped">
                        {SUPPLIER_GROUPS.map((group) => (
                            <div key={group.id} className="cat-group-block">
                                <div className="cat-group-header">
                                    <i className={`fas ${group.icon}`}></i>
                                    <h3>{group.label}</h3>
                                </div>
                                <div className="categories-visual-grid">
                                    {group.suppliers.map((s) => {
                                        const count = categoryCounts[s.type] || 0;
                                        return (
                                            <Link href={`/category/${s.type}`} key={s.type} className="cat-card-link">
                                                <div className="cat-card-visual">
                                                    <div className="cat-img-wrapper">
                                                        <img 
                                                            src={CATEGORY_IMAGES[s.type] || '/images/hero_wedding_bg_1765744390134.png'} 
                                                            alt={s.title} 
                                                            loading="lazy"
                                                        />
                                                        <div className="cat-overlay-premium"></div>
                                                    </div>
                                                    <div className="cat-info-premium">
                                                        <div className="cat-meta">
                                                            <i className={`fas ${s.icon}`}></i>
                                                        </div>
                                                        <h3>{s.title}</h3>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Personalized Banner */}
            {eventPreference && (
                <section className="personal-banner-section">
                    <div className="container">
                        <div className="p-banner">
                            <div className="p-text">
                                <h3>נבחרת הספקים ל{eventPreference} שלכם ✨</h3>
                                <p style={{ color: 'white' }}>הכי מתאימים, הכי משתלמים</p>
                            </div>
                            <div className="p-items">
                                {vendors.filter(v => v.eventTypes?.includes(eventPreference)).slice(0, 4).map(v => (
                                    <Link href={`/vendor/${v.id}`} key={v.id} className="p-item">
                                        <img src={resolveVendorImage(v.image)} alt={v.name} />
                                        <div className="p-info">
                                            <strong>{v.name}</strong>
                                            <span>₪{v.price}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 6. Contact Section */}
            <section id="contact" className="contact-section">
                <div className="container">
                    <div className="contact-card">
                        <div className="c-text">
                            <h2>בואו נתכנן ביחד</h2>
                            <p>השאירו פרטים ויועץ אירועים יחזור אליכם עם כל המידע והמחירים הכי טובים.</p>
                            <div className="c-perks">
                                <span><i className="fas fa-check"></i> מענה מהיר</span>
                                <span><i className="fas fa-check"></i> ללא התחייבות</span>
                            </div>
                        </div>
                        <form onSubmit={handleContactSubmit} className="c-form">
                            <input type="text" placeholder="שם מלא" value={contactData.name} onChange={e => setContactData({...contactData, name: e.target.value})} required />
                            <input type="tel" placeholder="טלפון" value={contactData.phone} onChange={e => setContactData({...contactData, phone: e.target.value})} required />
                            <button type="submit">שלחו לי הודעה</button>
                        </form>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .home-container { background: #fdfcf9; overflow-x: hidden; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }
                .gold-text { color: #FFD700; text-shadow: 0 0 15px rgba(212, 175, 55, 0.4); }

                /* Hero Premium */
                .hero-premium {
                    position: relative;
                    height: 65vh;
                    min-height: 500px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                .hero-bg {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                }
                .hero-bg img { width: 100%; height: 100%; object-fit: cover; }
                .hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.9) 100%);
                    backdrop-filter: blur(2px);
                }
                .hero-inner { position: relative; z-index: 2; width: 100%; }
                .hero-card {
                    max-width: 800px;
                    margin: 0 auto;
                    color: white;
                    padding: 0 20px;
                }
                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(212, 175, 55, 0.15);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(212, 175, 55, 0.4);
                    color: #FFD700;
                    padding: 10px 24px;
                    border-radius: 100px;
                    font-weight: 700;
                    font-size: 0.95rem;
                    margin-bottom: 30px;
                    letter-spacing: 0.5px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .hero-badge::before {
                    content: '✨';
                    font-size: 1.1rem;
                }
                .hero-card h1 {
                    font-size: clamp(2.5rem, 6vw, 4.8rem);
                    font-weight: 900;
                    line-height: 1.1;
                    margin-bottom: 25px;
                    font-family: var(--font-assistant);
                }
                .hero-card h1, .hero-card p {
                    color: #ffffff;
                    text-shadow: 0 4px 30px rgba(0,0,0,0.9);
                }
                .fashion-white {
                    font-family: var(--font-display), serif;
                    font-weight: 800;
                    background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: inline-block;
                    letter-spacing: -0.02em;
                }
                .gold-text { 
                    background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: inline-block;
                    font-weight: 900;
                }
                .hero-card p {
                    font-size: clamp(1.1rem, 1.5vw, 1.3rem);
                    margin-bottom: 80px;
                    line-height: 1.8;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.95) !important;
                    max-width: 700px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .hero-btns {
                    display: flex;
                    gap: 24px;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 40px;
                }
                
                /* Premium Buttons */
                .btn-premium-gold {
                    background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
                    color: #1a1a1a;
                    border: none;
                    padding: 18px 40px;
                    border-radius: 100px;
                    font-weight: 800;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
                    position: relative;
                    overflow: hidden;
                }
                
                .btn-premium-gold:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 15px 40px rgba(212, 175, 55, 0.5);
                    color: #000;
                }
                
                .btn-premium-gold i {
                    font-size: 0.9rem;
                    transition: transform 0.3s;
                }
                
                .btn-premium-gold:hover i {
                    transform: translateX(-5px);
                }

                .btn-premium-outline {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    border: 1.5px solid rgba(255, 255, 255, 0.3);
                    padding: 18px 40px;
                    border-radius: 100px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .btn-premium-outline:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: white;
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1);
                }
                
                .btn-premium-outline i {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                /* Stats Bar */
                .stats-bar { background: #1a1a1a; padding: 40px 0; color: white; }
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center; }
                .stat-num { display: block; font-size: 2rem; font-weight: 900; color: #FFD700; margin-bottom: 5px; }
                .stat-label { font-size: 0.9rem; opacity: 0.7; font-weight: 600; }

                /* Benefits */
                .benefits-section { padding: 80px 0; background: white; }
                .benefits-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
                .benefit { text-align: center; }
                .b-icon { font-size: 2.5rem; color: #D4AF37; margin-bottom: 20px; }
                .benefit h4 { font-size: 1.4rem; font-weight: 800; margin-bottom: 12px; }
                .benefit p { color: #666; font-size: 0.95rem; line-height: 1.6; }

                /* Categories Visual Grid */
                .categories-section { padding: 80px 0; background: white; }
                .section-header { text-align: right; margin-bottom: 40px; }
                .section-header h2 { font-size: 2.2rem; font-weight: 900; margin-bottom: 10px; }
                .section-header p { color: #888; font-size: 1.1rem; }
                .h-line { width: 60px; height: 3px; background: #D4AF37; }
                
                .categories-grouped { display: flex; flex-direction: column; gap: 40px; }
                .cat-group-block { width: 100%; }
                .cat-group-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; border-right: 4px solid #D4AF37; padding-right: 15px; }
                .cat-group-header i { color: #D4AF37; font-size: 1.1rem; opacity: 0.8; }
                .cat-group-header h3 { font-size: 1.1rem; font-weight: 800; color: #1a1a1a; margin: 0; letter-spacing: -0.02em; }
                
                .categories-visual-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); 
                    gap: 12px; 
                }
                .cat-card-link { text-decoration: none; display: block; }
                .cat-card-visual { 
                    position: relative; 
                    border-radius: 16px; 
                    overflow: hidden; 
                    height: 160px; 
                    width: 100%;
                    background: #f8f8f8;
                    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(0,0,0,0.03);
                }
                .cat-card-visual:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
                    border-color: #D4AF37;
                }
                .cat-img-wrapper {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                }
                .cat-img-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: 0.5s;
                    filter: brightness(0.7);
                }
                .cat-card-visual:hover .cat-img-wrapper img {
                    transform: scale(1.08);
                    filter: brightness(0.5);
                }
                .cat-overlay-premium {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
                    z-index: 2;
                }
                .cat-info-premium {
                    position: relative;
                    z-index: 3;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 15px;
                    color: #ffffff !important;
                    text-align: right;
                }
                .cat-meta { display: flex; flex-direction: row-reverse; justify-content: space-between; align-items: center; margin-bottom: 6px; }
                .cat-count { background: #D4AF37; padding: 3px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 800; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
                .cat-info-premium i {
                    font-size: 1rem;
                    color: #ffffff;
                    opacity: 0.9;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                }
                .cat-info-premium h3 {
                    font-size: 1.1rem;
                    font-weight: 800;
                    margin: 0;
                    line-height: 1.2;
                    color: #ffffff !important;
                    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
                }

                @media (max-width: 768px) {
                    .stats-bar { padding: 12px 0; }
                    .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 10px; }
                    .stat-num { font-size: 1.1rem; margin-bottom: 2px; }
                    .stat-label { font-size: 0.6rem; letter-spacing: 0; }
                    .categories-visual-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
                    .hero-premium { height: 50vh; min-height: 420px; }
                    .hero-badge { display: none !important; }
                    .hero-card p { display: block !important; font-size: 0.95rem; margin-bottom: 90px; line-height: 1.5; opacity: 0.9; }
                    .hero-card h1 { font-size: 2.1rem; margin-bottom: 15px; line-height: 1.2; }
                    .btn-premium-gold, .btn-premium-outline { 
                        padding: 10px 14px; 
                        font-size: 0.85rem; 
                        flex: 1;
                        justify-content: center;
                        white-space: nowrap;
                        gap: 6px;
                    }
                    .btn-premium-gold i, .btn-premium-outline i {
                        font-size: 0.75rem;
                    }
                    .hero-btns {
                        flex-direction: row;
                        gap: 10px;
                        width: 100%;
                        max-width: 100%;
                        margin: 20px auto 0;
                    }
                }

                /* Personal Banner */
                .personal-banner-section { padding-bottom: 80px; }
                .p-banner {
                    background: #1a1a1a;
                    border-radius: 40px;
                    padding: 40px;
                    display: flex;
                    align-items: center;
                    gap: 40px;
                    color: white;
                }
                .p-text { flex: 1; text-align: right; }
                .p-text h3 { font-size: 1.8rem; font-weight: 900; margin-bottom: 10px; }
                .p-items { flex: 2; display: flex; gap: 15px; overflow-x: auto; }
                .p-item {
                    min-width: 200px;
                    background: rgba(255,255,255,0.1);
                    padding: 10px;
                    border-radius: 20px;
                    text-decoration: none;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: 0.3s;
                }
                .p-item:hover { background: rgba(255,255,255,0.2); }
                .p-item img { width: 50px; height: 50px; border-radius: 12px; object-fit: cover; }
                .p-info { display: flex; flex-direction: column; text-align: right; }
                .p-info strong { font-size: 0.9rem; }
                .p-info span { color: #D4AF37; font-weight: 800; font-size: 0.85rem; }

                /* Contact */
                .contact-section { padding: 100px 0; background: white; }
                .contact-card {
                    background: #fdfcf9;
                    border: 1px solid #f3e8c1;
                    border-radius: 40px;
                    padding: 60px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 60px;
                    align-items: center;
                }
                .c-text { text-align: right; }
                .c-text h2 { font-size: 2.8rem; font-weight: 900; margin-bottom: 20px; }
                .c-text p { font-size: 1.2rem; color: #666; margin-bottom: 30px; }
                .c-perks { display: flex; gap: 20px; font-weight: 800; color: #D4AF37; }
                .c-form { display: flex; flex-direction: column; gap: 15px; }
                .c-form input { padding: 20px; border-radius: 15px; border: 1px solid #eee; font-size: 1.1rem; text-align: right; }
                .c-form button { background: #1a1a1a; color: white; border: none; padding: 20px; border-radius: 15px; font-weight: 800; font-size: 1.1rem; cursor: pointer; transition: 0.3s; }
                .c-form button:hover { background: black; transform: scale(1.02); }

                @media (max-width: 900px) {
                    .hero-premium { height: 50vh; }
                    .benefits-grid, .contact-card, .p-banner { grid-template-columns: 1fr; flex-direction: column; text-align: center; }
                    .contact-card { padding: 40px 20px; gap: 30px; }
                    .c-form { width: 100%; }
                    .c-form input, .c-form button { width: 100%; }
                    .c-text, .p-text, .section-header { text-align: center; }
                    .h-line { margin: 0 auto; }
                    .c-perks { justify-content: center; }
                    .p-item { width: 100%; }
                    .hero-btns { flex-direction: row !important; width: auto !important; justify-content: center; }
                    .btn-gold, .btn-outline-white { width: auto !important; padding: 10px 20px !important; font-size: 0.85rem !important; }
                }
                @media (max-width: 480px) {
                    .contact-card { padding: 30px 15px; border-radius: 20px; }
                    .c-text h2 { font-size: 2rem; }
                    .hero-btns { gap: 8px; }
                    .btn-gold, .btn-outline-white { padding: 8px 15px !important; font-size: 0.8rem !important; }
                }
            `}</style>

            {/* Onboarding Modal */}
            <AnimatePresence>
                {showOnboarding && (
                    <div className="onboarding-overlay">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="onboarding-card"
                        >
                            <div className="onboarding-header">
                                <div className="onboarding-icon-main">✨</div>
                                <h2>נעים להכיר! איזה אירוע חוגגים?</h2>
                                <p>כדי שנוכל להתאים לכם את הספקים וההטבות הכי רלוונטיות, ספרו לנו מה אתם מתכננים:</p>
                            </div>

                            <div className="onboarding-options">
                                {[
                                    { id: 'חתונה', icon: '💍', label: 'חתונה' },
                                    { id: 'בר/בת מצווה', icon: '✡️', label: 'בר/בת מצווה' },
                                    { id: 'ברית/ה', icon: '👶', label: 'ברית/ה' },
                                    { id: 'אירוע עסקי', icon: '💼', label: 'אירוע עסקי' },
                                    { id: 'מסיבת רווקים/ות', icon: '🥂', label: 'מסיבה' }
                                ].map(opt => (
                                    <button 
                                        key={opt.id} 
                                        className="onboarding-opt-btn"
                                        onClick={() => {
                                            setEventPreference(opt.id);
                                            setShowOnboarding(false);
                                        }}
                                    >
                                        <span className="opt-icon">{opt.icon}</span>
                                        <span className="opt-label">{opt.label}</span>
                                    </button>
                                ))}
                            </div>

                            <button className="onboarding-skip" onClick={() => setShowOnboarding(false)}>כרגע אני רק מסתכל...</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .onboarding-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 10000; padding: 20px;
                }
                .onboarding-card {
                    background: white; width: 100%; max-width: 500px;
                    border-radius: 32px; padding: 40px; text-align: center;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.3);
                }
                .onboarding-icon-main { font-size: 3rem; margin-bottom: 20px; }
                .onboarding-header h2 { font-size: 1.8rem; font-weight: 900; margin-bottom: 10px; color: #1a1a1a; }
                .onboarding-header p { color: #666; line-height: 1.6; margin-bottom: 30px; }
                .onboarding-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px; }
                .onboarding-opt-btn {
                    background: #f8fafc; border: 2px solid #f1f5f9; padding: 20px;
                    border-radius: 20px; cursor: pointer; transition: all 0.2s;
                    display: flex; flex-direction: column; align-items: center; gap: 10px;
                    font-family: inherit;
                }
                .onboarding-opt-btn:hover { background: #fff; border-color: #D4AF37; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(212,175,55,0.1); }
                .onboarding-opt-btn .opt-icon { font-size: 1.8rem; }
                .onboarding-opt-btn .opt-label { font-weight: 800; color: #334155; }
                .onboarding-skip { background: none; border: none; color: #94a3b8; font-weight: 600; cursor: pointer; font-size: 0.9rem; text-decoration: underline; }
            `}}></style>
        </div>
    );
}
