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
            {/* Hide the bar while SearchModal is open so it never covers modal content */}
            {!searchOpen && (
                <nav className="mobile-nav-wrapper" aria-label="ניווט תחתון">
                    <div className="mobile-nav-container">
                        {navItems.map((item) => {
                            const isActive = isItemActive(item);
                            const className = `mobile-nav-item${isActive ? ' active' : ''}`;

                            const inner = (
                                <>
                                    {isActive && (
                                        <motion.span
                                            layoutId="mobile-nav-pill"
                                            className="nav-pill"
                                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                                        />
                                    )}
                                    <i className={item.icon} aria-hidden />
                                </>
                            );

                            if (item.action === 'search') {
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={className}
                                        onClick={() => setSearchOpen(true)}
                                        aria-label={item.label}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        {inner}
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={item.id}
                                    href={item.path}
                                    className={className}
                                    aria-label={item.label}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {inner}
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
                    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
                    width: min(360px, calc(100% - 28px));
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(18px) saturate(1.15);
                    -webkit-backdrop-filter: blur(18px) saturate(1.15);
                    border: 1px solid rgba(143, 115, 68, 0.16);
                    border-radius: 22px;
                    box-shadow:
                        0 1px 0 rgba(255, 255, 255, 0.7) inset,
                        0 10px 28px rgba(20, 20, 20, 0.1),
                        0 2px 8px rgba(20, 20, 20, 0.04);
                    padding: 6px;
                    box-sizing: border-box;
                }

                .mobile-nav-container {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    align-items: stretch;
                    gap: 4px;
                    width: 100%;
                }

                .mobile-nav-item {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 44px;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    border: none;
                    border-radius: 16px;
                    background: transparent;
                    color: #8a8a8a;
                    text-decoration: none;
                    cursor: pointer;
                    font: inherit;
                    appearance: none;
                    -webkit-appearance: none;
                    -webkit-tap-highlight-color: transparent;
                    transition: color 0.2s ease;
                    z-index: 0;
                }

                .mobile-nav-item :global(.nav-pill) {
                    position: absolute;
                    inset: 0;
                    border-radius: 16px;
                    background: rgba(143, 115, 68, 0.12);
                    z-index: -1;
                }

                .mobile-nav-item :global(i) {
                    position: relative;
                    font-size: 1.15rem;
                    line-height: 1;
                    width: 1.15rem;
                    text-align: center;
                    transition: transform 0.2s ease;
                }

                .mobile-nav-item.active {
                    color: var(--primary-color, #8F7344);
                }

                .mobile-nav-item.active :global(i) {
                    transform: translateY(-0.5px);
                }

                .mobile-nav-item:active {
                    color: var(--primary-hover, #6F5834);
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
