'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getCategoryLabel } from '@/lib/vendorCategories';
import { getVendorDisplayPrice } from '@/lib/vendorPrice';
import { resolveVendorImage } from '@/lib/vendorImage';
import { vendorMatchesArea, formatVendorRegions } from '@/lib/vendorRegion';
import { useAuth } from '@/context/AuthContext';
import { vendorFitsEvent } from '@/lib/eventTypes';

export default function SearchModal({ isOpen, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchArea, setSearchArea] = useState('כל הארץ');
    const [vendors, setVendors] = useState([]);
    const router = useRouter();
    const { eventPreference } = useAuth();

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
                .catch(() => setVendors([]));

            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            setSearchQuery('');
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const matchedVendors = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [];

        return vendors
            .filter((v) => {
                const name = (v.name || '').toLowerCase();
                const typeLabel = getCategoryLabel(v.type).toLowerCase();
                const desc = (v.description || '').toLowerCase();
                const type = (v.type || '').toLowerCase();
                const matchesQuery =
                    name.includes(q) ||
                    typeLabel.includes(q) ||
                    type.includes(q) ||
                    desc.includes(q);
                if (!matchesQuery) return false;
                if (!vendorMatchesArea(v, searchArea)) return false;
                if (eventPreference && !vendorFitsEvent(v, eventPreference)) {
                    return false;
                }
                return true;
            })
            .slice(0, 8);
    }, [searchQuery, searchArea, vendors, eventPreference]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}&area=${encodeURIComponent(searchArea)}`);
            onClose();
        }
    };

    const goToVendor = (id) => {
        router.push(`/vendor/${id}`);
        onClose();
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
                        <div className="bg-glow" />

                        <div className="search-modal-header">
                            <button type="button" className="close-btn-premium" onClick={onClose}>
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

                                {searchQuery.trim() && (
                                    <div className="live-vendor-results">
                                        <div className="explorer-header">
                                            <h3>
                                                ספקים מהמערכת
                                                {matchedVendors.length > 0 ? ` (${matchedVendors.length})` : ''}
                                            </h3>
                                            <div className="header-line"></div>
                                        </div>
                                        {matchedVendors.length === 0 ? (
                                            <p className="no-vendor-match">לא נמצאו ספקים תואמים — נסו חיפוש מלא או בחרו קטגוריה</p>
                                        ) : (
                                            <div className="vendor-suggest-list">
                                                {matchedVendors.map((v) => {
                                                    const img = resolveVendorImage(v.image, '');
                                                    const price = getVendorDisplayPrice(v, eventPreference).display;
                                                    return (
                                                        <button
                                                            key={v.id}
                                                            type="button"
                                                            className="vendor-suggest-item"
                                                            onClick={() => goToVendor(v.id)}
                                                        >
                                                            {img ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={img} alt="" className="vendor-suggest-thumb" />
                                                            ) : (
                                                                <span className="vendor-suggest-thumb placeholder">
                                                                    <i className="fas fa-store" />
                                                                </span>
                                                            )}
                                                            <span className="vendor-suggest-info">
                                                                <strong>{v.name}</strong>
                                                                <small>
                                                                    {getCategoryLabel(v.type)}
                                                                    {formatVendorRegions(v) ? ` · ${formatVendorRegions(v)}` : ''}
                                                                    {price ? ` · ${price}` : ''}
                                                                </small>
                                                            </span>
                                                            <i className="fas fa-chevron-left suggest-arrow" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
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
                                                    <button key={s.type} type="button" className="cat-btn" onClick={() => {
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
                            margin: 0 auto 40px;
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

                        .live-vendor-results {
                            max-width: 800px;
                            margin: 0 auto 48px;
                        }

                        .no-vendor-match {
                            text-align: center;
                            color: #888;
                            font-size: 0.95rem;
                            margin: 0;
                            padding: 12px;
                        }

                        .vendor-suggest-list {
                            display: flex;
                            flex-direction: column;
                            gap: 8px;
                        }

                        .vendor-suggest-item {
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            width: 100%;
                            background: white;
                            border: 1px solid #eee;
                            border-radius: 16px;
                            padding: 12px 16px;
                            cursor: pointer;
                            text-align: right;
                            transition: border-color 0.2s, box-shadow 0.2s;
                            font-family: inherit;
                        }

                        .vendor-suggest-item:hover {
                            border-color: #D4AF37;
                            box-shadow: 0 8px 20px rgba(212, 175, 55, 0.12);
                        }

                        .vendor-suggest-thumb {
                            width: 48px;
                            height: 48px;
                            border-radius: 10px;
                            object-fit: cover;
                            flex-shrink: 0;
                            background: #f5f5f5;
                        }

                        .vendor-suggest-thumb.placeholder {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #bbb;
                        }

                        .vendor-suggest-info {
                            flex: 1;
                            min-width: 0;
                            display: flex;
                            flex-direction: column;
                            gap: 4px;
                        }

                        .vendor-suggest-info strong {
                            font-size: 1rem;
                            color: #1a1a1a;
                        }

                        .vendor-suggest-info small {
                            font-size: 0.8rem;
                            color: #888;
                        }

                        .suggest-arrow {
                            color: #ccc;
                            font-size: 0.85rem;
                        }

                        .explorer-header {
                            display: flex;
                            align-items: center;
                            gap: 20px;
                            margin-bottom: 40px;
                        }

                        .live-vendor-results .explorer-header {
                            margin-bottom: 16px;
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
                            .search-modal-container {
                                padding: 20px 16px calc(40px + env(safe-area-inset-bottom, 0px));
                            }
                            .search-modal-header { margin-bottom: 40px; }
                            .search-input-box {
                                flex-direction: column;
                                align-items: stretch;
                                padding: 12px;
                                border-radius: 20px;
                                gap: 10px;
                            }
                            .search-submit-btn {
                                width: 100%;
                                padding: 14px 20px;
                                font-size: 1rem;
                                min-height: 48px;
                            }
                            .main-icon { margin: 0 0 0 8px; }
                            .groups-grid { grid-template-columns: 1fr; }
                            .vendor-suggest-item { min-height: 64px; }
                            .main-title { font-size: clamp(1.8rem, 8vw, 2.4rem); margin-bottom: 24px; }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
