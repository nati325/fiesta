'use client';

import { useParams, useRouter } from 'next/navigation';
import { useVendors } from '@/context/VendorContext';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { resolveVendorImage, resolvePortfolioImage } from '@/lib/vendorImage';
import { EditChip } from '@/components/SiteEditBar';

export default function VendorDetailPage() {
    const params = useParams();
    const id = params.id;
    const router = useRouter();
    const { vendors } = useVendors();
    const { isAdmin } = useAuth();

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
        'dj': { label: 'DJ ומוזיקה', img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80' },
        'photographer': { label: 'צילום אירועים', img: '/images/event_photographer.png' },
        'alcohol': { label: 'אלכוהול ובר', img: '/images/bar_hero.png' },
        'catering': { label: 'קייטרינג', img: '/images/catering.jpeg' },
        'venue': { label: 'אולמות וגנים', img: '/images/venue_hero.png' },
        'design': { label: 'עיצוב אירועים', img: '/images/wedding_floral_arch_1765744424651.png' },
        'dresses': { label: 'שמלות כלה', img: '/images/wedding_dress.jpeg' },
        'suits': { label: 'חליפות חתן', img: '/images/groom_suits.jpeg' },
        'bride-shoes': { label: 'נעלי כלה', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80' },
        'groom-shoes': { label: 'נעלי חתן', img: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=1200&q=80' },
        'hair': { label: 'עיצוב שיער', img: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=80' },
        'makeup': { label: 'איפור', img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80' },
        'rings': { label: 'טבעות נישואין', img: '/images/jewelry_hero.png' },
        'event-production': { label: 'הפקת אירועים', img: '/images/event_production.jpeg' },
        'rsvp': { label: 'אישורי הגעה', img: 'https://images.unsplash.com/photo-1512418490979-92798ccc13fb?auto=format&fit=crop&w=1200&q=80' },
        'invitations': { label: 'הזמנות', img: '/images/invitations_hero.png' },
        'transportation': { label: 'הסעות', img: '/images/car_hero.png' },
        'cars': { label: 'רכבי יוקרה', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80' },
        'equipment-rental': { label: 'השכרת ציוד', img: '/images/wedding_table_detail_1765744408525.png' },
        'rabbi': { label: 'רב לחופה', img: '/images/rabbi.jpeg' },
        'cantors': { label: 'חזנים ופייטנים', img: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=1200&q=80' },
        'singers': { label: 'זמרים ולהקות', img: '/images/entertainment_hero.png' },
        'religious-bands': { label: 'להקות דתיות', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80' },
        'challa': { label: 'הפרשת חלה', img: 'https://images.unsplash.com/photo-1610452399201-9a7076594d2f?auto=format&fit=crop&w=1200&q=80' },
        'attractions': { label: 'אטרקציות', img: '/images/attractions_hero.png' },
        'souvenirs': { label: 'מזכרות', img: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=80' },
        'hotels': { label: 'מלונות', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
        'bachelor': { label: 'מסיבות רווקים', img: 'https://images.unsplash.com/photo-1514525253344-f81bcd3ce942?auto=format&fit=crop&w=1200&q=80' },
        'getting-ready': { label: 'התארגנות כלה', img: '/images/wedding_lounge_1765744440712.png' },
        'dietitians': { label: 'תזונה ודיאטה', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80' },
        'personal-training': { label: 'כושר ואימון', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80' },
    };

    const currentCategory = categoryData[vendor.type] || {
        label: 'ספק מובחר',
        img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    };

    // Collect unique vendor images in display order:
    // main product → vendor.image → other products → portfolio
    const collectVendorImages = () => {
        const urls = [];
        const push = (raw) => {
            const resolved = resolveVendorImage(raw, '');
            if (!resolved || !resolved.trim()) return;
            if (urls.includes(resolved)) return;
            urls.push(resolved);
        };

        const mainProduct = vendor.products?.find((p) => p.id === vendor.mainProductId);
        if (mainProduct?.image) push(mainProduct.image);
        if (vendor.image) push(vendor.image);
        (vendor.products || []).forEach((p) => push(p?.image));
        (vendor.portfolio || []).forEach((item) => {
            if (typeof item === 'string') push(item);
            else push(item?.image);
        });

        return urls;
    };

    const vendorImages = collectVendorImages();
    // Circle avatar = first image; hero = second if exists, else category topic image
    const avatarImage = vendorImages[0] || currentCategory.img;
    const heroBackground = vendorImages.length >= 2 ? vendorImages[1] : currentCategory.img;

    return (
        <div className="vendor-page">
            {/* Elegant Hero Header */}
            <div className="vendor-hero">
                <img
                    src={heroBackground}
                    alt=""
                    className="vendor-hero-img"
                    onError={(e) => { e.target.src = currentCategory.img; }}
                />
                <div className="vendor-hero-overlay" />
                
                <button
                    onClick={() => router.back()}
                    className="vendor-back-btn"
                    aria-label="חזרה"
                >
                    <i className="fas fa-arrow-right"></i>
                </button>
            </div>

            {/* Profile Content */}
            <div className="container vendor-profile-wrap">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="vendor-profile-card"
                >
                    {/* Avatar */}
                    <div className="vendor-avatar">
                        <img 
                            src={avatarImage}
                            alt={vendor.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = currentCategory.img; }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <div style={{ background: 'var(--off-white)', color: 'var(--text-dark)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, border: '1px solid var(--border-color)' }}>
                            {currentCategory.label}
                        </div>
                        {vendor.discount && (
                            <div style={{ background: 'var(--charcoal)', color: 'white', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                                {vendor.discountType === 'amount' ? '₪' : ''}{vendor.discount}{vendor.discountType === 'amount' ? '' : '%'} הנחה לחברים
                            </div>
                        )}
                    </div>
                    
                    <h1 className="vendor-name">{vendor.name}</h1>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <EditChip href={`/admin/vendors/${vendor.id}`} label="ערוך ספק" />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', color: 'var(--text-light)', marginBottom: '20px', fontWeight: 500, fontSize: '0.95rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{vendor.region || vendor.location || 'כל הארץ'}</span>
                        </div>
                        <div style={{ width: '1px', height: '14px', background: '#e5e2dc' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)' }}>
                            <i className="fas fa-star"></i>
                            <span style={{ color: 'var(--text-dark)' }}>
                                {vendor.googleRating ? Number(vendor.googleRating).toFixed(1) : '5.0'}
                                {vendor.googleReviewsCount > 0 && ` (${vendor.googleReviewsCount} ביקורות)`}
                            </span>
                        </div>
                    </div>

                    {vendor.price && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                {vendor.originalPrice && (
                                    <span style={{ fontSize: '1.15rem', color: '#999', textDecoration: 'line-through' }}>₪{vendor.originalPrice}</span>
                                )}
                                <span style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>₪{vendor.price}</span>
                            </div>
                            {vendor.originalPrice && (
                                <div style={{ 
                                    marginTop: '10px',
                                    background: 'var(--off-white)', 
                                    color: 'var(--text-dark)', 
                                    padding: '8px 16px', 
                                    borderRadius: '6px', 
                                    fontSize: '0.9rem', 
                                    fontWeight: 500,
                                    border: '1px solid var(--border-color)'
                                }}>
                                    מחיר פייסטה: חיסכון של ₪{vendor.originalPrice - vendor.price}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ maxWidth: '680px', margin: '0 auto 40px' }}>
                        <p style={{ fontSize: '1.05rem', color: 'var(--text-light)', lineHeight: '1.75', textAlign: 'right' }}>
                            {vendor.description ? (
                                <>
                                    <span style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--text-dark)' }}>קצת עלינו</span>
                                    {vendor.description}
                                </>
                            ) : (
                                `אנחנו ב-${vendor.name} מאמינים שכל אירוע הוא סיפור ייחודי. עם ניסיון בתחום ה-${currentCategory.label}, אנחנו מביאים יצירתיות, מקצועיות ויחס אישי.`
                            )}
                        </p>
                    </div>

                    {/* Google Reviews */}
                    <div style={{ marginBottom: '36px', display: 'flex', justifyContent: 'center' }}>
                        <a 
                            href={vendor.googleReviewsLink || `https://www.google.com/maps/search/${encodeURIComponent(vendor.name)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                background: 'white', padding: '12px 22px', borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                textDecoration: 'none', color: 'var(--text-dark)', fontWeight: 500, transition: 'border-color 0.2s'
                            }}
                            className="google-review-btn"
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: '20px' }} />
                            <span>
                                {vendor.googleReviewsCount > 0
                                    ? `${vendor.googleReviewsCount} ביקורות בגוגל`
                                    : 'ביקורות גוגל'}
                            </span>
                            <div style={{ color: 'var(--primary-color)', display: 'flex', gap: '2px', fontSize: '0.8rem' }}>
                                {[...Array(Math.floor(vendor.googleRating || 5))].map((_, i) => (
                                    <i key={i} className="fas fa-star"></i>
                                ))}
                                {((vendor.googleRating || 5) % 1 !== 0) && <i className="fas fa-star-half-alt"></i>}
                            </div>
                        </a>
                    </div>

                    {/* Videos Section */}
                    {vendor.videos && vendor.videos.length > 0 && (
                        <div style={{ marginTop: '48px', marginBottom: '36px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '1.6rem', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '0', fontFamily: 'var(--font-display)' }}>וידאו וסרטונים</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                {vendor.videos.map((video, idx) => {
                                    if (!video) return null;
                                    let embedUrl = video;
                                    if (video.includes('youtube.com/watch?v=')) {
                                        embedUrl = video.replace('watch?v=', 'embed/');
                                    } else if (video.includes('youtu.be/')) {
                                        embedUrl = video.replace('youtu.be/', 'youtube.com/embed/');
                                    } else if (video.includes('vimeo.com/')) {
                                        embedUrl = video.replace('vimeo.com/', 'player.vimeo.com/video/');
                                    }

                                    return (
                                        <div key={idx} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', aspectRatio: '16/9' }}>
                                            <iframe 
                                                width="100%" 
                                                height="100%" 
                                                src={embedUrl} 
                                                title={`Video ${idx + 1}`} 
                                                frameBorder="0" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="vendor-actions">
                        <a
                            href={`https://wa.me/972535378985?text=${encodeURIComponent(`היי, הגעתי מ־Fiesta לגבי ${vendor.name} ואשמח לתיאום`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="btn btn-outline vendor-contact-btn"
                        >
                            לתיאום דרך Fiesta
                        </a>
                        
                        <button className="btn btn-outline vendor-fav-btn">
                            <i className="far fa-heart"></i> שמירה במועדפים
                        </button>
                    </div>
                </motion.div>

                {/* Info Grid */}
                <div className="vendor-info-grid">
                    <div className="vendor-info-card">
                        <h4>שירותים מובילים</h4>
                        <ul>
                            <li><i className="fas fa-check"></i> ליווי אישי מיום הסגירה</li>
                            <li><i className="fas fa-check"></i> ציוד טכנולוגי המתקדם בעולם</li>
                            <li><i className="fas fa-check"></i> פגישת תיאום ציפיות מפורטת</li>
                        </ul>
                    </div>
                    
                    <div className="vendor-info-card">
                        <h4>למה אנחנו?</h4>
                        <p>אנחנו לא רק מספקים שירות, אנחנו בונים חוויה. האיכות שלנו נמדדת בפרטים הקטנים ובחיוך שלכם בסוף הערב.</p>
                    </div>
                </div>

                {/* Portfolio / Services section */}
                <div className="vendor-sections">
                    {/* Services & Prices (Conditional) */}
                    {((vendor.portfolio && vendor.portfolio.some(item => item.price)) || (vendor.products && vendor.products.length > 0)) && (
                        <div className="vendor-services-block">
                            <div className="vendor-section-head">
                                <h2>שירותים ומחירים</h2>
                                <div className="vendor-section-line"></div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                                {(vendor.products && vendor.products.length > 0 ? vendor.products : (vendor.portfolio || []).filter(item => item.price)).map((item, i) => (
                                    <div 
                                        key={i} 
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '14px',
                                            background: 'white', padding: '12px', borderRadius: '12px',
                                            border: '1px solid var(--border-color)'
                                        }}
                                    >
                                        <div style={{ width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                            <img 
                                                src={typeof item === 'number' ? currentCategory.img : resolvePortfolioImage(item, currentCategory.img)} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                alt={item.title || item.name} 
                                                onError={(e) => { e.target.src = currentCategory.img; }}
                                            />
                                            {vendor.mainProductId === item.id && (
                                                <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--charcoal)', color: 'white', fontSize: '0.6rem', padding: '2px 6px', borderBottomLeftRadius: '6px', fontWeight: 600 }}>
                                                    ראשי
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, textAlign: 'right' }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', margin: '0 0 4px 0', fontFamily: 'var(--font-main)' }}>{item.title || item.name || 'שירות מותאם אישית'}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                                                        <span style={{ fontSize: '0.8rem', color: '#999', textDecoration: 'line-through' }}>₪{item.originalPrice}</span>
                                                    )}
                                                    <span style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '1.05rem' }}>
                                                        ₪{item.price}
                                                    </span>
                                                </div>
                                                {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                                                    <span style={{ background: 'var(--off-white)', color: 'var(--text-dark)', fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                                        חיסכון ₪{item.originalPrice - item.price}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pure Image Gallery */}
                    <div className="vendor-section-head gallery-head">
                        <h2>גלריית עבודות</h2>
                        <div className="vendor-section-actions">
                            <EditChip href={`/admin/vendors/${vendor.id}`} label="ערוך גלריה / ספק" />
                            <div className="vendor-section-line short"></div>
                        </div>
                    </div>

                    {isAdmin && (!vendor.portfolio || vendor.portfolio.length === 0) && (!vendor.products || vendor.products.length === 0) && (
                        <div style={{
                            marginBottom: '20px',
                            padding: '18px',
                            borderRadius: '16px',
                            border: '1.5px dashed #fbbf24',
                            background: '#fffbeb',
                            color: '#92400e',
                            fontWeight: 700,
                            textAlign: 'right',
                        }}>
                            הגלריה ריקה כרגע. לחץ על &quot;ערוך גלריה / ספק&quot; בדף הניהול כדי להוסיף תמונות.
                        </div>
                    )}
                    
                    <div className="vendor-gallery-grid">
                        {(
                            (vendor.products && vendor.products.length > 0)
                                ? vendor.products
                                : (vendor.portfolio && vendor.portfolio.length > 0)
                                    ? vendor.portfolio
                                    : (isAdmin ? [] : [1, 2, 3, 4, 5, 6])
                        ).map((item, i) => (
                            <motion.div 
                                key={i} 
                                whileHover={{ scale: 1.02 }}
                                className="vendor-gallery-item"
                            >
                                <img 
                                    src={typeof item === 'number' ? currentCategory.img : resolvePortfolioImage(item, currentCategory.img)} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} 
                                    alt="portfolio image" 
                                    className="gallery-img"
                                    onError={(e) => { e.target.src = currentCategory.img; }}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', opacity: 0, transition: 'opacity 0.3s' }} className="gallery-overlay">
                                    <i className="fas fa-search-plus" style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2rem' }}></i>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .vendor-page {
                    min-height: 100vh;
                    background: var(--white);
                    padding-bottom: 24px;
                }
                .vendor-hero {
                    height: 38vh;
                    min-height: 280px;
                    position: relative;
                    overflow: hidden;
                }
                .vendor-hero-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    filter: brightness(0.7);
                }
                .vendor-hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, transparent 40%, rgba(12,12,12,0.55));
                }
                .vendor-back-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    z-index: 10;
                    color: white;
                    background: rgba(0,0,0,0.35);
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.15);
                    cursor: pointer;
                }
                .vendor-profile-wrap {
                    max-width: 920px;
                    margin-top: -100px;
                    position: relative;
                    z-index: 10;
                }
                .vendor-profile-card {
                    background: white;
                    border-radius: var(--radius-lg);
                    padding: 48px 36px;
                    border: 1px solid var(--border-color);
                    text-align: center;
                }
                .vendor-avatar {
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    border: 4px solid white;
                    overflow: hidden;
                    margin: -110px auto 24px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    background: #eee;
                }
                .vendor-name {
                    font-size: clamp(1.8rem, 4vw, 2.6rem);
                    font-weight: 500;
                    color: var(--text-dark);
                    margin-bottom: 12px;
                    font-family: var(--font-display);
                }
                .vendor-actions {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 12px;
                }
                .vendor-contact-btn {
                    padding: 12px 22px !important;
                    border-radius: 8px !important;
                    font-weight: 600 !important;
                    font-size: 0.95rem !important;
                    border: 1px solid var(--border-color) !important;
                    color: var(--text-dark) !important;
                    background: white !important;
                }
                .vendor-contact-btn:hover {
                    border-color: var(--primary-color) !important;
                    color: var(--primary-color) !important;
                }
                .vendor-fav-btn {
                    padding: 12px 22px !important;
                    border-radius: 8px !important;
                    font-weight: 600 !important;
                    font-size: 0.95rem !important;
                    border: 1px solid var(--border-color) !important;
                    color: var(--text-dark) !important;
                    background: white !important;
                }
                .vendor-fav-btn i { margin-left: 8px; }
                .vendor-info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 16px;
                    margin-top: 28px;
                }
                .vendor-info-card {
                    background: white;
                    padding: 24px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    text-align: right;
                }
                .vendor-info-card h4 {
                    font-size: 1.05rem;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: var(--text-dark);
                    font-family: var(--font-main);
                }
                .vendor-info-card ul {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    color: var(--text-light);
                    font-weight: 500;
                    font-size: 0.95rem;
                }
                .vendor-info-card li i {
                    margin-left: 8px;
                    color: var(--primary-color);
                }
                .vendor-info-card p {
                    color: var(--text-light);
                    line-height: 1.6;
                    font-size: 0.95rem;
                }
                .vendor-sections { margin-top: 48px; }
                .vendor-services-block { margin-bottom: 40px; }
                .vendor-section-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .vendor-section-head h2 {
                    font-size: clamp(1.35rem, 3vw, 1.75rem);
                    font-weight: 500;
                    font-family: var(--font-display);
                    margin: 0;
                }
                .vendor-section-line { display: none; }
                .vendor-section-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .vendor-gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 12px;
                }
                .vendor-gallery-item {
                    height: 220px;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    background: #eee;
                    cursor: zoom-in;
                    position: relative;
                }
                .mobile-sticky-cta { display: none; }
                .google-review-btn:hover { border-color: #cfc9be !important; }

                @media (max-width: 768px) {
                    .vendor-page {
                        padding-bottom: 24px;
                    }
                    .vendor-hero {
                        height: 26vh;
                        min-height: 180px;
                        max-height: 240px;
                    }
                    .vendor-back-btn {
                        top: 14px;
                        right: 14px;
                    }
                    .vendor-profile-wrap {
                        margin-top: -64px;
                        padding: 0 12px;
                    }
                    .vendor-profile-card {
                        border-radius: 14px;
                        padding: 24px 16px 28px;
                    }
                    .vendor-avatar {
                        width: 100px;
                        height: 100px;
                        border-width: 3px;
                        margin: -72px auto 18px;
                    }
                    .vendor-name {
                        font-size: 1.55rem;
                        margin-bottom: 10px;
                    }
                    .vendor-actions { flex-direction: column; gap: 10px; }
                    .vendor-contact-btn,
                    .vendor-fav-btn {
                        width: 100%;
                        justify-content: center;
                        padding: 12px 18px !important;
                        min-height: 44px;
                    }
                    .vendor-info-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                        margin-top: 20px;
                    }
                    .vendor-sections { margin-top: 32px; }
                    .vendor-gallery-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                    }
                    .vendor-gallery-item {
                        height: 140px;
                        border-radius: 10px;
                    }
                    .google-review-btn:hover { border-color: #cfc9be !important; }
                }
            `}</style>
        </div>
    );
}
