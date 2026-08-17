'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SearchModal from './SearchModal';

const HIDDEN_PATHS = ['/design-invitation', '/rsvp', '/login', '/register'];
const SHOW_AFTER_PX = 72;

function NavIcon({ name }) {
    const common = {
        viewBox: '0 0 24 24',
        width: 20,
        height: 20,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        focusable: 'false',
    };

    if (name === 'home') {
        return (
            <svg {...common}>
                <path d="M4 11.2L12 4.5l8 6.7V20a.8.8 0 0 1-.8.8h-5.2v-5.4h-4V20.8H4.8A.8.8 0 0 1 4 20v-8.8z" />
            </svg>
        );
    }
    if (name === 'search') {
        return (
            <svg {...common}>
                <circle cx="11" cy="11" r="6.2" />
                <path d="M16.2 16.2L21 21" />
            </svg>
        );
    }
    if (name === 'heart') {
        return (
            <svg {...common}>
                <path d="M12 20s-7.2-4.3-7.2-9.1C4.8 8.2 6.8 6.2 9.2 6.2c1.4 0 2.5.7 2.8 1.8.3-1.1 1.4-1.8 2.8-1.8 2.4 0 4.4 2 4.4 4.7C19.2 15.7 12 20 12 20z" />
            </svg>
        );
    }
    if (name === 'cart') {
        return (
            <svg {...common}>
                <path d="M3.5 4.5h2l1.8 10.2h10.7l1.8-7.2H7" />
                <circle cx="9" cy="19" r="1.2" />
                <circle cx="17" cy="19" r="1.2" />
            </svg>
        );
    }
    return (
        <svg {...common}>
            <rect x="5" y="3.5" width="14" height="17" rx="2" />
            <path d="M8.2 8h7.6M8.2 12h7.6M8.2 16h3.2M12.8 16h3" />
        </svg>
    );
}

export default function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [searchOpen, setSearchOpen] = useState(false);
    const [revealed, setRevealed] = useState(false);

    const isHiddenPage =
        pathname?.startsWith('/admin') ||
        HIDDEN_PATHS.some((p) => pathname === p || pathname?.startsWith(`${p}/`));
    const isHome = pathname === '/';

    useEffect(() => {
        if (isHiddenPage) return undefined;
        if (!isHome) {
            setRevealed(true);
            return undefined;
        }

        const sync = () => setRevealed(window.scrollY > SHOW_AFTER_PX);
        sync();
        window.addEventListener('scroll', sync, { passive: true });
        return () => window.removeEventListener('scroll', sync);
    }, [isHiddenPage, isHome]);

    if (isHiddenPage) return null;

    const navItems = [
        { id: 'home', label: 'בית', icon: 'home', path: '/' },
        { id: 'search', label: 'חיפוש', icon: 'search', action: 'search' },
        { id: 'cart', label: 'סל', icon: 'cart', path: '/cart' },
        { id: 'event', label: 'האירוע', icon: 'calc', path: '/my-event' },
    ];

    const isItemActive = (item) => {
        if (item.action === 'search') {
            return searchOpen || pathname?.startsWith('/search') || pathname?.startsWith('/category') || pathname === '/vendors';
        }
        if (item.path === '/') return pathname === '/';
        return pathname === item.path || pathname?.startsWith(`${item.path}/`);
    };

    const onItemClick = (item) => {
        if (item.action === 'search') {
            setSearchOpen(true);
            return;
        }
        router.push(item.path);
    };

    return (
        <>
            {!searchOpen && (
                <nav
                    className={`mobile-nav-wrapper${revealed ? ' is-revealed' : ''}`}
                    aria-label="ניווט תחתון"
                    aria-hidden={!revealed}
                >
                    <div className="mobile-nav-container">
                        {navItems.map((item) => {
                            const isActive = isItemActive(item);
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`mobile-nav-item${isActive ? ' is-active' : ''}`}
                                    onClick={() => onItemClick(item)}
                                    aria-label={item.label}
                                    aria-current={isActive ? 'page' : undefined}
                                    tabIndex={revealed ? 0 : -1}
                                >
                                    <span className="mobile-nav-icon">
                                        <NavIcon name={item.icon} />
                                    </span>
                                    <span className="mobile-nav-text">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            )}

            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
