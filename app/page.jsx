'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PackagesCarousel from '@/components/PackagesCarousel';

export default function HomePage() {
    const [articles, setArticles] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchArea, setSearchArea] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 280 });
    const [contactData, setContactData] = useState({ name: '', email: '', phone: '', date: '' });
    const [activeTab, setActiveTab] = useState('all');
    const supplierInputRef = useRef(null);
    const areaInputRef = useRef(null);
    const router = useRouter();

    const openDropdown = (type) => {
        setActiveDropdown(type);
    };

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
        // Fetch articles
        fetch('/api/articles')
            .then(res => res.json())
            .then(data => setArticles(Array.isArray(data) ? data : []))
            .catch(error => console.error('Error fetching articles:', error));

        // Fetch vendors
        fetch('/api/vendors')
            .then(res => res.json())
            .then(data => setVendors(Array.isArray(data) ? data : []))
            .catch(error => console.error('Error fetching vendors:', error));
    }, []);

    const allSupplierTypes = supplierGroups.flatMap(group => 
        group.suppliers.map(s => ({ ...s, groupLabel: group.label }))
    ).sort((a, b) => a.title.localeCompare(b.title, 'he'));

    const searchItems = [
        ...allSupplierTypes.map(s => ({ ...s, isCategory: true })),
        ...vendors.map(v => ({ title: v.name, type: v.type, id: v.id, isVendor: true, icon: 'fa-user-tag' }))
    ];

    const filteredSearchItems = searchItems.filter(item => 
        searchQuery && (
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (item.desc && item.desc.includes(searchQuery)) || 
            item.type.includes(searchQuery.toLowerCase())
        )
    );

    const allAreas = ['כל הארץ', 'אזור המרכז', 'אזור הצפון', 'אזור הדרום', 'ירושלים והסביבה'];
    const filteredAreas = allAreas.filter(a => a.includes(searchArea));

    const handleSearch = (e) => {
        e.preventDefault();
        
        // Find exact match in search items (categories or vendors)
        const match = searchItems.find(item => item.title === searchQuery);
        
        if (match) {
            if (match.isVendor) {
                router.push(`/vendor/${match.id}`);
            } else {
                router.push(`/category/${match.type}`);
            }
            return;
        }

        // Try aliases for categories
        const categories = {
            'dj': ['דיגיי', 'dj', 'מוזיקה', 'תקליטן'],
            'photographer': ['צלם', 'צילום', 'תמונות', 'וידאו'],
            'catering': ['אוכל', 'קייטרינג', 'הסעדה'],
            'venue': ['אולם', 'גן אירועים', 'מקום', 'גני אירועים'],
            'dresses': ['שמלה', 'שמלות כלה', 'עיצוב שמלות'],
            'makeup': ['איפור', 'מאפרת'],
            'hair': ['שיער', 'מעצב שיער']
        };

        for (const [key, aliases] of Object.entries(categories)) {
            if (aliases.some(alias => searchQuery.toLowerCase().includes(alias))) {
                router.push(`/category/${key}`);
                return;
            }
        }
        
        // Find partial match
        const partialMatch = searchItems.find(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (partialMatch) {
            if (partialMatch.isVendor) {
                router.push(`/vendor/${partialMatch.id}`);
            } else {
                router.push(`/category/${partialMatch.type}`);
            }
            return;
        }

        alert('לא נמצאה תוצאה מתאימה. נסה לבחור מהרשימה.');
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
            {/* Hero Section - Professional Boutique Upgrade */}
            <section className="hero" style={{ height: '65vh', minHeight: '500px' }}>
                <div className="hero-bg">
                    <img src="/images/hero_wedding_bg_1765744390134.png" alt="Wedding" className="hero-image" />
                    <div className="overlay" style={{ 
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
                        backdropFilter: 'brightness(0.9)'
                    }}></div>
                </div>
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    
                    <motion.h1 
                        className="hero-title"
                        style={{ 
                            fontSize: 'clamp(3rem, 8vw, 6rem)', 
                            marginBottom: '20px', 
                            lineHeight: 0.9,
                            fontFamily: 'var(--font-display)',
                            fontWeight: 900,
                            textShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}
                    >
                        Fiesta
                    </motion.h1>
                    <motion.p 
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 1 }}
                        style={{ 
                            fontSize: 'clamp(1.1rem, 2vw, 1.6rem)', 
                            fontWeight: 300, 
                            marginBottom: '50px', 
                            maxWidth: '700px', 
                            margin: '0 auto 50px',
                            opacity: 0.9,
                            lineHeight: 1.4
                        }}
                    >
                        מגשימים את החלומות המרגשים ביותר עם צוות הספקים המוביל בישראל. <br />
                        <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>האירוע המושלם שלכם מתחיל כאן.</span>
                    </motion.p>
                    <div className="hero-buttons" style={{ gap: '25px' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                            className="btn btn-primary"
                            style={{ 
                                padding: '18px 50px', 
                                fontSize: '1.2rem', 
                                borderRadius: '100px', 
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, var(--primary-color) 0%, #B8860B 100%)',
                                border: 'none'
                            }}
                        >
                            יעוץ ללא התחייבות
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' })}
                            className="btn btn-outline"
                            style={{ 
                                padding: '18px 50px', 
                                fontSize: '1.2rem', 
                                borderRadius: '100px', 
                                fontWeight: 800,
                                backdropFilter: 'blur(10px)',
                                backgroundColor: 'transparent',
                                border: '2px solid rgba(255,255,255,0.5)'
                            }}
                        >
                            גלריית ספקים
                        </motion.button>
                    </div>
                </motion.div>
            </section>

            {/* Packages Carousel & Search Integration */}
            <div className="carousel-search-integrated" style={{ position: 'relative' }}>
                <PackagesCarousel />
                
                {/* Search Bar Section - Seamlessly following the carousel */}
                <div style={{ 
                    position: 'relative', 
                    marginTop: '0', 
                    padding: '80px 20px 40px', // More space on top
                    background: 'var(--white)',
                    zIndex: 100
                }}>
                    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', overflow: 'visible' }}>
                        {/* Subtle Elegant Title */}
                        <div style={{ marginBottom: '35px' }}>
                            <h2 style={{ 
                                fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', 
                                fontFamily: 'var(--font-display)', 
                                fontWeight: 800, 
                                color: '#1a1a1a', 
                                margin: 0 
                            }}>
                                מצאו את ה<span style={{ color: 'var(--primary-color)' }}>ספקים המושלמים</span> לאירוע שלכם
                            </h2>
                        </div>
                        
                        <div style={{ position: 'relative', maxWidth: '850px', margin: '0 auto', overflow: 'visible' }}>
                            <form onSubmit={handleSearch} className="premium-search-bar light-luxury" style={{ 
                                overflow: 'visible',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                                backdropFilter: 'blur(20px)',
                                background: 'rgba(255, 255, 255, 0.95)'
                            }}>
                                
                                {/* What are you looking for */}
                                <div className={`search-field ${activeDropdown === 'supplier' ? 'active' : ''}`} style={{ overflow: 'visible' }}>
                                    <div className="field-icon-wrapper">
                                        <i className="fas fa-search search-icon"></i>
                                    </div>
                                    <div className="search-input-wrapper">
                                        <label>מה מחפשים?</label>
                                        <input
                                            ref={supplierInputRef}
                                            type="text"
                                            placeholder="אולם, צלם, DJ..."
                                            value={searchQuery}
                                            onChange={(e) => { setSearchQuery(e.target.value); openDropdown('supplier'); }}
                                            onFocus={() => openDropdown('supplier')}
                                            onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
                                            autoComplete="off"
                                        />
                                    </div>
                                    
                                    {activeDropdown === 'supplier' && (
                                        <div className="premium-dropdown show" style={{ width: 'max(100%, 350px)', right: 0, left: 'auto', zIndex: 99999 }}>
                                            <div className="dropdown-header">קטגוריות פופולריות</div>
                                            {(searchQuery ? filteredSuppliers : allSupplierTypes).map((supplier, idx) => (
                                                <div
                                                    key={idx}
                                                    className="dropdown-item"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => { setSearchQuery(supplier.title); setActiveDropdown(null); }}
                                                >
                                                    <div className="dropdown-icon-premium"><i className={`fas ${supplier.icon}`}></i></div>
                                                    <div className="dropdown-text">
                                                        <span className="dropdown-title">{supplier.title}</span>
                                                        <span className="dropdown-subtitle">{supplier.groupLabel}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="search-divider"></div>

                                {/* Where */}
                                <div className={`search-field ${activeDropdown === 'area' ? 'active' : ''}`} style={{ overflow: 'visible' }}>
                                    <div className="field-icon-wrapper">
                                        <i className="fas fa-map-marker-alt search-icon"></i>
                                    </div>
                                    <div className="search-input-wrapper">
                                        <label>איפה?</label>
                                        <input 
                                            ref={areaInputRef}
                                            type="text" 
                                            placeholder="כל הארץ"
                                            value={searchArea} 
                                            onChange={(e) => { setSearchArea(e.target.value); openDropdown('area'); }}
                                            onFocus={() => openDropdown('area')}
                                            onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
                                            autoComplete="off"
                                        />
                                    </div>

                                    {activeDropdown === 'area' && (
                                        <div className="premium-dropdown show" style={{ width: 'max(100%, 280px)', right: 0, left: 'auto', zIndex: 99999 }}>
                                            <div className="dropdown-header">אזורי פעילות</div>
                                            {filteredAreas.map((area, idx) => (
                                                <div
                                                    key={idx}
                                                    className="dropdown-item"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => { setSearchArea(area); setActiveDropdown(null); }}
                                                >
                                                    <div className="dropdown-icon-premium" style={{ background: '#f0f5ff', color: '#4a90e2' }}><i className="fas fa-location-dot"></i></div>
                                                    <div className="dropdown-text">
                                                        <span className="dropdown-title">{area}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button type="submit" className="premium-search-btn-luxury">
                                    <i className="fas fa-search" style={{ marginLeft: '10px' }}></i>
                                    חפשו ספקים
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Suppliers Section */}
            <section id="gallery" className="gallery" style={{ paddingTop: '60px' }}>
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
                            <div className="services-grid" style={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: '20px'
                            }}>
                                {group.suppliers.map((supplier, i) => {
                                    const getSupplierImg = (t) => {
                                        const m = {
                                            // Main
                                            'dj': '/missing_photos/WhatsApp Image 2026-05-07 at 21.26.27.jpeg',
                                            'photographer': 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
                                            'alcohol': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
                                            'catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80',
                                            'venue': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
                                            'design': 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
                                            
                                            // Look
                                            'dresses': '/missing_photos/WhatsApp Image 2026-05-07 at 21.26.35.jpeg',
                                            'suits': '/missing_photos/WhatsApp Image 2026-05-07 at 21.28.43.jpeg',
                                            'hair': '/missing_photos/WhatsApp Image 2026-05-07 at 21.43.07.jpeg',
                                            'makeup': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=600&q=80',
                                            'rings': 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80',
                                            'bride-shoes': '/missing_photos/WhatsApp Image 2026-05-07 at 21.45.44.jpeg',
                                            'groom-shoes': '/missing_photos/WhatsApp Image 2026-05-07 at 21.45.50.jpeg',
                                            'tanning': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
                                            'dietitians': '/missing_photos/WhatsApp Image 2026-05-07 at 21.49.19.jpeg',
                                            'personal-training': '/missing_photos/WhatsApp Image 2026-05-07 at 21.52.28.jpeg',
                                            
                                            // Planning
                                            'event-production': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80',
                                            'event-managers': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
                                            'invitations': '/missing_photos/WhatsApp Image 2026-05-07 at 22.02.23.jpeg',
                                            'rsvp-design': 'https://images.unsplash.com/photo-1512418490979-92798cfec83a?auto=format&fit=crop&w=600&q=80',
                                            'arrivals': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
                                            'transportation': 'https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?auto=format&fit=crop&w=600&q=80',
                                            'equipment-rental': '/missing_photos/WhatsApp Image 2026-05-07 at 22.02.07.jpeg',
                                            'car-decoration': '/missing_photos/WhatsApp Image 2026-05-07 at 22.05.38.jpeg',
                                            
                                            // Content
                                            'rabbi': '/images/rabbi_chuppah.png',
                                            'cantors': '/missing_photos/WhatsApp Image 2026-05-07 at 22.21.02.jpeg',
                                            'challa': '/missing_photos/WhatsApp Image 2026-05-07 at 22.17.35.jpeg',
                                            'religious-bands': '/missing_photos/WhatsApp Image 2026-05-07 at 22.27.45.jpeg',
                                            'singers': 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=600&q=80',
                                            'attractions': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80',
                                            'souvenirs': '/missing_photos/WhatsApp Image 2026-05-07 at 22.25.03.jpeg',
                                            'recording-studios': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
                                            'aliexpress-ideas': '/missing_photos/WhatsApp Image 2026-05-07 at 22.25.11.jpeg',
                                            'bachelor': '/missing_photos/WhatsApp Image 2026-05-07 at 22.12.40.jpeg',
                                            
                                            // Extra
                                            'hotels': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
                                            'spa-travel': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80',
                                            'getting-ready': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80',
                                            'bride-escort': 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
                                            'groom-escort': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80'
                                        };
                                        return m[t] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';
                                    };
                                    const bgImage = getSupplierImg(supplier.type);

                                    return (
                                        <Link key={i} href={`/category/${supplier.type}`} style={{ textDecoration: 'none' }}>
                                            <motion.div
                                                className="premium-service-card"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.03, duration: 0.5 }}
                                                whileHover={{ y: -8, scale: 1.02 }}
                                                style={{
                                                    height: '200px', // Taller cards
                                                    borderRadius: '24px',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    boxShadow: '0 15px 45px rgba(0,0,0,0.08)',
                                                    border: '1px solid rgba(0,0,0,0.03)'
                                                }}
                                            >
                                                {/* Background Image with Parallax-like scale */}
                                                <motion.img 
                                                    whileHover={{ scale: 1.15 }}
                                                    transition={{ duration: 0.8 }}
                                                    src={bgImage} 
                                                    alt={supplier.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                                                />
                                                {/* Gradient Overlay - Deeper and more elegant */}
                                                <div style={{
                                                    position: 'absolute', inset: 0,
                                                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)'
                                                }}></div>
                                                
                                                {/* Content */}
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0, right: 0, left: 0,
                                                    padding: '25px',
                                                    textAlign: 'center',
                                                    color: 'white'
                                                }}>
                                                    <div style={{
                                                        background: 'rgba(212, 175, 55, 0.15)',
                                                        backdropFilter: 'blur(5px)',
                                                        width: '45px', height: '45px',
                                                        borderRadius: '12px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        margin: '0 auto 15px',
                                                        border: '1px solid rgba(212, 175, 55, 0.3)'
                                                    }}>
                                                        <i className={`fas ${supplier.icon}`} style={{ fontSize: '1.3rem', color: 'var(--primary-color)' }}></i>
                                                    </div>
                                                    <h3 style={{ 
                                                        fontSize: '1.3rem', 
                                                        margin: 0, 
                                                        fontWeight: 900,
                                                        color: '#ffffff', // Force white color
                                                        textShadow: '0 2px 15px rgba(0,0,0,0.8)', // Stronger shadow
                                                        fontFamily: 'var(--font-display)',
                                                        letterSpacing: '0.5px'
                                                    }}>{supplier.title}</h3>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </div>

                        </div>
                    ))}
                </div>
            </section>

            {/* Latest Articles Section */}
            <section id="articles" className="articles-section" style={{ padding: '70px 0', background: '#f9f7f4' }}>
                <div className="container" style={{ maxWidth: '1200px' }}>
                    <div style={{ marginBottom: '40px', textAlign: 'right' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>BLOG & GUIDES</p>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>מאמרים ומדריכים</h2>
                    </div>

                    <div className="articles-responsive-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                        gap: '20px' 
                    }}>
                        {articles.map((article, i) => (
                            <motion.article
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07, duration: 0.45 }}
                                whileHover={{ scale: 1.015 }}
                                style={{ 
                                    borderRadius: '16px', 
                                    overflow: 'hidden', 
                                    position: 'relative',
                                    aspectRatio: '1 / 1',
                                    height: 'auto',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                }}
                            >
                                <Link href={`/article/${article.id}`} style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none', position: 'relative' }}>
                                    {/* Background Image */}
                                    <img 
                                        src={article.image} 
                                        alt={article.title} 
                                        style={{ 
                                            width: '100%', height: '100%', 
                                            objectFit: 'cover',
                                            position: 'absolute', top: 0, left: 0
                                        }} 
                                    />
                                    {/* Dark Gradient */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.08) 100%)',
                                        borderRadius: '16px'
                                    }} />
                                    {/* Content */}
                                    <div style={{
                                        position: 'absolute', bottom: 0, right: 0, left: 0,
                                        padding: '18px 18px 16px',
                                        textAlign: 'right'
                                    }}>
                                        <span style={{
                                            display: 'inline-block',
                                            background: 'var(--primary-color)',
                                            color: 'white',
                                            fontSize: '0.8rem', fontWeight: 800,
                                            padding: '5px 15px', borderRadius: '50px',
                                            marginBottom: '12px',
                                            letterSpacing: '0.5px',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                                        }}>
                                            {(() => {
                                                const d = new Date(article.date);
                                                return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
                                            })()}
                                        </span>
                                        <h3 style={{ 
                                            fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', 
                                            color: 'white', 
                                            fontWeight: 900, 
                                            margin: 0,
                                            lineHeight: '1.2',
                                            fontFamily: 'var(--font-display)',
                                            textShadow: '0 2px 12px rgba(0,0,0,0.6)',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            letterSpacing: '-0.2px'
                                        }}>{article.title}</h3>
                                    </div>
                                </Link>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section - Professional Upgrade */}
            <section id="contact" style={{ 
                padding: '120px 0', 
                background: '#fdfcf9', 
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Background Elements */}
                <div style={{ position: 'absolute', top: '10%', left: '-5%', width: '300px', height: '300px', background: 'rgba(212,175,55,0.03)', borderRadius: '50%', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '400px', height: '400px', background: 'rgba(212,175,55,0.05)', borderRadius: '50%', filter: 'blur(100px)' }} />

                <div className="container" style={{ maxWidth: '1200px', position: 'relative', zIndex: 5 }}>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '60px', 
                        alignItems: 'center',
                        background: 'white',
                        borderRadius: '40px',
                        padding: '60px',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(0,0,0,0.02)'
                    }} className="contact-wrapper-grid">
                        
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ 
                                display: 'inline-block',
                                color: 'var(--primary-color)', 
                                fontWeight: 900, 
                                fontSize: '0.85rem', 
                                letterSpacing: '4px', 
                                textTransform: 'uppercase',
                                background: 'rgba(212,175,55,0.1)',
                                padding: '8px 20px',
                                borderRadius: '50px',
                                marginBottom: '20px'
                            }}>
                                יצירת קשר
                            </div>
                            <h2 style={{ 
                                fontSize: 'clamp(2.5rem, 4.5vw, 3.8rem)', 
                                fontFamily: 'var(--font-display)', 
                                fontWeight: 900, 
                                color: '#1a1a1a', 
                                marginBottom: '25px', 
                                lineHeight: 1.05,
                                letterSpacing: '-1px'
                            }}>
                                בואו נתחיל לתכנן את <br />
                                <span style={{ 
                                    background: 'linear-gradient(135deg, var(--primary-color) 0%, #B8860B 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    display: 'inline-block'
                                }}>היום המרגש שלכם</span>
                            </h2>
                            <p style={{ fontSize: '1.25rem', color: '#555', marginBottom: '45px', lineHeight: '1.6', fontWeight: '500' }}>
                                יועצי האירועים שלנו כאן כדי להעניק לכם פגישת יעוץ ללא התחייבות, ולחבר אתכם לספקים המדויקים ביותר עבורכם.
                            </p>
                            
                            <div className="contact-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '54px', height: '54px', borderRadius: '18px', background: '#fdfaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontSize: '1.2rem', boxShadow: '0 10px 20px rgba(212,175,55,0.1)', flexShrink: 0 }}>
                                        <i className="fas fa-phone-alt"></i>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>טלפון זמין</div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1a1a1a' }}>053-5378985</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '54px', height: '54px', borderRadius: '18px', background: '#fdfaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontSize: '1.2rem', boxShadow: '0 10px 20px rgba(212,175,55,0.1)', flexShrink: 0 }}>
                                        <i className="fas fa-envelope-open-text"></i>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>אימייל</div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1a1a1a' }}>contact@fiesta.co.il</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="contact-form-card" style={{
                            width: '100%',
                            background: '#ffffff',
                            borderRadius: '35px',
                            padding: '45px',
                            boxShadow: '0 30px 70px rgba(0,0,0,0.08)',
                            border: '1px solid #f5f5f5',
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: '-15px', right: '40px', background: 'var(--primary-color)', color: 'white', padding: '8px 25px', borderRadius: '15px', fontSize: '0.9rem', fontWeight: '800', boxShadow: '0 10px 20px rgba(212,175,55,0.3)' }}>
                                מענה תוך 24 שעות
                            </div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '35px', textAlign: 'center', color: '#1a1a1a' }}>השאירו פרטים</h3>
                            <form className="contact-form" onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="form-group-premium">
                                    <label style={{ fontWeight: 800, fontSize: '0.85rem', color: '#888', marginBottom: '10px', display: 'block', marginRight: '5px' }}>שם מלא</label>
                                    <input
                                        type="text"
                                        placeholder="ישראל ישראלי"
                                        value={contactData.name}
                                        onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                                        required
                                        style={{ padding: '18px 25px', borderRadius: '18px', border: '2px solid #f0f0f0', width: '100%', background: '#fff', fontSize: '1.05rem', fontWeight: '600', transition: 'all 0.3s' }}
                                        className="premium-input"
                                    />
                                </div>
                                <div className="form-row-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group-premium">
                                        <label style={{ fontWeight: 800, fontSize: '0.85rem', color: '#888', marginBottom: '10px', display: 'block', marginRight: '5px' }}>טלפון</label>
                                        <input
                                            type="tel"
                                            placeholder="050-0000000"
                                            value={contactData.phone}
                                            onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                                            required
                                            style={{ padding: '18px 25px', borderRadius: '18px', border: '2px solid #f0f0f0', width: '100%', background: '#fff', fontSize: '1.05rem', fontWeight: '600', transition: 'all 0.3s' }}
                                            className="premium-input"
                                        />
                                    </div>
                                    <div className="form-group-premium">
                                        <label style={{ fontWeight: 800, fontSize: '0.85rem', color: '#888', marginBottom: '10px', display: 'block', marginRight: '5px' }}>אימייל</label>
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={contactData.email}
                                            onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                                            required
                                            style={{ padding: '18px 25px', borderRadius: '18px', border: '2px solid #f0f0f0', width: '100%', background: '#fff', fontSize: '1.05rem', fontWeight: '600', transition: 'all 0.3s' }}
                                            className="premium-input"
                                        />
                                    </div>
                                </div>
                                <div className="form-group-premium">
                                    <label style={{ fontWeight: 800, fontSize: '0.85rem', color: '#888', marginBottom: '10px', display: 'block', marginRight: '5px' }}>תאריך אירוע (אופציונלי)</label>
                                    <input
                                        type="date"
                                        value={contactData.date}
                                        onChange={(e) => setContactData({ ...contactData, date: e.target.value })}
                                        style={{ padding: '18px 25px', borderRadius: '18px', border: '2px solid #f0f0f0', width: '100%', background: '#fff', fontSize: '1.05rem', fontWeight: '600', transition: 'all 0.3s' }}
                                        className="premium-input"
                                    />
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit" 
                                    className="btn btn-primary" 
                                    style={{ 
                                        padding: '20px', 
                                        borderRadius: '20px', 
                                        fontWeight: '900', 
                                        fontSize: '1.2rem', 
                                        marginTop: '15px',
                                        background: 'linear-gradient(135deg, var(--primary-color) 0%, #B8860B 100%)',
                                        border: 'none',
                                        color: 'white',
                                        boxShadow: '0 10px 25px rgba(212,175,55,0.2)'
                                    }}
                                >
                                    בואו נצא לדרך!
                                </motion.button>
                            </form>
                        </div>

                    </div>
                </div>
            </section>
            
            {/* Premium Footer Section */}
            <footer style={{ background: '#1a1a1a', color: 'white', padding: '80px 0 40px', position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ maxWidth: '1200px', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '60px', marginBottom: '60px', textAlign: 'right' }}>
                        
                        {/* Column 1: Brand */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '20px' }}>Fiesta</div>
                            <p style={{ color: '#aaa', lineHeight: 1.8, fontSize: '1.1rem', maxWidth: '350px', marginLeft: '0', marginRight: 'auto' }}>
                                המקום המושלם למצוא את הספקים הטובים ביותר לאירוע שלכם. אנחנו כאן כדי להפוך את החזון שלכם למציאות מרגשת ובלתי נשכחת.
                            </p>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '30px', justifyContent: 'flex-end' }}>
                                <a href="#" style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: '0.3s' }} className="social-icon">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a href="#" style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: '0.3s' }} className="social-icon">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: '0.3s' }} className="social-icon">
                                    <i className="fab fa-whatsapp"></i>
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '25px', color: 'white' }}>ניווט מהיר</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <li><a href="/" style={{ color: '#aaa', textDecoration: 'none', transition: '0.3s' }} className="footer-link">דף הבית</a></li>
                                <li><a href="#suppliers" style={{ color: '#aaa', textDecoration: 'none', transition: '0.3s' }} className="footer-link">חיפוש ספקים</a></li>
                                <li><a href="#articles" style={{ color: '#aaa', textDecoration: 'none', transition: '0.3s' }} className="footer-link">מאמרים ומדריכים</a></li>
                                <li><a href="#contact" style={{ color: '#aaa', textDecoration: 'none', transition: '0.3s' }} className="footer-link">צור קשר</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Categories */}
                        <div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '25px', color: 'white' }}>קטגוריות פופולריות</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <li><a href="/category/venue" style={{ color: '#aaa', textDecoration: 'none', transition: '0.3s' }} className="footer-link">אולמות וגנים</a></li>
                                <li><a href="/category/dj" style={{ color: '#aaa', textDecoration: 'none', transition: '0.3s' }} className="footer-link">DJ ומוזיקה</a></li>
                                <li><a href="/category/photographer" style={{ color: '#aaa', textDecoration: 'none', transition: '0.3s' }} className="footer-link">צילום אירועים</a></li>
                                <li><a href="/category/catering" style={{ color: '#aaa', textDecoration: 'none', transition: '0.3s' }} className="footer-link">קייטרינג</a></li>
                            </ul>
                        </div>

                    </div>

                    {/* Bottom Copyright */}
                    <div style={{ paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                            © {new Date().getFullYear()} Fiesta - כל הזכויות שמורות. נבנה באהבה עבור הזוגות שלנו.
                        </div>
                        <div style={{ display: 'flex', gap: '30px' }}>
                            <a href="#" style={{ color: '#666', fontSize: '0.9rem', textDecoration: 'none' }}>תנאי שימוש</a>
                            <a href="#" style={{ color: '#666', fontSize: '0.9rem', textDecoration: 'none' }}>מדיניות פרטיות</a>
                        </div>
                    </div>
                </div>

                {/* Subtle Background Decoration */}
                <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)', borderRadius: '50%', zIndex: 1 }} />
                <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)', borderRadius: '50%', zIndex: 1 }} />
            </footer>
            <style jsx>{`
                .premium-search-bar.light-luxury {
                    display: flex;
                    align-items: center;
                    background: #ffffff;
                    border: 1px solid rgba(212, 175, 55, 0.15); /* Very subtle gold border */
                    box-shadow: 0 25px 50px rgba(0,0,0,0.05), 0 0 20px rgba(212, 175, 55, 0.05);
                    padding: 10px 10px 10px 25px;
                    border-radius: 100px;
                    max-width: 850px;
                    margin: 0 auto;
                    gap: 15px;
                    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                
                .premium-search-bar.light-luxury:hover {
                    box-shadow: 0 35px 70px rgba(0,0,0,0.08), 0 0 30px rgba(212, 175, 55, 0.1);
                    border-color: rgba(212, 175, 55, 0.3);
                }

                .search-field {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 10px 20px;
                    border-radius: 50px;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    position: relative;
                }

                .premium-search-bar.light-luxury .search-field:hover,
                .premium-search-bar.light-luxury .search-field.active {
                    background: #fcfcfc;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.03);
                    z-index: 99999;
                }

                .field-icon-wrapper {
                    width: 45px;
                    height: 45px;
                    border-radius: 12px;
                    background: #f9f9f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .search-field.active .field-icon-wrapper {
                    background: var(--primary-color);
                    color: white;
                }

                .search-field.active .search-icon {
                    color: white;
                }

                .search-icon {
                    color: var(--primary-color);
                    font-size: 1.3rem;
                }

                .search-input-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    width: 100%;
                }

                /* Premium Booking.com/Airbnb Dropdown Styling */
                .premium-dropdown {
                    position: absolute;
                    top: calc(100% + 15px);
                    left: 0;
                    right: 0;
                    background: #ffffff;
                    border-radius: 24px;
                    box-shadow: 0 15px 45px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
                    padding: 12px 0;
                    z-index: 99999;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
                    max-height: 320px;
                    overflow-y: auto;
                }

                .premium-dropdown.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px 24px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .dropdown-item:hover {
                    background: #faf9f7;
                }

                .dropdown-icon-premium {
                    width: 42px;
                    height: 42px;
                    flex-shrink: 0;
                    border-radius: 14px;
                    background: #f8f9fa;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary-color);
                    font-size: 1.1rem;
                    border: 1px solid #f0f0f0;
                    transition: all 0.2s ease;
                }

                .dropdown-item:hover .dropdown-icon-premium {
                    background: var(--primary-color);
                    color: white;
                    transform: scale(1.1);
                }

                .dropdown-header {
                    padding: 10px 24px 5px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #bbb;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }

                .dropdown-text {
                    display: flex;
                    flex-direction: column;
                    text-align: right;
                }

                .dropdown-title {
                    font-weight: 700;
                    color: #1a1a1a;
                    font-size: 1.05rem;
                }

                .dropdown-subtitle {
                    font-size: 0.8rem;
                    color: #888;
                }

                .dropdown-empty {
                    padding: 20px;
                    text-align: center;
                    color: #888;
                    font-size: 0.95rem;
                }

                .premium-search-bar.light-luxury .search-input-wrapper label {
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 2px;
                }

                .search-input-wrapper input,
                .search-input-wrapper select {
                    border: none;
                    outline: none;
                    background: transparent;
                    width: 100%;
                    font-size: 1.05rem;
                    padding: 0;
                    cursor: pointer;
                    font-family: inherit;
                }
                
                .premium-search-bar.light-luxury .search-input-wrapper input,
                .premium-search-bar.light-luxury .search-input-wrapper select {
                    color: #1a1a1a;
                    font-weight: 700;
                }
                
                .premium-search-bar.light-luxury .search-input-wrapper input::placeholder {
                    color: #aaa;
                    font-weight: 500;
                }
                
                .premium-search-bar.light-luxury select option {
                    background: #ffffff;
                    color: #1a1a1a;
                }

                .search-divider {
                    width: 1px;
                    height: 40px;
                }
                
                .premium-search-bar.light-luxury .search-divider {
                    background: #eaeaea;
                }

                .premium-search-btn-luxury {
                    background: linear-gradient(135deg, var(--primary-color) 0%, #B8860B 100%);
                    color: #fff;
                    font-weight: 900;
                    padding: 16px 45px;
                    border-radius: 100px;
                    border: none;
                    font-size: 1.15rem;
                    cursor: pointer;
                    box-shadow: 0 12px 30px rgba(212, 175, 55, 0.4);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .premium-search-btn-luxury:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 15px 40px rgba(212, 175, 55, 0.5);
                    background: linear-gradient(135deg, #e5c05b 0%, #d4af37 100%);
                }
                
                .premium-search-btn-luxury:active {
                    transform: translateY(-1px) scale(0.98);
                }

                .premium-search-btn:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 10px 30px rgba(212, 175, 55, 0.6);
                    background: linear-gradient(135deg, #e6be45 0%, var(--primary-color) 100%);
                }

                @media (max-width: 768px) {
                    .premium-search-bar.light-luxury {
                        flex-direction: column;
                        border-radius: 28px;
                        padding: 20px;
                        gap: 15px;
                        box-shadow: 0 15px 30px rgba(0,0,0,0.08);
                    }
                    
                    .search-divider {
                        width: 100%;
                        height: 1px;
                        margin: 5px 0;
                    }
                    
                    .search-field {
                        width: 100%;
                        padding: 10px 15px;
                    }
                    
                    .premium-search-btn {
                        width: 100%;
                        padding: 18px;
                        margin-top: 15px;
                        border-radius: 20px;
                    }
                }
            `}</style>
        </div>
    );
}
