'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PackagesCarousel from '@/components/PackagesCarousel';

export default function HomePage() {
    const [articles, setArticles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchArea, setSearchArea] = useState('');
    const [contactData, setContactData] = useState({ name: '', email: '', phone: '', date: '' });
    const [activeTab, setActiveTab] = useState('all');
    const router = useRouter();

    const supplierGroups = [
        {
            id: 'main', label: 'מרכז האירוע', icon: 'fa-star', suppliers: [
                { type: 'dj', icon: 'fa-music', title: 'DJ ומוזיקה', desc: 'תקליטנים מובילים שירימו את הרחבה עד אור הבוקר.' },
                { type: 'photographer', icon: 'fa-camera-retro', title: 'צילום אירועים', desc: 'תיעוד מושלם של הרגעים המרגשים ביותר.' },
                { type: 'alcohol', icon: 'fa-glass-cheers', title: 'אלכוהול ובר', desc: 'בר כהלים עשיר, קוקטיילים מיוחדים וצוות מקצועי.' },
                { type: 'catering', icon: 'fa-utensils', title: 'קייטרינג', desc: 'חוויה קולינרית עשירה ומגוונת לכל סגנון אירוע.' },
                { type: 'venue', icon: 'fa-building', title: 'אולמות וגנים', desc: 'אולמות אירועים וגני אירועים יוקרתיים בכל הארץ.' },
                { type: 'design', icon: 'fa-palette', title: 'עיצוב אירועים', desc: 'עיצוב חללים, פרחים ותפאורה בקו יוקרתי.' }
            ]
        },
        {
            id: 'look', label: 'לוק חתן-כלה', icon: 'fa-user-tie', suppliers: [
                { type: 'dresses', icon: 'fa-person-dress', title: 'שמלות כלה', desc: 'קולקציות עילית של שמלות כלה ממעצבים מובילים.' },
                { type: 'suits', icon: 'fa-user-tie', title: 'חליפות חתן', desc: 'חליפות חתן בעיצוב אישי ואיכות ללא פשרות.' },
                { type: 'hair', icon: 'fa-scissors', title: 'עיצוב שיער', desc: 'תסרוקות כלה וערב בקו מודרני ויוקרתי.' },
                { type: 'makeup', icon: 'fa-eye', title: 'איפור', desc: 'איפור מקצועי ועמיד למראה זוהר ובלתי נשכח.' },
                { type: 'rings', icon: 'fa-ring', title: 'טבעות נישואין', desc: 'מבחר ענק של טבעות נישואין בעיצוב אישי.' },
                { type: 'bride-shoes', icon: 'fa-shoe-prints', title: 'נעלי כלה', desc: 'נעליים מעוצבות ונוחות ליום המיוחד שלך.' },
                { type: 'groom-shoes', icon: 'fa-shoe-prints', title: 'נעלי חתן', desc: 'נעלי חתן איכותיות ונוחות למראה המנצח.' },
                { type: 'tanning', icon: 'fa-sun', title: 'שיזוף', desc: 'מכוני שיזוף ושיזוף בהתזה למראה זוהר.' },
                { type: 'dietitians', icon: 'fa-apple-whole', title: 'דיאטנים', desc: 'ייעוץ תזונה ובניית תפריט אישי לקראת החתונה.' },
                { type: 'personal-training', icon: 'fa-dumbbell', title: 'כושר אישי', desc: 'אימונים מותאמים אישית בשיא הכושר לחתונה.' }
            ]
        },
        {
            id: 'planning', label: 'ארגון ולוגיסטיקה', icon: 'fa-calendar-check', suppliers: [
                { type: 'event-production', icon: 'fa-star', title: 'הפקת אירועים', desc: 'הפקה מאלף ועד תו, משלב הרעיון ועד לביצוע.' },
                { type: 'event-managers', icon: 'fa-tasks', title: 'מנהלי אירועים', desc: 'ניהול מקצועי של יום האירוע בשטח.' },
                { type: 'invitations', icon: 'fa-envelope-open-text', title: 'הזמנות', desc: 'עיצוב הזמנות יוקרתיות ומיתוג אישי.' },
                { type: 'rsvp-design', icon: 'fa-check-double', title: 'אישורים ועיצוב', desc: 'מערכות לניהול אישורי הגעה ועיצוב הזמנות.' },
                { type: 'arrivals', icon: 'fa-clipboard-check', title: 'אישורי הגעה', desc: 'ניהול אישורי הגעה וסידורי הושבה מדויקים.' },
                { type: 'transportation', icon: 'fa-bus', title: 'הסעות', desc: 'פתרונות הסעה נוחים ובטוחים לאורחים.' },
                { type: 'equipment-rental', icon: 'fa-chair', title: 'השכרת ציוד', desc: 'השכרת ריהוט וציוד לכל סוגי האירועים.' },
                { type: 'car-decoration', icon: 'fa-car', title: 'קישוט רכב', desc: 'עיצובים מרהיבים לרכב שיסיע אתכם לחופה.' },
            ]
        },
        {
            id: 'content', label: 'מסורת ותוכן', icon: 'fa-heart', suppliers: [
                { type: 'rabbi', icon: 'fa-book-open', title: 'רב לחופה', desc: 'רבנים מוסמכים לעריכת חופה וקידושין מרגשים.' },
                { type: 'cantors', icon: 'fa-microphone-alt', title: 'פייטנים', desc: 'פייטנים וזמרים לליווי חופה מסורתית.' },
                { type: 'challa', icon: 'fa-bread-slice', title: 'הפרשת חלה', desc: 'טקסי הפרשת חלה מרגשים ומקצועיים.' },
                { type: 'religious-bands', icon: 'fa-guitar', title: 'להקות דתיות', desc: 'מוזיקה יהודית ושמחת חתן וכלה מודרנית.' },
                { type: 'singers', icon: 'fa-microphone', title: 'זמרים ולהקות', desc: 'להקות חתונה והרכבים מוזיקליים לכל שלב.' },
                { type: 'attractions', icon: 'fa-wand-magic-sparkles', title: 'אטרקציות', desc: 'זיקוקים, מייצגים ותוספות מיוחדות.' },
                { type: 'souvenirs', icon: 'fa-gift', title: 'מזכרות', desc: 'מתנות ומזכרות ייחודיות ומעוצבות לאורחים.' },
                { type: 'recording-studios', icon: 'fa-microphone-lines', title: 'אולפנים', desc: 'הקלטת שירים לחופה וברכות בסטודיו מקצועי.' },
                { type: 'aliexpress-ideas', icon: 'fa-cart-shopping', title: 'עלי אקספרס', desc: 'טיפים ורעיונות לרכישת פריטים מיוחדים וזולים.' }
            ]
        },
        {
            id: 'extra', label: 'אירוח ופינוק', icon: 'fa-spa', suppliers: [
                { type: 'hotels', icon: 'fa-bed', title: 'מלונות', desc: 'סוויטות מפנקות ללילה שאחרי האירוע.' },
                { type: 'bachelor', icon: 'fa-glass-cheers', title: 'מסיבות רווקים', desc: 'לוקיישנים והפקות למסיבות רווקים ורווקות.' },
                { type: 'spa-travel', icon: 'fa-spa', title: 'ספא ונסיעות', desc: 'טיפולי ספא מפנקים וירח דבש בלתי נשכח.' },
                { type: 'getting-ready', icon: 'fa-house-user', title: 'התארגנות', desc: 'מקומות מעוצבים להתארגנות מושלמת ביום החתונה.' },
                { type: 'bride-escort', icon: 'fa-user-plus', title: 'מדריכת כלה', desc: 'ליווי צמוד ואישי לכלה משלב ההתארגנות.' },
                { type: 'groom-escort', icon: 'fa-user-friends', title: 'מדריך חתן', desc: 'מדריכים מקצועיים שידאגו לכל פרט ביום שלכם.' }
            ]
        }
    ];

    useEffect(() => {
        fetch('/api/articles')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => setArticles(data))
            .catch(error => {
                console.error('Error fetching articles:', error);
            });
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const categories = {
            'dj': ['דיגיי', 'dj', 'מוזיקה'],
            'photographer': ['צלם', 'צילום', 'תמונות'],
            'catering': ['אוכל', 'קייטרינג', 'הסעדה'],
            'venue': ['אולם', 'גן אירועים', 'מקום']
        };

        for (const [key, aliases] of Object.entries(categories)) {
            if (aliases.some(alias => searchQuery.toLowerCase().includes(alias))) {
                router.push(`/category/${key}`);
                return;
            }
        }
        alert('לא נמצאה קטגוריה מתאימה. נסה לחפש שוב.');
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: contactData.name,
                    phone: contactData.phone,
                    email: contactData.email,
                    meetingDate: contactData.date || null, // Optional
                    status: 'חדש' // New lead status
                })
            });
            
            if (response.ok) {
                // Prepare WhatsApp message
                const message = `היי Fiesta! ✨\nהשארתי פרטים באתר ואשמח שתחזרו אליי:\n\n*שם:* ${contactData.name}\n*טלפון:* ${contactData.phone}\n*אימייל:* ${contactData.email || 'לא צוין'}${contactData.date ? `\n*תאריך אירוע משוער:* ${contactData.date}` : ''}`;
                const whatsappUrl = `https://wa.me/972535378985?text=${encodeURIComponent(message)}`;
                
                alert('תודה! פנייתך התקבלה במערכת. כעת תועבר לוואטסאפ לשליחת ההודעה.');
                window.open(whatsappUrl, '_blank');
                
                setContactData({ name: '', email: '', phone: '', date: '' });
            } else {
                alert('אירעה שגיאה בשליחת הפנייה. נסה שוב מאוחר יותר.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('אירעה שגיאה בתקשורת עם השרת.');
        }
    };

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <img src="/images/hero_wedding_bg_1765744390134.png" alt="Wedding" className="hero-image" />
                    <div className="overlay"></div>
                </div>
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="hero-title">Fiesta</h1>
                    <p className="hero-subtitle">הופכים את החלום שלכם למציאות בלתי נשכחת</p>
                    <div className="hero-buttons">
                        <button
                            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                            className="btn btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '30px' }}
                        >
                            תיאום פגישה
                        </button>
                        <button
                            onClick={() => document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' })}
                            className="btn btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '30px' }}
                        >
                            צפו בגלריה
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Packages Carousel */}
            <div style={{ padding: '20px 0 10px' }}>
                <PackagesCarousel />
            </div>

            {/* Search Section */}
            <section style={{ padding: '30px 0', background: '#fcfcfc', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', marginBottom: '40px' }}>
                <div className="container" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        marginBottom: '15px',
                        fontFamily: 'var(--font-main)',
                    }}>
                        מצאו את הספקים המושלמים לאירוע שלכם
                    </h3>
                    <form onSubmit={handleSearch} className="search-container-modern">
                        <div className="search-group search-input-group">
                            <i className="fas fa-search" style={{ color: '#888' }}></i>
                            <input
                                type="text"
                                placeholder="אולם, צלם, DJ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="search-divider"></div>

                        <div className="search-group search-select-group">
                            <i className="fas fa-map-marker-alt" style={{ color: '#888' }}></i>
                            <select value={searchArea} onChange={(e) => setSearchArea(e.target.value)}>
                                <option value="">כל הארץ</option>
                                <option value="center">מרכז</option>
                                <option value="north">צפון</option>
                                <option value="south">דרום</option>
                                <option value="jerusalem">ירושלים</option>
                            </select>
                        </div>

                        <button type="submit" className="search-submit-btn">חפשו</button>
                    </form>
                </div>
            </section>

            {/* Suppliers Section */}
            <section id="gallery" className="gallery" style={{ paddingTop: '0' }}>
                <div className="container" style={{ maxWidth: '1400px' }}>
                    <div className="section-title" style={{ marginBottom: '20px' }}>
                        <h2>הספקים שלנו</h2>
                        <div className="divider"></div>
                        <p>נבחרת הספקים המנצחת שלנו - מחולקת לפי קטגוריות לנוחותכם</p>
                    </div>

                    <div className="category-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                        <button
                            className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('all')}
                            style={{ color: activeTab === 'all' ? 'white' : 'var(--text-dark)', borderColor: 'var(--primary-color)' }}
                        >הכל</button>
                        {supplierGroups.map(group => (
                            <button
                                key={group.id}
                                className={`btn ${activeTab === group.id ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveTab(group.id)}
                                style={{ color: activeTab === group.id ? 'white' : 'var(--text-dark)', borderColor: 'var(--primary-color)' }}
                            >
                                <i className={`fas ${group.icon}`} style={{ marginLeft: '8px' }}></i>
                                {group.label}
                            </button>
                        ))}
                    </div>

                    {supplierGroups.filter(g => activeTab === 'all' || g.id === activeTab).map((group) => (
                        <div key={group.id} className="group-section" style={{ marginBottom: '60px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                <i className={`fas ${group.icon}`} style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}></i>
                                <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-main)', fontWeight: '700' }}>{group.label}</h3>
                            </div>
                            <div className="services-grid">
                                {group.suppliers.map((supplier, i) => (
                                    <Link key={i} href={`/category/${supplier.type}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <motion.div
                                            className="service-card"
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.05, duration: 0.4 }}
                                        >
                                            <div className="service-icon" style={{ width: '45px', height: '45px', fontSize: '1.4rem', marginBottom: '12px' }}>
                                                <i className={`fas ${supplier.icon}`}></i>
                                            </div>
                                            <h3>{supplier.title}</h3>
                                            <p>{supplier.desc}</p>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Latest Articles Section */}
            <section id="articles" className="articles-section">
                <div className="container">
                    <div className="section-title">
                        <h2>מאמרים ומדריכים</h2>
                        <div className="divider"></div>
                        <p>טיפים, רעיונות והשראה לתכנון האירוע המושלם</p>
                    </div>

                    <div className="articles-grid">
                        {articles.map((article, i) => (
                            <motion.article
                                key={article.id}
                                className="article-card"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                style={{ height: '240px', position: 'relative' }}
                            >
                                <a href={`/article/${article.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%', width: '100%' }}>
                                    <div className="article-image" style={{ height: '100%', width: '100%' }}>
                                        <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    
                                    {/* Gradient Overlay for Text Legibility */}
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)', zIndex: 1 }}></div>

                                    {/* Content on top of image */}
                                    <div className="article-content-overlay" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', zIndex: 2, textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                        <span style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                                            {(() => {
                                                const d = new Date(article.date);
                                                return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
                                            })()}
                                        </span>
                                        <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '800', margin: 0, lineHeight: '1.3', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{article.title}</h3>
                                    </div>
                                </a>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="search-section" style={{ padding: '20px 0', overflowX: 'hidden' }}>
                <div className="container" style={{ maxWidth: '100%', padding: '0 20px' }}>
                    <div className="section-title" style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem' }}>דברו איתנו</h2>
                        <div className="divider" style={{ margin: '0 auto 10px' }}></div>
                        <p style={{ fontSize: '0.9rem' }}>אנחנו כאן כדי לעזור לכם להפיק את האירוע המושלם</p>
                    </div>

                    <div className="contact-container" style={{
                        maxWidth: '550px',
                        width: '95%',
                        margin: '0 auto 30px auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        background: 'white',
                        borderRadius: '24px',
                        padding: '30px',
                        boxShadow: '0 15px 45px rgba(0,0,0,0.07)',
                        boxSizing: 'border-box',
                        border: '1px solid #f0f0f0'
                    }}>
                        <div className="contact-form-wrapper" style={{ padding: '0' }}>
                            <form className="contact-form" onSubmit={handleContactSubmit} style={{ gap: '12px', marginTop: '0' }}>
                                <div className="form-group" style={{ gap: '4px' }}>
                                    <label style={{ fontSize: '0.85rem' }}>שם מלא</label>
                                    <input
                                        type="text"
                                        value={contactData.name}
                                        onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                                        required
                                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box', textAlign: 'right' }}
                                    />
                                </div>
                                <div className="form-row" style={{ gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
                                    <div className="form-group" style={{ gap: '4px' }}>
                                        <label style={{ fontSize: '0.85rem' }}>אימייל</label>
                                        <input
                                            type="email"
                                            value={contactData.email}
                                            onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                                            required
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box', textAlign: 'right' }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ gap: '4px' }}>
                                        <label style={{ fontSize: '0.85rem' }}>טלפון</label>
                                        <input
                                            type="tel"
                                            value={contactData.phone}
                                            onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                                            required
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box', textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group" style={{ gap: '4px', marginBottom: '10px' }}>
                                    <label style={{ fontSize: '0.85rem' }}>תאריך <span style={{ color: '#999', fontWeight: 'normal', fontSize: '0.75rem' }}>(אופציונלי)</span></label>
                                    <input
                                        type="text"
                                        placeholder="DD/MM/YYYY"
                                        onFocus={(e) => (e.target.type = 'date')}
                                        onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                                        value={contactData.date}
                                        onChange={(e) => setContactData({ ...contactData, date: e.target.value })}
                                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box', textAlign: 'right', fontFamily: 'system-ui' }}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary full-width" style={{ padding: '12px', borderRadius: '12px', fontWeight: '700' }}>שלח הודעה</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
