'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PackagesCarousel() {
    const [packages, setPackages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [direction, setDirection] = useState(1); // 1 for next, -1 for prev

    const DEFAULT_PACKAGES = [
        {
            id: 'default-1',
            title: 'חבילת כלה פרימיום',
            tagline: 'Special Offer',
            description: 'צלם, מאפרת, ספק שמלות כלה, ועוד — הכל בחבילה אחת משתלמת שתחסוך לכם אלפי שקלים.',
            saving: 'חיסכון עד 30%',
            badge: '🔥 הנמכר ביותר',
            badgeColor: '#D4AF37',
            image: '/missing_photos/WhatsApp Image 2026-05-07 at 21.26.35.jpeg',
            active: true
        },
        {
            id: 'default-2',
            title: 'חבילת אירוע הכל כלול',
            tagline: 'Best Value',
            description: 'DJ מקצועי, קייטרינג מובחר, עיצוב אולם ותאורה — חווית אירוע מושלמת מהרגע הראשון ועד האחרון.',
            saving: 'חיסכון עד 25%',
            badge: '✨ בלעדי',
            badgeColor: '#4CAF50',
            image: '/missing_photos/WhatsApp Image 2026-05-07 at 21.26.27.jpeg',
            active: true
        },
        {
            id: 'default-3',
            title: 'חבילת צילום יוקרתית',
            tagline: 'Premium Package',
            description: 'צלם וידאו + צלם סטילס, אלבום מפואר, וסרטון וידאו מקצועי לזיכרון שיישמר לנצח.',
            saving: 'חיסכון עד 20%',
            badge: '📷 פופולרי',
            badgeColor: '#9C27B0',
            image: '/missing_photos/WhatsApp Image 2026-05-07 at 22.05.38.jpeg',
            active: true
        },
        {
            id: 'default-bonus',
            title: 'מתנה בלעדית לסוגרים דרך פייסטה',
            tagline: 'Exclusive Bonus',
            description: 'סוגרים 2 ספקים ומעלה דרך האתר ומקבלים אישורי הגעה וסידור שולחנות בחינם לגמרי!',
            saving: 'בשווי ₪1,500',
            badge: '🎁 מתנה',
            badgeColor: '#2E7D32',
            image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
            active: true
        }
    ];

    useEffect(() => {
        fetch('/api/packages')
            .then(r => r.json())
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    setPackages(DEFAULT_PACKAGES);
                    return;
                }
                const active = data.filter(p => p.active);
                setPackages(active.length > 0 ? active : DEFAULT_PACKAGES);
            })
            .catch(() => setPackages(DEFAULT_PACKAGES));
    }, []);

    // Auto-advance logic
    useEffect(() => {
        if (packages.length <= 1 || isPaused) return;
        
        const interval = setInterval(() => {
            // Auto-play should naturally slide to the next item visually on the left
            setDirection(-1);
            setCurrentIndex((prev) => (prev + 1) % packages.length);
        }, 3500); // Faster auto-play

        return () => clearInterval(interval);
    }, [packages.length, isPaused]);

    if (!packages.length) return null;

    // In RTL, items are visually mapped [2] [1] [0] from left to right.
    // dir = 1 means sliding from RIGHT to LEFT.
    // dir = -1 means sliding from LEFT to RIGHT.
    const slideFromRight = () => {
        setDirection(1);
        // Going to an index that is visually to the right means decreasing the index
        setCurrentIndex((prev) => (prev - 1 + packages.length) % packages.length);
    };

    const slideFromLeft = () => {
        setDirection(-1);
        // Going to an index that is visually to the left means increasing the index
        setCurrentIndex((prev) => (prev + 1) % packages.length);
    };

    const currentPackage = packages[currentIndex];

    // Premium Variants for a more fluid feel
    const slideVariants = {
        enter: (dir) => ({
            x: dir > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 1.1
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { 
                x: { type: "spring", stiffness: 220, damping: 24 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.5, ease: "easeOut" }
            }
        },
        exit: (dir) => ({
            x: dir > 0 ? '-100%' : '100%',
            opacity: 0,
            scale: 0.9,
            transition: { 
                x: { type: "spring", stiffness: 220, damping: 24 },
                opacity: { duration: 0.3 }
            }
        })
    };

    return (
        <section className="packages-carousel-section" style={{
            padding: '60px 0 0 0',
            background: 'var(--white)',
            position: 'relative'
        }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ 
                        fontSize: 'clamp(2rem, 5vw, 3rem)', 
                        fontFamily: 'var(--font-display)', 
                        fontWeight: 800, 
                        color: '#1a1a1a', 
                        margin: '0 0 10px 0'
                    }}>
                        חבילות <span style={{ color: 'var(--primary-color)' }}>פרימיום</span>
                    </h2>
                    <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>
                        הורדנו את המחירים עבורכם - חבילות משתלמות במיוחד בבלעדיות ל-Fiesta
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
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ x: { type: "spring", stiffness: 220, damping: 24 }, opacity: { duration: 0.3 } }}
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
                            
                            {/* Glass Content Card Overlay (Subtle) */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'radial-gradient(circle at 80% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 70%)',
                                pointerEvents: 'none'
                            }}></div>
                            
                            {/* Premium Gold Badge */}
                            {currentPackage.badge && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        position: 'absolute', top: '30px', left: '5vw',
                                        background: currentPackage.badgeColor ? `linear-gradient(135deg, ${currentPackage.badgeColor} 0%, rgba(0,0,0,0.8) 100%)` : 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                                        color: '#fff',
                                        padding: '8px 25px', borderRadius: '50px', fontSize: '0.85rem', 
                                        fontWeight: 800, letterSpacing: '1px',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        zIndex: 3
                                    }}>
                                    {currentPackage.badge}
                                </motion.div>
                            )}

                            {/* Content Overlaid */}
                            <div className="featured-content" style={{ 
                                position: 'absolute',
                                bottom: 0, right: 0, left: 0,
                                padding: '30px 5vw', // Responsive padding for edge-to-edge
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'flex-end',
                                textAlign: 'right',
                                zIndex: 2
                            }}>
                                <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                                    <span style={{ 
                                        color: 'var(--primary-color)', 
                                        fontSize: '0.8rem', 
                                        fontWeight: 700, 
                                        textTransform: 'uppercase',
                                        letterSpacing: '3px',
                                        marginBottom: '5px',
                                        display: 'block'
                                    }}>
                                    {currentPackage.tagline || 'Special Offer'}
                                </span>
                                
                                <h3 style={{ 
                                    fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', 
                                    color: '#ffffff', 
                                    margin: '0 0 10px 0',
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 800,
                                    lineHeight: 1.1,
                                    textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                }}>
                                    {currentPackage.title}
                                </h3>
                                
                                <p style={{ 
                                    color: 'rgba(255,255,255,0.85)', 
                                    fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)', 
                                    lineHeight: 1.5,
                                    marginBottom: '25px',
                                    maxWidth: '700px',
                                    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                                }}>
                                    {currentPackage.description}
                                </p>
                                
                                <div className="action-row" style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: '40px'
                                }}>
                                    <motion.a
                                        whileHover={{ scale: 1.05, boxShadow: '0 15px 35px rgba(212, 175, 55, 0.5)' }}
                                        whileTap={{ scale: 0.95 }}
                                        href={`https://wa.me/972535378985?text=${encodeURIComponent(`היי! ראיתי את ${currentPackage.title} באתר Fiesta ורוצה לשמוע פרטים`)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="btn btn-primary luxury-btn"
                                        style={{ 
                                            padding: '16px 45px', 
                                            fontSize: '1.1rem',
                                            background: 'linear-gradient(135deg, var(--primary-color) 0%, #B8860B 100%)',
                                            color: '#111',
                                            border: 'none',
                                            borderRadius: '100px',
                                            fontWeight: 900,
                                            boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}
                                    >
                                        לכל הפרטים
                                    </motion.a>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', borderRight: '2px solid var(--primary-color)', paddingRight: '20px' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>חיסכון צפוי</span>
                                        <span style={{ fontWeight: 900, color: '#ffffff', fontSize: '1.6rem', textShadow: '0 2px 15px rgba(0,0,0,0.5)', fontFamily: 'var(--font-display)' }}>
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
                            <button onClick={slideFromLeft} className="nav-arrow-side left-arrow" aria-label="Next slide">
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            
                            {/* Right Arrow */}
                            <button onClick={slideFromRight} className="nav-arrow-side right-arrow" aria-label="Previous slide">
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
                                        width: idx === currentIndex ? '40px' : '12px',
                                        height: '6px',
                                        borderRadius: '10px',
                                        background: idx === currentIndex 
                                            ? 'linear-gradient(to right, #ffffff, var(--primary-color))' 
                                            : 'rgba(255,255,255,0.3)',
                                        border: 'none',
                                        boxShadow: idx === currentIndex ? '0 0 15px rgba(212, 175, 55, 0.6)' : 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
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
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    color: white;
                    font-size: 1.4rem;
                    z-index: 10;
                    backdrop-filter: blur(12px);
                }
                .left-arrow { left: 3vw; }
                .right-arrow { right: 3vw; }
                
                .nav-arrow-side:hover {
                    background: var(--primary-color);
                    border-color: var(--primary-color);
                    transform: translateY(-50%) scale(1.1);
                    box-shadow: 0 5px 20px rgba(212, 175, 55, 0.4);
                }
                
                .luxury-btn:hover {
                    transform: scale(1.05);
                    background: white !important;
                    color: var(--primary-color) !important;
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
                        height: 360px !important;
                    }
                    .featured-content {
                        padding: 10px 5vw 20px !important;
                    }
                    .action-row .luxury-btn {
                        padding: 10px 25px !important;
                        font-size: 0.9rem !important;
                        width: 100%;
                        text-align: center;
                    }
                    .featured-slide img {
                        filter: brightness(0.8) !important;
                    }
                }
            `}</style>
        </section>
    );
}
