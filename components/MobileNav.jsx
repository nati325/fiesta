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
        { id: 'favorites', label: 'מועדפים', icon: 'fas fa-heart', path: '/favorites' },
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
                                    aria-label="חיפוש ספקים"
                                >
                                    <i className={item.icon}></i>
                                    <span>{item.label}</span>
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
                            >
                                <i className={item.icon}></i>
                                <span>{item.label}</span>
                                {isActive && (
                                    <motion.div layoutId="mobile-nav-indicator" className="nav-indicator" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

            <style jsx>{`
                .mobile-nav-wrapper {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(255, 255, 255, 0.96);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06);
                    border-top: 1px solid rgba(0, 0, 0, 0.06);
                    padding: 8px 8px calc(8px + env(safe-area-inset-bottom, 0px));
                    z-index: 1000;
                }

                .mobile-nav-container {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .mobile-nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 3px;
                    color: #888;
                    text-decoration: none;
                    font-size: 0.7rem;
                    font-weight: 600;
                    font-family: var(--font-main);
                    position: relative;
                    padding: 6px 10px;
                    min-height: 44px;
                    min-width: 56px;
                    transition: color 0.2s;
                    flex: 1;
                    background: none;
                    border: none;
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                }

                .mobile-nav-item i {
                    font-size: 1.15rem;
                    line-height: 1;
                }

                .mobile-nav-item.active {
                    color: var(--primary-color);
                }

                .nav-indicator {
                    position: absolute;
                    top: 0;
                    width: 22px;
                    height: 3px;
                    background: var(--primary-color);
                    border-radius: 0 0 4px 4px;
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
