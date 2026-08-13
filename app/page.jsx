'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PackagesCarousel from '@/components/PackagesCarousel';
import Hero3D from '@/components/Hero3D';
import BudgetInvite from '@/components/BudgetInvite';
import { useAuth } from '@/context/AuthContext';

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
    const [contactData, setContactData] = useState({ name: '', phone: '' });
    const { user, eventPreference, setEventPreference } = useAuth();
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (user && !eventPreference) setShowOnboarding(true);
        fetch('/api/articles').then(res => res.json()).then(data => setArticles(Array.isArray(data) ? data : []));
        fetch('/api/vendors').then(res => res.json()).then(data => setVendors(Array.isArray(data) ? data : []));
    }, [user, eventPreference]);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        const message = `היי Fiesta!\nהשארתי פרטים באתר ואשמח שתחזרו אליי:\n\n*שם:* ${contactData.name}\n*טלפון:* ${contactData.phone}`;
        window.open(`https://wa.me/972535378985?text=${encodeURIComponent(message)}`, '_blank');
        setContactData({ name: '', phone: '' });
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
            <Hero3D onOpenOnboarding={() => setShowOnboarding(true)} />

            {/* Budget calculator invite — first tools-carousel frame */}
            <BudgetInvite />

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
                                                            {count > 0 && <span className="cat-count">{count} ספקים</span>}
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

            {/* Articles — only when API returns real items */}
            {articles.length > 0 && (
                <section id="articles" className="articles-home-section">
                    <div className="container">
                        <div className="section-header">
                            <h2>מדריכים והשראה</h2>
                            <p>טיפים לתכנון האירוע — מהשטח של Fiesta</p>
                        </div>
                        <div className="articles-home-grid">
                            {articles.slice(0, 4).map((a) => (
                                <Link key={a.id} href={`/article/${a.id}`} className="article-home-card">
                                    <div className="article-home-img">
                                        <img src={a.image} alt={a.title || ''} loading="lazy" />
                                    </div>
                                    <div className="article-home-body">
                                        <h3>{a.title}</h3>
                                        {a.excerpt ? <p>{a.excerpt}</p> : null}
                                    </div>
                                </Link>
                            ))}
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
                            <input id="contact-name" name="name" type="text" autoComplete="name" placeholder="שם מלא" value={contactData.name} onChange={e => setContactData({...contactData, name: e.target.value})} required />
                            <input id="contact-phone" name="phone" type="tel" autoComplete="tel" placeholder="טלפון" value={contactData.phone} onChange={e => setContactData({...contactData, phone: e.target.value})} required />
                            <button type="submit">שלחו לי הודעה</button>
                        </form>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .home-container { background: var(--white); overflow-x: hidden; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }

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
                .cat-meta { display: flex; flex-direction: row-reverse; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 8px; }
                .cat-count { font-size: 0.72rem; color: rgba(255,255,255,0.8); font-weight: 500; }
                .cat-info-premium i { font-size: 0.85rem; color: rgba(255,255,255,0.75); }
                .cat-info-premium h3 {
                    font-family: var(--font-main);
                    font-size: 0.98rem;
                    font-weight: 600;
                    margin: 0;
                    line-height: 1.25;
                    color: #fff;
                }

                .articles-home-section { padding: 56px 0 72px; background: var(--off-white); border-top: 1px solid var(--border-color); }
                .articles-home-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 16px;
                }
                .article-home-card {
                    text-decoration: none;
                    background: #fff;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    color: inherit;
                    display: flex;
                    flex-direction: column;
                    min-height: 100%;
                }
                .article-home-img { height: 140px; background: #eee; }
                .article-home-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
                .article-home-body { padding: 14px 16px 18px; text-align: right; }
                .article-home-body h3 {
                    margin: 0 0 8px;
                    font-size: 1.05rem;
                    font-weight: 600;
                    color: var(--text-dark);
                    line-height: 1.35;
                }
                .article-home-body p {
                    margin: 0;
                    font-size: 0.88rem;
                    color: var(--text-light);
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

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
                    .contact-card { grid-template-columns: 1fr; padding: 32px 20px; gap: 28px; }
                    .c-text, .section-header { text-align: center; }
                    .c-perks { justify-content: center; }
                }

                @media (max-width: 768px) {
                    .container { padding: 0 16px; }
                    .categories-section { padding: 48px 0; }
                    .categories-visual-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    .cat-card-visual { height: 140px; }
                    .contact-section { padding: 48px 0 calc(var(--mobile-chrome-clearance, 64px) + 24px); }
                    .c-perks {
                        flex-direction: column;
                        align-items: center;
                        gap: 10px;
                    }
                }

                @media (max-width: 480px) {
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
                                    { id: 'בר מצווה', label: 'בר מצווה' },
                                    { id: 'בת מצווה', label: 'בת מצווה' },
                                    { id: 'ברית', label: 'ברית' },
                                    { id: 'בריתה', label: 'בריתה' },
                                    { id: 'אירוע עסקי', label: 'אירוע עסקי' },
                                    { id: 'יום הולדת', label: 'יום הולדת' },
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
