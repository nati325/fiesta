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
    'makeup': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=500&q=80',
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
        const message = `היי Fiesta!\nהשארתי פרטים באתר ואשמח שתחזרו אליי:\n\n*שם:* ${contactData.name}\n*טלפון:* ${contactData.phone}`;
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
            {/* 1. Hero */}
            <section className="hero-premium">
                <div className="hero-bg">
                    <img src="/images/hero_wedding_bg_1765744390134.png" alt="" />
                    <div className="hero-overlay"></div>
                </div>

                <div className="container hero-inner">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="hero-card"
                    >
                        <p className="hero-brand">Fiesta</p>
                        <h1>אירוע החלומות שלכם, בלי פשרות.</h1>
                        <p className="hero-lead">
                            ספקים מובילים, מחירים בלעדיים וליווי מקצועי — בחינם.
                        </p>
                        <div className="hero-btns">
                            <button
                                type="button"
                                className="btn-hero-primary"
                                onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                מצאו ספק
                            </button>
                            <button
                                type="button"
                                className="btn-hero-ghost"
                                onClick={() => setShowOnboarding(true)}
                            >
                                התאימו לאירוע שלכם
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. Quiet trust strip */}
            <section className="stats-bar">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-num">ספקים מאומתים</span>
                            <span className="stat-label">סינון קפדני לפני כניסה לנבחרת</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">מחיר פייסטה</span>
                            <span className="stat-label">הטבות בלעדיות מול מחיר השוק</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">ליווי אישי</span>
                            <span className="stat-label">מענה מהיר לאורך כל הדרך</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">₪0 עמלה</span>
                            <span className="stat-label">השירות לזוגות ללא עלות</span>
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
                        <h2>מצאו לפי קטגוריה</h2>
                        <p>ספקים בכל תחום האירוע — ממסיבה ועד חופה</p>
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
                                <h3>נבחרת הספקים ל{eventPreference} שלכם</h3>
                                <p>הכי מתאימים, הכי משתלמים</p>
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
                .home-container { background: var(--white); overflow-x: hidden; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }

                .hero-premium {
                    position: relative;
                    min-height: min(88vh, 720px);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    text-align: right;
                    padding: 120px 0 72px;
                }
                .hero-bg { position: absolute; inset: 0; z-index: 1; }
                .hero-bg img { width: 100%; height: 100%; object-fit: cover; }
                .hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        to top,
                        rgba(12, 12, 12, 0.88) 0%,
                        rgba(12, 12, 12, 0.45) 45%,
                        rgba(12, 12, 12, 0.25) 100%
                    );
                }
                .hero-inner { position: relative; z-index: 2; width: 100%; }
                .hero-card {
                    max-width: 640px;
                    margin: 0;
                    margin-right: auto;
                    color: #fff;
                    padding: 0;
                }
                .hero-brand {
                    font-family: var(--font-display);
                    font-size: clamp(2.4rem, 5vw, 3.6rem);
                    font-weight: 700;
                    color: #fff;
                    margin: 0 0 18px;
                    letter-spacing: 0.04em;
                    line-height: 1;
                }
                .hero-card h1 {
                    font-family: var(--font-display);
                    font-size: clamp(1.75rem, 3.4vw, 2.65rem);
                    font-weight: 500;
                    line-height: 1.25;
                    margin: 0 0 16px;
                    color: #fff;
                }
                .hero-lead {
                    font-size: clamp(1rem, 1.4vw, 1.15rem);
                    line-height: 1.6;
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.82);
                    max-width: 420px;
                    margin: 0 0 32px;
                }
                .hero-btns {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    align-items: center;
                }
                .btn-hero-primary {
                    background: #fff;
                    color: #111;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    font-family: inherit;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s;
                }
                .btn-hero-primary:hover { background: var(--primary-color); color: #fff; }
                .btn-hero-ghost {
                    background: transparent;
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.45);
                    padding: 14px 28px;
                    border-radius: 6px;
                    font-weight: 500;
                    font-size: 0.95rem;
                    font-family: inherit;
                    cursor: pointer;
                    transition: border-color 0.2s, background 0.2s;
                }
                .btn-hero-ghost:hover {
                    border-color: #fff;
                    background: rgba(255, 255, 255, 0.08);
                }

                .stats-bar {
                    background: var(--charcoal);
                    padding: 28px 0;
                    color: #fff;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                }
                .stat-item { text-align: right; }
                .stat-num {
                    display: block;
                    font-family: var(--font-display);
                    font-size: 1.15rem;
                    font-weight: 500;
                    color: #fff;
                    margin-bottom: 6px;
                }
                .stat-label {
                    font-size: 0.82rem;
                    color: rgba(255, 255, 255, 0.55);
                    font-weight: 400;
                    line-height: 1.4;
                }

                .categories-section { padding: 72px 0; background: var(--white); }
                .section-header { text-align: right; margin-bottom: 36px; }
                .section-header h2 {
                    font-size: clamp(1.6rem, 3vw, 2.1rem);
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: var(--text-dark);
                }
                .section-header p { color: var(--text-light); font-size: 1rem; }

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
                .cat-group-header h3 {
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
                .cat-meta { display: flex; flex-direction: row-reverse; justify-content: space-between; align-items: center; margin-bottom: 4px; }
                .cat-info-premium i { font-size: 0.85rem; color: rgba(255,255,255,0.75); }
                .cat-info-premium h3 {
                    font-family: var(--font-main);
                    font-size: 0.98rem;
                    font-weight: 600;
                    margin: 0;
                    line-height: 1.25;
                    color: #fff;
                }

                .personal-banner-section { padding-bottom: 72px; }
                .p-banner {
                    background: var(--charcoal);
                    border-radius: var(--radius-lg);
                    padding: 32px;
                    display: flex;
                    align-items: center;
                    gap: 32px;
                    color: #fff;
                }
                .p-text { flex: 1; text-align: right; }
                .p-text h3 {
                    font-size: 1.45rem;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: #fff;
                }
                .p-text p { color: rgba(255,255,255,0.65); margin: 0; font-size: 0.95rem; }
                .p-items { flex: 2; display: flex; gap: 12px; overflow-x: auto; }
                .p-item {
                    min-width: 200px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.08);
                    padding: 10px;
                    border-radius: var(--radius-md);
                    text-decoration: none;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: background 0.2s;
                }
                .p-item:hover { background: rgba(255,255,255,0.1); }
                .p-item img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
                .p-info { display: flex; flex-direction: column; text-align: right; }
                .p-info strong { font-size: 0.88rem; font-weight: 600; }
                .p-info span { color: var(--primary-color); font-weight: 600; font-size: 0.82rem; }

                .contact-section { padding: 72px 0 96px; background: var(--off-white); }
                .contact-card {
                    background: var(--white);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 48px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 48px;
                    align-items: center;
                }
                .c-text { text-align: right; }
                .c-text h2 {
                    font-size: clamp(1.6rem, 3vw, 2.2rem);
                    font-weight: 500;
                    margin-bottom: 12px;
                }
                .c-text p { font-size: 1.05rem; color: var(--text-light); margin-bottom: 20px; }
                .c-perks {
                    display: flex;
                    gap: 20px;
                    font-weight: 500;
                    color: var(--text-dark);
                    font-size: 0.9rem;
                }
                .c-perks i { color: var(--primary-color); margin-left: 6px; }
                .c-form { display: flex; flex-direction: column; gap: 12px; }
                .c-form input {
                    padding: 16px 18px;
                    border-radius: var(--radius-sm);
                    border: 1px solid #e5e2dc;
                    font-size: 1rem;
                    text-align: right;
                    font-family: inherit;
                    background: #fff;
                }
                .c-form input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }
                .c-form button {
                    background: var(--charcoal);
                    color: #fff;
                    border: none;
                    padding: 16px;
                    border-radius: var(--radius-sm);
                    font-weight: 600;
                    font-size: 1rem;
                    font-family: inherit;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .c-form button:hover { background: #000; }

                @media (max-width: 900px) {
                    .hero-premium {
                        min-height: 0;
                        padding: 110px 0 56px;
                        text-align: center;
                        align-items: flex-end;
                    }
                    .hero-card {
                        margin: 0 auto;
                        text-align: center;
                    }
                    .hero-lead { margin-left: auto; margin-right: auto; }
                    .hero-btns { justify-content: center; }
                    .stats-grid { grid-template-columns: 1fr 1fr; gap: 20px 16px; }
                    .stat-item { text-align: center; }
                    .contact-card { grid-template-columns: 1fr; padding: 32px 20px; gap: 28px; }
                    .c-text, .p-text, .section-header { text-align: center; }
                    .c-perks { justify-content: center; }
                    .p-banner { flex-direction: column; text-align: center; }
                }

                @media (max-width: 768px) {
                    .container { padding: 0 16px; }
                    .stats-bar { padding: 22px 0; }
                    .stat-num { font-size: 1.05rem; }
                    .stat-label { font-size: 0.75rem; }
                    .categories-section { padding: 48px 0; }
                    .categories-visual-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    .cat-card-visual { height: 140px; }
                    .hero-brand { margin-bottom: 12px; }
                    .hero-card h1 { font-size: 1.55rem; }
                    .hero-lead { font-size: 0.95rem; margin-bottom: 24px; }
                    .btn-hero-primary, .btn-hero-ghost {
                        width: 100%;
                        max-width: 300px;
                        min-height: 48px;
                    }
                    .hero-btns { flex-direction: column; width: 100%; align-items: center; }
                    .personal-banner-section { padding-bottom: 48px; }
                    .p-banner { padding: 24px 18px; border-radius: 14px; }
                    .contact-section { padding: 48px 0 64px; }
                }

                @media (max-width: 480px) {
                    .hero-premium { padding: 100px 0 44px; }
                    .contact-card { padding: 24px 16px; }
                    .cat-card-visual { height: 128px; }
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
                                <h2>איזה אירוע חוגגים?</h2>
                                <p>נתאים לכם ספקים והטבות רלוונטיות</p>
                            </div>

                            <div className="onboarding-options">
                                {[
                                    { id: 'חתונה', label: 'חתונה' },
                                    { id: 'בר/בת מצווה', label: 'בר/בת מצווה' },
                                    { id: 'ברית/ה', label: 'ברית/ה' },
                                    { id: 'אירוע עסקי', label: 'אירוע עסקי' },
                                    { id: 'מסיבת רווקים/ות', label: 'מסיבה' }
                                ].map(opt => (
                                    <button 
                                        key={opt.id} 
                                        className="onboarding-opt-btn"
                                        onClick={() => {
                                            setEventPreference(opt.id);
                                            setShowOnboarding(false);
                                        }}
                                    >
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
                    background: rgba(0,0,0,0.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 10000; padding: 16px;
                }
                .onboarding-card {
                    background: white; width: 100%; max-width: 440px;
                    border-radius: 16px; padding: 36px 28px; text-align: center;
                    border: 1px solid rgba(0,0,0,0.06);
                    max-height: min(90vh, 720px); overflow-y: auto;
                }
                .onboarding-header h2 {
                    font-family: var(--font-display); font-size: 1.55rem; font-weight: 500;
                    margin-bottom: 8px; color: #141414;
                }
                .onboarding-header p { color: #6b6b6b; line-height: 1.5; margin-bottom: 28px; font-size: 0.95rem; }
                .onboarding-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 24px; }
                .onboarding-opt-btn {
                    background: #f7f6f4; border: 1px solid #e8e5df; padding: 18px 14px;
                    border-radius: 10px; cursor: pointer; transition: border-color 0.2s, background 0.2s;
                    display: flex; align-items: center; justify-content: center;
                    font-family: inherit; min-height: 56px;
                }
                .onboarding-opt-btn:hover { background: #fff; border-color: #8F7344; }
                .onboarding-opt-btn .opt-label { font-weight: 600; color: #141414; font-size: 0.95rem; }
                .onboarding-skip {
                    background: none; border: none; color: #9a9a9a; font-weight: 500;
                    cursor: pointer; font-size: 0.88rem; text-decoration: underline; padding: 12px;
                    font-family: inherit;
                }
                @media (max-width: 480px) {
                    .onboarding-card { padding: 28px 16px; }
                    .onboarding-header h2 { font-size: 1.3rem; }
                    .onboarding-opt-btn { padding: 14px 10px; min-height: 48px; }
                }
            `}}></style>
        </div>
    );
}
