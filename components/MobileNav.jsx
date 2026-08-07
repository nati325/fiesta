'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import SearchModal from './SearchModal';

const HIDDEN_PATHS = ['/design-invitation', '/rsvp', '/login', '/register'];

export default function MobileNav() {
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);

    if (pathname?.startsWith('/admin')) return null;
    if (HIDDEN_PATHS.some((p) => pathname === p || pathname?.startsWith(`${p}/`))) return null;

    const navItems = [
        { id: 'home', label: 'בית', icon: 'fas fa-home', path: '/' },
        { id: 'search', label: 'חיפוש', icon: 'fas fa-search', action: 'search' },
        { id: 'favorites', label: 'מועדפים', icon: 'fas fa-heart', path: '/profile' },
        { id: 'planner', label: 'מתכנן', icon: 'fas fa-calculator', path: '/budget-planner' },
    ];

    const isItemActive = (item) => {
        if (item.action === 'search') {
            return searchOpen || pathname?.startsWith('/search') || pathname?.startsWith('/category');
        }
        if (item.path === '/') return pathname === '/';
        return pathname === item.path || pathname?.startsWith(`${item.path}/`);
    };

    return (
        <>
            {/* Hide the pill while SearchModal is open so it never covers modal content */}
            {!searchOpen && (
                <nav className="mobile-nav-wrapper" aria-label="ניווט תחתון">
                    <div className="mobile-nav-container">
                        {navItems.map((item) => {
                            const isActive = isItemActive(item);

                            if (item.action === 'search') {
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => setSearchOpen(true)}
                                        aria-label={item.label}
                                    >
                                        <i className={item.icon} aria-hidden />
                                        {isActive && (
                                            <motion.div layoutId="mobile-nav-indicator" className="nav-indicator" />
                                        )}
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={item.id}
                                    href={item.path}
                                    className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                                    aria-label={item.label}
                                >
                                    <i className={item.icon} aria-hidden />
                                    {isActive && (
                                        <motion.div layoutId="mobile-nav-indicator" className="nav-indicator" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}

            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

            <style jsx>{`
                .mobile-nav-wrapper {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 50%;
                    transform: translateX(-50%);
                    bottom: calc(10px + env(safe-area-inset-bottom, 0px));
                    width: calc(100% - 24px);
                    max-width: 420px;
                    background: rgba(255, 255, 255, 0.94);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    border-radius: 18px;
                    padding: 4px 6px;
                }

                .mobile-nav-container {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                }

                .mobile-nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #888;
                    text-decoration: none;
                    position: relative;
                    padding: 10px 6px;
                    min-height: 44px;
                    min-width: 44px;
                    transition: color 0.2s, background 0.2s;
                    flex: 1;
                    background: none;
                    border: none;
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                    border-radius: 14px;
                }

                .mobile-nav-item i {
                    font-size: 1.2rem;
                    line-height: 1;
                }

                .mobile-nav-item.active {
                    color: var(--primary-color);
                    background: rgba(143, 115, 68, 0.08);
                }

                .nav-indicator {
                    display: none;
                }

                @media (max-width: 768px) {
                    .mobile-nav-wrapper {
                        display: block;
                    }
                }
            `}</style>
        </>
    );
}
