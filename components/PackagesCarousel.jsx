'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function PackagesCarousel() {
    const [packages, setPackages] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef(null);
    const intervalRef = useRef(null);

    const [displayPackages, setDisplayPackages] = useState([]);

    useEffect(() => {
        fetch('/api/packages')
            .then(r => r.json())
            .then(data => {
                const active = data.filter(p => p.active);
                setPackages(active);
                if (active.length > 0) {
                    // Duplicate 3 times for infinite scroll illusion
                    setDisplayPackages([...active, ...active, ...active]);
                }
            })
            .catch(() => setPackages([]));
    }, []);

    // Auto-scroll logic
    useEffect(() => {
        if (packages.length <= 1) return;
        if (!isPaused) {
            intervalRef.current = setInterval(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                }
            }, 3000);
        }
        return () => clearInterval(intervalRef.current);
    }, [packages.length, isPaused]);

    // Seamless Infinite Loop Logic
    useEffect(() => {
        const scrollNode = scrollRef.current;
        if (!scrollNode || packages.length <= 1) return;

        const handleScroll = () => {
            const { scrollLeft, scrollWidth } = scrollNode;
            const blockWidth = scrollWidth / 3;

            // In RTL, scrollLeft is usually negative.
            // When we scroll deep enough (past the 2nd block), we silently jump back to the 1st block.
            // If we scroll back to the start (0), we silently jump to the 2nd block.
            if (Math.abs(scrollLeft) >= blockWidth * 2 - 20) {
                // Jump back by exactly one block width
                scrollNode.scrollLeft = scrollLeft + blockWidth;
            } else if (Math.abs(scrollLeft) <= 10) {
                // Jump forward to the middle block
                scrollNode.scrollLeft = scrollLeft - blockWidth;
            }
        };

        scrollNode.addEventListener('scroll', handleScroll);
        // Initialize position to the middle block so user can scroll left or right infinitely
        // Give the DOM a tiny bit of time to render widths
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollLeft = -(scrollRef.current.scrollWidth / 3);
            }
        }, 100);

        return () => scrollNode.removeEventListener('scroll', handleScroll);
    }, [packages.length]);

    if (!packages.length) return null;

    const scroll = (offset) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        // The container's onMouseEnter already handles pausing when the user interacts with the buttons.
        // We removed the manual setIsPaused timeout here to prevent state conflicts.
    };

    return (
        <section style={{
            padding: '20px 0',
            background: '#ffffff',
            position: 'relative'
        }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ marginBottom: '15px', padding: '0 10px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 2px 0' }}>
                        חבילות משתלמות
                    </h2>
                    <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>
                        הדרך החכמה והחסכונית ביותר לסגור אירוע
                    </p>
                </div>

                {/* Netflix style wrapper with arrows */}
                <div style={{ position: 'relative' }} 
                     onMouseEnter={() => setIsPaused(true)}
                     onMouseLeave={() => setIsPaused(false)}>
                     
                    {packages.length > 1 && (
                        <button className="carousel-nav" onClick={() => scroll(320)} style={{
                            position: 'absolute', right: '-15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
                            width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #eee',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333'
                        }}>‹</button>
                    )}

                    <div ref={scrollRef} className="hide-scrollbar" style={{
                        display: 'flex',
                        gap: '15px',
                        overflowX: 'auto',
                        scrollBehavior: 'smooth',
                        scrollSnapType: 'x mandatory',
                        padding: '5px 5px 15px 5px',
                        margin: '0 -5px'
                    }}>
                    {displayPackages.map((p, idx) => (
                        <div key={`${p.id}-${idx}`} style={{
                            flex: '0 0 260px',
                            scrollSnapAlign: 'start',
                            display: 'flex',
                            flexDirection: 'column',
                            background: '#fff',
                            borderRadius: '12px',
                            border: '1px solid #f0f0f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            overflow: 'hidden',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.06)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                        >
                            {/* Image */}
                            <div style={{ height: '110px', position: 'relative', background: '#f8f8f8' }}>
                                {p.image && <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                {p.badge && (
                                    <div style={{
                                        position: 'absolute', top: '8px', right: '8px',
                                        background: p.badgeColor || '#1a1a1a', color: 'white',
                                        padding: '3px 10px', borderRadius: '15px', fontSize: '0.7rem', fontWeight: 600
                                    }}>
                                        {p.badge}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ padding: '12px 15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <div style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>{p.tagline}</div>
                                <h3 style={{ fontSize: '1rem', color: '#1a1a1a', fontWeight: 800, margin: '0 0 6px 0', lineHeight: 1.2 }}>
                                    {p.title}
                                </h3>
                                <p style={{ color: '#666', fontSize: '0.8rem', margin: '0 0 10px 0', lineHeight: 1.4, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {p.description}
                                </p>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f5f5f5' }}>
                                    <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.85rem' }}>
                                        {p.saving ? p.saving : 'הצעה משתלמת'}
                                    </div>
                                    <a
                                        href={`https://wa.me/972535378985?text=${encodeURIComponent(`היי! ראיתי את ${p.title} באתר Fiesta ורוצה לשמוע פרטים`)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{
                                            background: '#f8f8f8', color: '#1a1a1a', padding: '6px 12px', borderRadius: '6px',
                                            fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f8f8f8'; e.currentTarget.style.color = '#1a1a1a'; }}
                                    >
                                        לפרטים
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>

                    {packages.length > 1 && (
                        <button className="carousel-nav" onClick={() => scroll(-320)} style={{
                            position: 'absolute', left: '-15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
                            width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #eee',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333'
                        }}>›</button>
                    )}
                </div>
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @media (max-width: 768px) {
                    .carousel-nav { display: none !important; }
                }
            `}</style>
        </section>
    );
}
