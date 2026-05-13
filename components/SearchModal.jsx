'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function SearchModal({ isOpen, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchArea, setSearchArea] = useState('כל הארץ');
    const [vendors, setVendors] = useState([]);
    const router = useRouter();

    const supplierGroups = [
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
                { type: 'hair', icon: 'fa-scissors', title: 'עיצוב שיער' },
                { type: 'makeup', icon: 'fa-eye', title: 'איפור' },
                { type: 'rings', icon: 'fa-ring', title: 'טבעות נישואין' }
            ]
        },
        {
            id: 'planning', label: 'ארגון ולוגיסטיקה', icon: 'fa-calendar-check', suppliers: [
                { type: 'event-production', icon: 'fa-star', title: 'הפקת אירועים' },
                { type: 'invitations', icon: 'fa-envelope-open-text', title: 'הזמנות' },
                { type: 'transportation', icon: 'fa-bus', title: 'הסעות' },
                { type: 'equipment-rental', icon: 'fa-chair', title: 'השכרת ציוד' }
            ]
        },
        {
            id: 'content', label: 'מסורת ותוכן', icon: 'fa-heart', suppliers: [
                { type: 'rabbi', icon: 'fa-book-open', title: 'רב לחופה' },
                { type: 'singers', icon: 'fa-microphone', title: 'זמרים ולהקות' },
                { type: 'attractions', icon: 'fa-wand-magic-sparkles', title: 'אטרקציות' },
                { type: 'souvenirs', icon: 'fa-gift', title: 'מזכרות' }
            ]
        },
        {
            id: 'extra', label: 'אירוח ופינוק', icon: 'fa-spa', suppliers: [
                { type: 'hotels', icon: 'fa-bed', title: 'מלונות' },
                { type: 'bachelor', icon: 'fa-glass-cheers', title: 'מסיבות רווקים' },
                { type: 'getting-ready', icon: 'fa-house-user', title: 'התארגנות' }
            ]
        }
    ];

    useEffect(() => {
        if (isOpen) {
            fetch('/api/vendors')
                .then(res => res.json())
                .then(data => setVendors(Array.isArray(data) ? data : []))
                .catch(() => {});
            
            // Prevent scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}&area=${encodeURIComponent(searchArea)}`);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="search-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div 
                        className="search-modal-container"
                        initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Elegant Background Element */}
                        <div className="bg-glow" />

                        <div className="search-modal-header">
                            <button className="close-btn-premium" onClick={onClose}>
                                <i className="fas fa-times"></i>
                                <span>סגירה</span>
                            </button>
                            <div className="modal-logo">Fiesta</div>
                        </div>

                        <div className="search-modal-content">
                            <div className="search-section-main">
                                <motion.h2 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="main-title"
                                >
                                    מה תרצו למצוא <span className="highlight">היום</span>?
                                </motion.h2>

                                <motion.form 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="premium-search-form" 
                                    onSubmit={handleSearch}
                                >
                                    <div className="search-input-box">
                                        <i className="fas fa-search main-icon"></i>
                                        <input 
                                            type="text" 
                                            placeholder="חפשו קטגוריה, ספק או שירות..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                        <button type="submit" className="search-submit-btn">
                                            חיפוש מהיר
                                        </button>
                                    </div>

                                    <div className="area-selector-chips">
                                        {['כל הארץ', 'מרכז', 'צפון', 'דרום', 'ירושלים'].map(area => (
                                            <button 
                                                key={area}
                                                type="button"
                                                className={`area-chip ${searchArea === area ? 'active' : ''}`}
                                                onClick={() => setSearchArea(area)}
                                            >
                                                {area}
                                            </button>
                                        ))}
                                    </div>
                                </motion.form>
                            </div>

                            <motion.div 
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="categories-explorer"
                            >
                                <div className="explorer-header">
                                    <h3>דפדוף לפי קטגוריות</h3>
                                    <div className="header-line"></div>
                                </div>

                                <div className="groups-grid">
                                    {supplierGroups.map((group) => (
                                        <div key={group.id} className="group-card">
                                            <div className="group-title">
                                                <i className={`fas ${group.icon}`}></i>
                                                <h4>{group.label}</h4>
                                            </div>
                                            <div className="group-items">
                                                {group.suppliers.map((s) => (
                                                    <button key={s.type} className="cat-btn" onClick={() => {
                                                        router.push(`/category/${s.type}`);
                                                        onClose();
                                                    }}>
                                                        <i className={`fas ${s.icon}`}></i>
                                                        <span>{s.title}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <style jsx>{`
                        .search-modal-overlay {
                            position: fixed;
                            inset: 0;
                            background: rgba(255, 255, 255, 0.92);
                            backdrop-filter: blur(25px);
                            z-index: 9999;
                            overflow-y: auto;
                            display: flex;
                            justify-content: center;
                        }

                        .search-modal-container {
                            width: 100%;
                            max-width: 1200px;
                            min-height: 100vh;
                            padding: 40px 20px;
                            position: relative;
                        }

                        .bg-glow {
                            position: fixed;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 600px;
                            height: 600px;
                            background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%);
                            z-index: -1;
                            pointer-events: none;
                        }

                        .search-modal-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 60px;
                        }

                        .close-btn-premium {
                            background: white;
                            border: 1px solid #eee;
                            padding: 10px 25px;
                            border-radius: 50px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            font-weight: 700;
                            color: #333;
                            transition: all 0.3s;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                        }

                        .close-btn-premium:hover {
                            background: #fdfaf0;
                            border-color: #D4AF37;
                            transform: translateY(-2px);
                        }

                        .modal-logo {
                            font-family: var(--font-display);
                            font-size: 2rem;
                            font-weight: 900;
                            color: var(--primary-color);
                        }

                        .main-title {
                            font-family: var(--font-display);
                            font-size: clamp(2.5rem, 5vw, 4rem);
                            font-weight: 900;
                            text-align: center;
                            margin-bottom: 40px;
                            color: #1a1a1a;
                        }

                        .highlight {
                            color: var(--primary-color);
                            position: relative;
                        }

                        .premium-search-form {
                            max-width: 800px;
                            margin: 0 auto 80px;
                        }

                        .search-input-box {
                            display: flex;
                            align-items: center;
                            background: white;
                            border: 1.5px solid #eee;
                            border-radius: 100px;
                            padding: 12px 12px 12px 30px;
                            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                            transition: all 0.3s;
                            margin-bottom: 25px;
                        }

                        .search-input-box:focus-within {
                            border-color: #D4AF37;
                            box-shadow: 0 25px 50px rgba(212, 175, 55, 0.15);
                            transform: translateY(-2px);
                        }

                        .main-icon {
                            font-size: 1.5rem;
                            color: #D4AF37;
                            margin-left: 20px;
                        }

                        input {
                            flex: 1;
                            border: none;
                            outline: none;
                            font-size: 1.2rem;
                            font-weight: 600;
                            color: #1a1a1a;
                            font-family: var(--font-assistant);
                        }

                        .search-submit-btn {
                            background: var(--primary-color);
                            color: white;
                            border: none;
                            padding: 15px 40px;
                            border-radius: 100px;
                            font-weight: 800;
                            font-size: 1.1rem;
                            cursor: pointer;
                            transition: all 0.3s;
                        }

                        .area-selector-chips {
                            display: flex;
                            justify-content: center;
                            gap: 12px;
                            flex-wrap: wrap;
                        }

                        .area-chip {
                            background: white;
                            border: 1px solid #eee;
                            padding: 10px 25px;
                            border-radius: 50px;
                            font-weight: 700;
                            cursor: pointer;
                            transition: all 0.3s;
                            color: #666;
                        }

                        .area-chip.active {
                            background: #D4AF37;
                            color: white;
                            border-color: #D4AF37;
                            box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3);
                        }

                        .explorer-header {
                            display: flex;
                            align-items: center;
                            gap: 20px;
                            margin-bottom: 40px;
                        }

                        .explorer-header h3 {
                            font-size: 1.4rem;
                            font-weight: 900;
                            white-space: nowrap;
                            color: #1a1a1a;
                        }

                        .header-line {
                            flex: 1;
                            height: 1px;
                            background: linear-gradient(to left, #eee, transparent);
                        }

                        .groups-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                            gap: 40px;
                        }

                        .group-card {
                            background: white;
                            border-radius: 30px;
                            padding: 30px;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                            border: 1px solid #f9f9f9;
                        }

                        .group-title {
                            display: flex;
                            align-items: center;
                            gap: 15px;
                            margin-bottom: 25px;
                            padding-bottom: 15px;
                            border-bottom: 1px solid #f5f5f5;
                        }

                        .group-title i {
                            color: #D4AF37;
                            font-size: 1.2rem;
                        }

                        .group-title h4 {
                            font-size: 1.1rem;
                            font-weight: 800;
                            margin: 0;
                        }

                        .group-items {
                            display: flex;
                            flex-direction: column;
                            gap: 10px;
                        }

                        .cat-btn {
                            background: transparent;
                            border: none;
                            display: flex;
                            align-items: center;
                            gap: 15px;
                            padding: 12px 15px;
                            border-radius: 15px;
                            cursor: pointer;
                            transition: all 0.2s;
                            text-align: right;
                            color: #555;
                            font-weight: 500;
                        }

                        .cat-btn:hover {
                            background: #fdfaf0;
                            color: #D4AF37;
                            padding-right: 25px;
                        }

                        .cat-btn i {
                            font-size: 0.9rem;
                            width: 20px;
                            opacity: 0.7;
                        }

                        @media (max-width: 768px) {
                            .search-modal-container { padding: 20px; }
                            .search-modal-header { margin-bottom: 40px; }
                            .search-input-box {
                                padding: 8px 8px 8px 20px;
                                border-radius: 25px;
                            }
                            .search-submit-btn {
                                padding: 12px 20px;
                                font-size: 0.9rem;
                            }
                            .groups-grid { grid-template-columns: 1fr; }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
