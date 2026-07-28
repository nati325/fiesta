'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PackagesCarousel() {
    const [packages, setPackages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [direction, setDirection] = useState(1); // 1 for next, -1 for prev

    useEffect(() => {
        fetch('/api/packages')
            .then(r => r.json())
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    setPackages([]);
                    return;
                }
                const active = data.filter(p => p.active !== false);
                setPackages(active);
            })
            .catch(() => setPackages([]));
    }, []);

    // Auto-advance — slower, calmer pace
    useEffect(() => {
        if (packages.length <= 1 || isPaused) return;
        
        const interval = setInterval(() => {
            setDirection(-1);
            setCurrentIndex((prev) => (prev + 1) % packages.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [packages.length, isPaused]);

    if (!packages.length) return null;

    const slideFromRight = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev - 1 + packages.length) % packages.length);
    };

    const slideFromLeft = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev + 1) % packages.length);
    };

    const currentPackage = packages[currentIndex];

    // Soft crossfade + gentle drift (no harsh spring / scale)
    const easeSoft = [0.22, 1, 0.36, 1];
    const slideVariants = {
        enter: (dir) => ({
            x: dir > 0 ? 48 : -48,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir) => ({
            x: dir > 0 ? -48 : 48,
            opacity: 0,
        }),
    };
    const slideTransition = {
        x: { duration: 0.85, ease: easeSoft },
        opacity: { duration: 0.75, ease: 'easeInOut' },
    };

    return (
        <section className="packages-carousel-section" style={{
            padding: '60px 0 0 0',
            background: 'var(--white)',
            position: 'relative'
        }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <h2 style={{ 
                        fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', 
                        fontFamily: 'var(--font-display)', 
                        fontWeight: 500, 
                        color: 'var(--text-dark)', 
                        margin: '0 0 8px 0'
                    }}>
                        חבילות מומלצות
                    </h2>
                    <p style={{ color: 'var(--text-light)', fontSize: '1rem', margin: 0 }}>
                        מחירים בלעדיים ללקוחות Fiesta
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
                    height: '500px' // Increased height for better prominence
                }}
            >
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={slideTransition}
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                inset: 0
                            }}
                            className="featured-slide"
                        >
                            {/* Full Background Image */}
                            {currentPackage.image && (
                                <img 
                                    src={currentPackage.image} 
                                    alt={currentPackage.title} 
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover', 
                                        position: 'absolute', 
                                        inset: 0,
                                        filter: 'brightness(0.95)'
                                    }} 
                                />
                            )}
                            
                            {/* Enhanced dark gradient for text readability */}
                            <div style={{ 
                                position: 'absolute', inset: 0, 
                                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 100%)'
                            }}></div>
                            
                            {/* Badge */}
                            {currentPackage.badge && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                                    style={{
                                        position: 'absolute', top: '28px', left: '5vw',
                                        background: 'rgba(0,0,0,0.55)',
                                        color: '#fff',
                                        padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', 
                                        fontWeight: 600,
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        zIndex: 3
                                    }}>
                                    {currentPackage.badge}
                                </motion.div>
                            )}

                            {/* Content Overlaid */}
                            <div className="featured-content" style={{ 
                                position: 'absolute',
                                bottom: 0, right: 0, left: 0,
                                padding: '28px 5vw',
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'flex-end',
                                textAlign: 'right',
                                zIndex: 2
                            }}>
                                <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                                    <span style={{ 
                                        color: 'rgba(255,255,255,0.7)', 
                                        fontSize: '0.8rem', 
                                        fontWeight: 500, 
                                        marginBottom: '6px',
                                        display: 'block'
                                    }}>
                                    {currentPackage.tagline || 'חבילה'}
                                </span>
                                
                                <h3 style={{ 
                                    fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', 
                                    color: '#ffffff', 
                                    margin: '0 0 10px 0',
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 500,
                                    lineHeight: 1.2,
                                }}>
                                    {currentPackage.title}
                                </h3>
                                
                                <p style={{ 
                                    color: 'rgba(255,255,255,0.8)', 
                                    fontSize: 'clamp(0.92rem, 1.2vw, 1.05rem)', 
                                    lineHeight: 1.5,
                                    marginBottom: '22px',
                                    maxWidth: '640px',
                                }}>
                                    {currentPackage.description}
                                </p>
                                
                                <div className="action-row" style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: '28px'
                                }}>
                                    <a
                                        href={`https://wa.me/972535378985?text=${encodeURIComponent(`היי! ראיתי את ${currentPackage.title} באתר Fiesta ורוצה לשמוע פרטים`)}`}
                                        target="_blank" rel="noopener noreferrer"
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
                                        לכל הפרטים
                                    </a>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.25)', paddingRight: '18px' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>חיסכון</span>
                                        <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
                                            {currentPackage.saving || 'מחיר בלעדי'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    </AnimatePresence>

                    {/* Navigation Controls */}

                    {packages.length > 1 && (
                        <>
                            {/* Left Arrow */}
                            <button onClick={slideFromLeft} className="nav-arrow-side left-arrow" aria-label="שקופית הבאה">
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            
                            {/* Right Arrow */}
                            <button onClick={slideFromRight} className="nav-arrow-side right-arrow" aria-label="שקופית קודמת">
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </>
                    )}
                    
                    {/* Dots */}
                    {packages.length > 1 && (
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '8px',
                            zIndex: 10
                        }}>
                            {packages.map((_, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => {
                                        // Simple deterministic direction:
                                        // In RTL, idx 0 is Right, idx 2 is Left.
                                        // If we click idx 2 (Left), and we are at idx 1:
                                        // idx > currentIndex => setDirection(-1) => Enters from -1000 (Left)
                                        // If we click idx 0 (Right), and we are at idx 1:
                                        // idx < currentIndex => setDirection(1) => Enters from 1000 (Right)
                                        setDirection(idx > currentIndex ? -1 : 1);
                                        setCurrentIndex(idx);
                                    }}
                                    style={{
                                        width: idx === currentIndex ? '28px' : '8px',
                                        height: '4px',
                                        borderRadius: '2px',
                                        background: idx === currentIndex 
                                            ? '#ffffff' 
                                            : 'rgba(255,255,255,0.35)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'width 0.3s ease, background 0.3s ease',
                                        padding: 0,
                                    }}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
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
                .left-arrow { left: 3vw; }
                .right-arrow { right: 3vw; }
                
                .nav-arrow-side:hover {
                    background: rgba(0, 0, 0, 0.6);
                }
                
                .luxury-btn:hover {
                    background: var(--primary-color) !important;
                    color: #fff !important;
                }
                
                @media (max-width: 900px) {
                    .featured-carousel-container {
                        height: 400px !important;
                    }
                    .featured-content {
                        padding: 15px 5vw 25px !important;
                    }
                    .action-row {
                        flex-direction: column;
                        align-items: flex-end;
                        gap: 12px !important;
                    }
                    .nav-arrow-side {
                        display: none !important;
                    }
                    h3 { font-size: 1.8rem !important; }
                    p { font-size: 0.9rem !important; margin-bottom: 15px !important; }
                }
                @media (max-width: 600px) {
                    .featured-carousel-container {
                        height: 320px !important;
                    }
                    .featured-content {
                        padding: 10px 5vw 20px !important;
                    }
                    .action-row .luxury-btn {
                        padding: 12px 20px !important;
                        font-size: 0.9rem !important;
                        width: 100%;
                        text-align: center;
                        min-height: 44px;
                    }
                    .featured-slide img {
                        filter: brightness(0.8) !important;
                    }
                }
            `}</style>
        </section>
    );
}
