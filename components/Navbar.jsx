'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => pathname === path ? 'active' : '';

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
                    <h1>Fiesta</h1>
                    <span className="tagline">הפקת אירועים בסטייל</span>
                </Link>

                <nav className="nav">
                    <ul>
                        <li><Link href="/" className={isActive('/')}>ראשי</Link></li>
                        <li>
                            <Link href="/design-invitation" className={isActive('/design-invitation')} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}>
                                <i className="fas fa-envelope-open-text" style={{ color: '#D4AF37', fontSize: '0.85rem' }}></i>
                                עיצוב הזמנות
                            </Link>
                        </li>
                        <li className="dropdown">
                            <span className="dropdown-trigger">ספקים <i className="fas fa-chevron-down"></i></span>
                            <div className="dropdown-menu mega-menu">
                                <div className="mega-col">
                                    <h4>מרכז האירוע</h4>
                                    <Link href="/category/dj" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-music"></i> DJ ומוזיקה</Link>
                                    <Link href="/category/photographer" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-camera-retro"></i> צילום אירועים</Link>
                                    <Link href="/category/alcohol" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-glass-cheers"></i> אלכוהול ובר</Link>
                                    <Link href="/category/catering" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-utensils"></i> קייטרינג</Link>
                                    <Link href="/category/venue" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-building"></i> אולמות וגנים</Link>
                                    <Link href="/category/design" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-palette"></i> עיצוב אירועים</Link>
                                </div>
                                <div className="mega-col">
                                    <h4>חתן וכלה</h4>
                                    <Link href="/category/dresses" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-person-dress"></i> שמלות כלה</Link>
                                    <Link href="/category/suits" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-user-tie"></i> חליפות חתן</Link>
                                    <Link href="/category/hair" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-scissors"></i> עיצוב שיער</Link>
                                    <Link href="/category/makeup" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-eye"></i> איפור</Link>
                                    <Link href="/category/rings" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-ring"></i> טבעות</Link>
                                    <Link href="/category/bride-shoes" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-shoe-prints"></i> נעלי כלה</Link>
                                    <Link href="/category/groom-shoes" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-shoe-prints"></i> נעלי חתן</Link>
                                    <Link href="/category/bride-escort" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-user-plus"></i> מדריכת כלות</Link>
                                    <Link href="/category/groom-escort" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-user-friends"></i> מדריך חתנים</Link>
                                </div>
                                <div className="mega-col">
                                    <h4>ארגון ולוגיסטיקה</h4>
                                    <Link href="/category/event-production" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-star"></i> הפקת אירועים</Link>
                                    <Link href="/category/event-managers" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-tasks"></i> מנהלי אירועים</Link>
                                    <Link href="/category/invitations" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-envelope-open-text"></i> הזמנות</Link>
                                    <Link href="/category/transportation" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-bus"></i> הסעות</Link>
                                    <Link href="/category/equipment-rental" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-chair"></i> השכרת ציוד</Link>
                                    <Link href="/category/car-decoration" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-car"></i> קישוט רכב</Link>
                                </div>
                                <div className="mega-col">
                                    <h4>טיפוח וחגיגות</h4>
                                    <Link href="/category/hotels" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-bed"></i> מלונות</Link>
                                    <Link href="/category/bachelor" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-glass-cheers"></i> מסיבות רווקים</Link>
                                    <Link href="/category/spa-travel" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-spa"></i> ספא ונסיעות</Link>
                                    <Link href="/category/getting-ready" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-house-user"></i> התארגנות</Link>
                                    <Link href="/category/tanning" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-sun"></i> שיזוף</Link>
                                    <Link href="/category/dietitians" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-apple-whole"></i> דיאטנים</Link>
                                    <Link href="/category/personal-training" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-dumbbell"></i> כושר אישי</Link>
                                    <Link href="/category/aliexpress-ideas" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-cart-shopping"></i> עלי אקספרס</Link>
                                </div>
                                <div className="mega-col">
                                    <h4>מסורת ותוכן</h4>
                                    <Link href="/category/rabbi" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-book-open"></i> רב לחופה</Link>
                                    <Link href="/category/cantors" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-microphone-alt"></i> פייטנים</Link>
                                    <Link href="/category/challa" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-bread-slice"></i> הפרשת חלה</Link>
                                    <Link href="/category/religious-bands" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-guitar"></i> להקות דתיות</Link>
                                    <Link href="/category/singers" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-microphone"></i> זמרים ולהקות</Link>
                                    <Link href="/category/attractions" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-wand-magic-sparkles"></i> אטרקציות</Link>
                                    <Link href="/category/souvenirs" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-gift"></i> מזכרות</Link>
                                    <Link href="/category/recording-studios" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-microphone-lines"></i> אולפנים</Link>
                                </div>
                            </div>
                        </li>
                        <li><Link href="/category/venue" className={isActive('/category/venue')}>אולמות</Link></li>
                        <li style={{ marginLeft: '15px' }}>
                            {!user ? (
                                <Link href="/login" style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    color: 'var(--text-dark)',
                                    textDecoration: 'none',
                                    fontWeight: '500'
                                }}>
                                    <i className="far fa-user" style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}></i>
                                    <span>אזור אישי</span>
                                </Link>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    {user.isAdmin && (
                                        <Link href="/admin" style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: 'linear-gradient(135deg, #D4AF37, #b8952a)',
                                            color: 'white',
                                            padding: '7px 16px',
                                            borderRadius: '20px',
                                            textDecoration: 'none',
                                            fontWeight: '700',
                                            fontSize: '0.85rem',
                                            boxShadow: '0 2px 8px rgba(212,175,55,0.4)'
                                        }}>
                                            <i className="fas fa-shield-halved"></i>
                                            ניהול
                                        </Link>
                                    )}
                                    <div onClick={logout} style={{ 
                                        cursor: 'pointer', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#e74c3c' 
                                    }}>
                                        <span>התנתק ({user.name})</span>
                                        <i className="fas fa-sign-out-alt"></i>
                                    </div>
                                </div>
                            )}
                        </li>
                    </ul>
                </nav>

                <div className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </div>
            </div>

            <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-header">
                    <div className="logo">
                        <h1>Fiesta</h1>
                    </div>
                    <div className="mobile-menu-btn" onClick={() => setMobileMenuOpen(false)}>
                        <i className="fas fa-times"></i>
                    </div>
                </div>

                <div className="mobile-main-links">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-home"></i> דף הבית</Link>
                    <Link href="/design-invitation" onClick={() => setMobileMenuOpen(false)} style={{ color: '#D4AF37', fontWeight: 'bold' }}>
                        <i className="fas fa-envelope-open-text"></i> עיצוב הזמנות
                    </Link>
                    {user?.isAdmin && (
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}><i className="fas fa-shield-halved"></i> ניהול</Link>
                    )}
                </div>

                <div className="mobile-category-title">הספקים שלנו:</div>
                <div className="mobile-nav-groups">
                    <div className="mobile-group">
                        <h5><i className="fas fa-star"></i> מרכז האירוע</h5>
                        <div className="mobile-links">
                            <Link href="/category/dj" onClick={() => setMobileMenuOpen(false)}>DJ</Link>
                            <Link href="/category/photographer" onClick={() => setMobileMenuOpen(false)}>צלמים</Link>
                            <Link href="/category/alcohol" onClick={() => setMobileMenuOpen(false)}>אלכוהול</Link>
                            <Link href="/category/catering" onClick={() => setMobileMenuOpen(false)}>קייטרינג</Link>
                            <Link href="/category/venue" onClick={() => setMobileMenuOpen(false)}>אולמות</Link>
                        </div>
                    </div>
                    <div className="mobile-group">
                        <h5><i className="fas fa-user-tie"></i> חתן וכלה</h5>
                        <div className="mobile-links">
                            <Link href="/category/dresses" onClick={() => setMobileMenuOpen(false)}>שמלות</Link>
                            <Link href="/category/suits" onClick={() => setMobileMenuOpen(false)}>חליפות</Link>
                            <Link href="/category/hair" onClick={() => setMobileMenuOpen(false)}>שיער</Link>
                            <Link href="/category/makeup" onClick={() => setMobileMenuOpen(false)}>איפור</Link>
                            <Link href="/category/rings" onClick={() => setMobileMenuOpen(false)}>טבעות</Link>
                        </div>
                    </div>
                    <div className="mobile-group">
                        <h5><i className="fas fa-calendar-check"></i> תכנון ולוגיסטיקה</h5>
                        <div className="mobile-links">
                            <Link href="/category/event-production" onClick={() => setMobileMenuOpen(false)}>הפקה</Link>
                            <Link href="/category/invitations" onClick={() => setMobileMenuOpen(false)}>הזמנות</Link>
                            <Link href="/category/transportation" onClick={() => setMobileMenuOpen(false)}>הסעות</Link>
                            <Link href="/category/equipment-rental" onClick={() => setMobileMenuOpen(false)}>ציוד</Link>
                        </div>
                    </div>
                </div>

                <div className="mobile-auth-footer">
                    {!user ? (
                        <div className="mobile-auth-btns">
                            <Link href="/login" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>התחבר</Link>
                            <Link href="/register" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>הירשם</Link>
                        </div>
                    ) : (
                        <div className="mobile-user-info">
                            <span>מחובר כ: <strong>{user.name}</strong></span>
                            <button className="btn btn-text" style={{ color: 'red' }} onClick={() => { logout(); setMobileMenuOpen(false); }}>התנתק</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
