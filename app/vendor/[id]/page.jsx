'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useVendors } from '@/context/VendorContext';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { resolveVendorImage, resolvePortfolioImage } from '@/lib/vendorImage';
import VendorNoImage from '@/components/VendorNoImage';
import { EditChip } from '@/components/SiteEditBar';
import { formatPrice, getVendorDisplayPrice, getSavings, hasValidPrice } from '@/lib/vendorPrice';

export default function VendorDetailPage() {
    const params = useParams();
    const id = params.id;
    const router = useRouter();
    const { vendors, toggleFavorite, isFavorite, loading: vendorsLoading } = useVendors();
    const { isAdmin } = useAuth();
    const [lightboxSrc, setLightboxSrc] = useState('');

    const vendor = vendors.find(v => v.id.toString() === id);

    if (vendorsLoading) {
        return (
            <div style={{ paddingTop: '150px', textAlign: 'center', minHeight: '80vh' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '12px', fontWeight: 500 }}>טוענים את הספק...</h2>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div style={{ paddingTop: '150px', textAlign: 'center', minHeight: '80vh' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>אופס! הספק לא נמצא</h2>
                <button onClick={() => router.push('/')} className="btn btn-primary" style={{ padding: '15px 40px', borderRadius: '50px' }}>חזרה לדף הבית</button>
            </div>
        );
    }

    const categoryLabels = {
        'dj': 'DJ ומוזיקה',
        'photographer': 'צילום אירועים',
        'alcohol': 'אלכוהול ובר',
        'catering': 'קייטרינג',
        'venue': 'אולמות וגנים',
        'design': 'עיצוב אירועים',
        'dresses': 'שמלות כלה',
        'suits': 'חליפות חתן',
        'bride-shoes': 'נעלי כלה',
        'groom-shoes': 'נעלי חתן',
        'hair': 'עיצוב שיער',
        'makeup': 'איפור',
        'rings': 'טבעות נישואין',
        'event-production': 'הפקת אירועים',
        'rsvp': 'אישורי הגעה',
        'invitations': 'הזמנות',
        'transportation': 'הסעות',
        'cars': 'רכבי יוקרה',
        'equipment-rental': 'השכרת ציוד',
        'rabbi': 'רב לחופה',
        'cantors': 'חזנים ופייטנים',
        'singers': 'זמרים ולהקות',
        'religious-bands': 'להקות דתיות',
        'challa': 'הפרשת חלה',
        'attractions': 'אטרקציות',
        'souvenirs': 'מזכרות',
        'hotels': 'מלונות',
        'bachelor': 'מסיבות רווקים',
        'getting-ready': 'התארגנות כלה',
        'dietitians': 'תזונה ודיאטה',
        'personal-training': 'כושר ואימון',
    };

    const categoryLabel = categoryLabels[vendor.type] || 'ספק מובחר';

    // Unique real images only — no category/stock defaults
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
    // 1 photo → same for avatar + hero background; 2+ → avatar first, hero second; 0 → no image placeholder
    const avatarImage = vendorImages[0] || '';
    const heroBackground =
        vendorImages.length >= 2 ? vendorImages[1] : vendorImages.length === 1 ? vendorImages[0] : '';

    // Gallery: unique real images only (prefer portfolio, then other vendor images)
    const galleryImages = (() => {
        const urls = [];
        const push = (raw) => {
            const resolved = resolveVendorImage(raw, '');
            if (!resolved || !resolved.trim()) return;
            if (urls.includes(resolved)) return;
            urls.push(resolved);
        };
        (vendor.portfolio || []).forEach((item) => {
            if (typeof item === 'string') push(item);
            else push(item?.image);
        });
        // If portfolio empty, fall back to unique vendor images (still no duplicates)
        if (urls.length === 0) vendorImages.forEach(push);
        return urls;
    })();

    const priceInfo = getVendorDisplayPrice(vendor);
    const liked = isFavorite(vendor.id);
    const waUrl = `https://wa.me/972535378985?text=${encodeURIComponent(
        `היי, הגעתי מ־Fiesta לגבי ${vendor.name} ואשמח לדבר עם נציג`
    )}`;

    return (
        <div className="vendor-page">
            {/* Elegant Hero Header */}
            <div className="vendor-hero">
                {heroBackground ? (
                    <img
                        src={heroBackground}
                        alt=""
                        className="vendor-hero-img"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="vendor-hero-empty">
                        <VendorNoImage />
                    </div>
                )}
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
                        {avatarImage ? (
                            <img 
                                src={avatarImage}
                                alt={vendor.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <VendorNoImage compact />
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <div style={{ background: 'var(--off-white)', color: 'var(--text-dark)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, border: '1px solid var(--border-color)' }}>
                            {categoryLabel}
                        </div>
                        {vendor.discount != null && String(vendor.discount).trim() !== '' && String(vendor.discount) !== '0' && (
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
                        {vendor.googleRating != null && String(vendor.googleRating).trim() !== '' && Number(vendor.googleRating) > 0 && (
                            <>
                                <div style={{ width: '1px', height: '14px', background: '#e5e2dc' }}></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-star"></i>
                                    <span style={{ color: 'var(--text-dark)' }}>
                                        {Number(vendor.googleRating).toFixed(1)}
                                        {vendor.googleReviewsCount > 0 && ` (${vendor.googleReviewsCount} ביקורות)`}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {priceInfo.display ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                {priceInfo.originalDisplay && (
                                    <span style={{ fontSize: '1.15rem', color: '#999', textDecoration: 'line-through' }}>{priceInfo.originalDisplay}</span>
                                )}
                                <span style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>{priceInfo.display}</span>
                            </div>
                            {priceInfo.savings != null && (
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
                                    מחיר פייסטה: חיסכון של ₪{priceInfo.savings.toLocaleString('he-IL')}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                            <span style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)' }}>לתיאום מחיר</span>
                        </div>
                    )}

                    {vendor.description ? (
                        <div style={{ maxWidth: '680px', margin: '0 auto 40px' }}>
                            <p style={{ fontSize: '1.05rem', color: 'var(--text-light)', lineHeight: '1.75', textAlign: 'right' }}>
                                <span style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--text-dark)' }}>קצת עלינו</span>
                                {vendor.description}
                            </p>
                        </div>
                    ) : null}

                    {/* Reviews from DB only — never link to Google */}
                    {Array.isArray(vendor.reviews) && vendor.reviews.length > 0 && (
                        <div className="vendor-reviews-block" style={{ marginBottom: '36px', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: 500, color: 'var(--text-dark)', margin: 0, fontFamily: 'var(--font-display)' }}>
                                    ביקורות ({vendor.reviews.length})
                                </h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {vendor.reviews.map((review, idx) => {
                                    if (!review?.text) return null;
                                    const stars = Math.max(0, Math.min(5, Math.round(Number(review.rating) || 5)));
                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                background: 'white',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '12px',
                                                padding: '14px 16px',
                                                textAlign: 'right',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                                                    {review.reviewer || 'לקוח'}
                                                </span>
                                                <div style={{ color: 'var(--primary-color)', display: 'flex', gap: '2px', fontSize: '0.75rem' }}>
                                                    {[...Array(stars)].map((_, i) => (
                                                        <i key={i} className="fas fa-star"></i>
                                                    ))}
                                                </div>
                                            </div>
                                            <p style={{ margin: 0, color: 'var(--text-light)', lineHeight: 1.65, fontSize: '0.95rem' }}>
                                                {review.text}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

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
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline vendor-contact-btn"
                        >
                            <i className="fab fa-whatsapp" style={{ marginLeft: 6 }}></i>
                            לדבר עם נציג פייסטה
                        </a>
                        
                        <button
                            type="button"
                            className="btn btn-outline vendor-fav-btn"
                            onClick={() => toggleFavorite(vendor.id)}
                            aria-pressed={liked}
                        >
                            <i className={liked ? 'fas fa-heart' : 'far fa-heart'} style={{ color: liked ? '#e11d48' : undefined, marginLeft: 6 }}></i>
                            {liked ? 'אהבתי' : 'שמירה במועדפים'}
                        </button>
                    </div>
                </motion.div>

                {/* Info from DB only — hide marketing filler when empty */}
                {(Array.isArray(vendor.highlights) && vendor.highlights.length > 0) || vendor.whyUs ? (
                <div className="vendor-info-grid">
                    {Array.isArray(vendor.highlights) && vendor.highlights.length > 0 && (
                    <div className="vendor-info-card">
                        <h4>שירותים מובילים</h4>
                        <ul>
                            {vendor.highlights.filter(Boolean).map((item, i) => (
                                <li key={i}><i className="fas fa-check"></i> {item}</li>
                            ))}
                        </ul>
                    </div>
                    )}
                    
                    {vendor.whyUs ? (
                    <div className="vendor-info-card">
                        <h4>למה אנחנו?</h4>
                        <p>{vendor.whyUs}</p>
                    </div>
                    ) : null}
                </div>
                ) : null}

                {/* Portfolio / Services section */}
                <div className="vendor-sections">
                    {/* Services & Prices (Conditional) */}
                    {((vendor.portfolio && vendor.portfolio.some(item => hasValidPrice(item.price))) || (vendor.products && vendor.products.some(p => hasValidPrice(p.price)))) && (
                        <div className="vendor-services-block">
                            <div className="vendor-section-head">
                                <h2>שירותים ומחירים</h2>
                                <div className="vendor-section-line"></div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                                {(vendor.products && vendor.products.length > 0
                                    ? vendor.products.filter((p) => hasValidPrice(p.price))
                                    : (vendor.portfolio || []).filter(item => hasValidPrice(item.price))
                                ).map((item, i) => {
                                    const itemPrice = formatPrice(item.price);
                                    const itemSavings = getSavings(item.originalPrice, item.price);
                                    const itemOrig = itemSavings != null ? formatPrice(item.originalPrice) : null;
                                    return (
                                    <div 
                                        key={i} 
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '14px',
                                            background: 'white', padding: '12px', borderRadius: '12px',
                                            border: '1px solid var(--border-color)'
                                        }}
                                    >
                                        <div style={{ width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                            {resolvePortfolioImage(item, '') ? (
                                                <img 
                                                    src={resolvePortfolioImage(item, '')} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    alt={item.title || item.name} 
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <VendorNoImage compact />
                                            )}
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
                                                    {itemOrig && (
                                                        <span style={{ fontSize: '0.8rem', color: '#999', textDecoration: 'line-through' }}>{itemOrig}</span>
                                                    )}
                                                    <span style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '1.05rem' }}>
                                                        {itemPrice}
                                                    </span>
                                                </div>
                                                {itemSavings != null && (
                                                    <span style={{ background: 'var(--off-white)', color: 'var(--text-dark)', fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                                        חיסכון ₪{itemSavings.toLocaleString('he-IL')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Pure Image Gallery — only real unique images; hide when empty */}
                    {(galleryImages.length > 0 || isAdmin) && (
                        <>
                            <div className="vendor-section-head gallery-head">
                                <h2>גלריית עבודות</h2>
                                <div className="vendor-section-actions">
                                    <EditChip href={`/admin/vendors/${vendor.id}`} label="ערוך גלריה / ספק" />
                                    <div className="vendor-section-line short"></div>
                                </div>
                            </div>

                            {isAdmin && galleryImages.length === 0 && (
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

                            {galleryImages.length > 0 && (
                                <div className="vendor-gallery-grid">
                                    {galleryImages.map((src, i) => (
                                        <motion.div 
                                            key={`${src}-${i}`}
                                            whileHover={{ scale: 1.02 }}
                                            className="vendor-gallery-item"
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setLightboxSrc(src)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setLightboxSrc(src); }}
                                            aria-label="הגדלת תמונה"
                                        >
                                            <img 
                                                src={src}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} 
                                                alt={`${vendor.name} — תמונה ${i + 1}`} 
                                                className="gallery-img"
                                                onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                                            />
                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', opacity: 0, transition: 'opacity 0.3s' }} className="gallery-overlay">
                                                <i className="fas fa-search-plus" style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2rem' }}></i>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {lightboxSrc ? (
                <div
                    className="vendor-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label="תצוגת תמונה"
                    onClick={() => setLightboxSrc('')}
                >
                    <button type="button" className="vendor-lightbox-close" aria-label="סגירה" onClick={() => setLightboxSrc('')}>
                        <i className="fas fa-times"></i>
                    </button>
                    <img src={lightboxSrc} alt="" onClick={(e) => e.stopPropagation()} />
                </div>
            ) : null}

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
                .vendor-hero-empty {
                    position: absolute;
                    inset: 0;
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
                }
                .vendor-lightbox {
                    position: fixed;
                    inset: 0;
                    z-index: 10000;
                    background: rgba(0, 0, 0, 0.88);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    cursor: zoom-out;
                }
                .vendor-lightbox img {
                    max-width: min(960px, 100%);
                    max-height: min(90vh, 100%);
                    object-fit: contain;
                    border-radius: 8px;
                    cursor: default;
                }
                .vendor-lightbox-close {
                    position: absolute;
                    top: 16px;
                    left: 16px;
                    width: 44px;
                    height: 44px;
                    border: none;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.15);
                    color: #fff;
                    font-size: 1.2rem;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
