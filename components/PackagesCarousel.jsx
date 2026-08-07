'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getVendorDisplayPrice, getPackages } from '@/lib/vendorPrice';
import { getCategoryLabel } from '@/lib/vendorCategories';
import { resolveVendorImage } from '@/lib/vendorImage';

/** Build carousel slides from real vendors that have a photo. */
function buildFeaturedVendors(vendors) {
    return (vendors || [])
        .filter((v) => v?.id && v?.name && resolveVendorImage(v.image, ''))
        .map((v) => {
            const priceInfo = getVendorDisplayPrice(v);
            const packages = getPackages(v);
            const topPackage = packages[0];
            return {
                id: v.id,
                name: v.name,
                type: v.type,
                typeLabel: getCategoryLabel(v.type),
                image: resolveVendorImage(v.image, ''),
                region: v.region || '',
                priceLabel: priceInfo.display || null,
                packageName: topPackage?.name || null,
                description: (v.description || '').trim().slice(0, 140),
            };
        })
        .slice(0, 10);
}

export default function PackagesCarousel() {
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        fetch('/api/vendors')
            .then((r) => r.json())
            .then((data) => {
                setSlides(buildFeaturedVendors(Array.isArray(data) ? data : []));
            })
            .catch(() => setSlides([]));
    }, []);

    useEffect(() => {
        if (slides.length <= 1 || isPaused) return;
        const interval = setInterval(() => {
            setDirection(-1);
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [slides.length, isPaused]);

    const current = slides[currentIndex];

    const easeSoft = [0.22, 1, 0.36, 1];
    const slideVariants = useMemo(
        () => ({
            enter: (dir) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (dir) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
        }),
        []
    );
    const slideTransition = {
        x: { duration: 0.85, ease: easeSoft },
        opacity: { duration: 0.75, ease: 'easeInOut' },
    };

    if (!slides.length || !current) return null;

    const slideFromRight = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const slideFromLeft = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const waText = encodeURIComponent(
        `היי! ראיתי את ${current.name} באתר Fiesta ורוצה לשמוע פרטים`
    );

    return (
        <section
            className="packages-carousel-section"
            style={{
                padding: '60px 0 0 0',
                background: 'var(--white)',
                position: 'relative',
            }}
        >
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <h2
                        style={{
                            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 500,
                            color: 'var(--text-dark)',
                            margin: '0 0 8px 0',
                        }}
                    >
                        ספקים מומלצים
                    </h2>
                    <p style={{ color: 'var(--text-light)', fontSize: '1rem', margin: 0 }}>
                        מהספקים האמיתיים שבמערכת Fiesta
                    </p>
                </div>
            </div>

            <div
                className="featured-carousel-container"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{
                    position: 'relative',
                    width: '100%',
                    overflow: 'hidden',
                    minHeight: '420px',
                    height: 'auto',
                }}
            >
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={current.id}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={slideTransition}
                        style={{
                            width: '100%',
                            minHeight: '420px',
                            height: '100%',
                            position: 'relative',
                        }}
                        className="featured-slide"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={current.image}
                            alt={current.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                minHeight: '420px',
                                objectFit: 'cover',
                                position: 'absolute',
                                inset: 0,
                                filter: 'brightness(0.95)',
                            }}
                        />

                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background:
                                    'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 100%)',
                            }}
                        />

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                            style={{
                                position: 'absolute',
                                top: '28px',
                                left: '5vw',
                                background: 'rgba(0,0,0,0.55)',
                                color: '#fff',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                border: '1px solid rgba(255,255,255,0.15)',
                                zIndex: 3,
                            }}
                        >
                            {current.typeLabel}
                        </motion.div>

                        <div
                            className="featured-content"
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                left: 0,
                                padding: '28px 5vw',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                textAlign: 'right',
                                zIndex: 2,
                            }}
                        >
                            <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                                <span
                                    style={{
                                        color: 'rgba(255,255,255,0.7)',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                        marginBottom: '6px',
                                        display: current.region || current.packageName ? 'block' : 'none',
                                    }}
                                >
                                    {current.region || current.packageName || ''}
                                </span>

                                <h3
                                    style={{
                                        fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)',
                                        color: '#ffffff',
                                        margin: '0 0 10px 0',
                                        fontFamily: 'var(--font-display)',
                                        fontWeight: 500,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {current.name}
                                </h3>

                                {current.description ? (
                                    <p
                                        style={{
                                            color: 'rgba(255,255,255,0.8)',
                                            fontSize: 'clamp(0.92rem, 1.2vw, 1.05rem)',
                                            lineHeight: 1.5,
                                            marginBottom: '22px',
                                            maxWidth: '640px',
                                        }}
                                    >
                                        {current.description}
                                        {current.description.length >= 140 ? '…' : ''}
                                    </p>
                                ) : (
                                    <div style={{ marginBottom: '22px' }} />
                                )}

                                <div
                                    className="action-row"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '28px',
                                    }}
                                >
                                    <Link
                                        href={`/vendor/${current.id}`}
                                        className="btn luxury-btn"
                                        style={{
                                            padding: '14px 28px',
                                            fontSize: '0.95rem',
                                            background: '#fff',
                                            color: '#111',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            display: 'inline-block',
                                        }}
                                    >
                                        לדף הספק
                                    </Link>

                                    <a
                                        href={`https://wa.me/972535378985?text=${waText}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            padding: '14px 20px',
                                            fontSize: '0.9rem',
                                            background: 'transparent',
                                            color: '#fff',
                                            border: '1px solid rgba(255,255,255,0.35)',
                                            borderRadius: '6px',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            display: 'inline-block',
                                        }}
                                    >
                                        ווטסאפ
                                    </a>

                                    {current.priceLabel && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRight: '1px solid rgba(255,255,255,0.25)',
                                                paddingRight: '18px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: 'rgba(255,255,255,0.55)',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                מחיר
                                            </span>
                                            <span
                                                style={{
                                                    fontWeight: 600,
                                                    color: '#ffffff',
                                                    fontSize: '1.25rem',
                                                    fontFamily: 'var(--font-display)',
                                                }}
                                            >
                                                {current.priceLabel}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {slides.length > 1 && (
                    <>
                        <button onClick={slideFromLeft} className="nav-arrow-side left-arrow" aria-label="שקופית הבאה">
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <button onClick={slideFromRight} className="nav-arrow-side right-arrow" aria-label="שקופית קודמת">
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </>
                )}

                {slides.length > 1 && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '8px',
                            zIndex: 10,
                        }}
                    >
                        {slides.map((s, idx) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                    setDirection(idx > currentIndex ? -1 : 1);
                                    setCurrentIndex(idx);
                                }}
                                style={{
                                    width: idx === currentIndex ? '28px' : '12px',
                                    height: '12px',
                                    minWidth: '44px',
                                    minHeight: '44px',
                                    borderRadius: '6px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '16px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                aria-label={`ספק ${idx + 1}`}
                            >
                                <span
                                    style={{
                                        display: 'block',
                                        width: idx === currentIndex ? '28px' : '10px',
                                        height: '4px',
                                        borderRadius: '2px',
                                        background:
                                            idx === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.45)',
                                        transition: 'width 0.3s ease, background 0.3s ease',
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .nav-arrow-side {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.35);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                    color: white;
                    font-size: 1.1rem;
                    z-index: 10;
                }
                .left-arrow {
                    left: 3vw;
                }
                .right-arrow {
                    right: 3vw;
                }
                .nav-arrow-side:hover {
                    background: rgba(0, 0, 0, 0.6);
                }
                .luxury-btn:hover {
                    background: var(--primary-color) !important;
                    color: #fff !important;
                }
                @media (max-width: 900px) {
                    .featured-carousel-container {
                        min-height: 380px !important;
                    }
                    .featured-slide,
                    .featured-slide img {
                        min-height: 380px !important;
                    }
                    .featured-content {
                        padding: 15px 5vw 48px !important;
                    }
                    .action-row {
                        flex-direction: column;
                        align-items: stretch !important;
                        gap: 12px !important;
                        width: 100%;
                    }
                    .action-row a {
                        width: 100%;
                        text-align: center;
                        min-height: 48px;
                        box-sizing: border-box;
                        display: inline-flex !important;
                        align-items: center;
                        justify-content: center;
                    }
                    .nav-arrow-side {
                        display: none !important;
                    }
                }
                @media (max-width: 600px) {
                    .featured-carousel-container {
                        min-height: 360px !important;
                    }
                    .featured-slide,
                    .featured-slide img {
                        min-height: 360px !important;
                    }
                    .featured-content {
                        padding: 10px 5vw 56px !important;
                    }
                    .action-row .luxury-btn {
                        padding: 12px 20px !important;
                        font-size: 0.9rem !important;
                        width: 100%;
                        text-align: center;
                        min-height: 48px;
                    }
                    .featured-slide img {
                        filter: brightness(0.8) !important;
                    }
                }
            `}</style>
        </section>
    );
}
