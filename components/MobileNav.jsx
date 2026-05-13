'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        { label: 'בית', icon: 'fas fa-home', path: '/' },
        { label: 'חיפוש', icon: 'fas fa-search', path: '/category/dj' },
        { label: 'מועדפים', icon: 'fas fa-heart', path: '/favorites' },
        { label: 'מתכנן', icon: 'fas fa-calculator', path: '/budget-planner' },
    ];

    return (
        <div className="mobile-nav-wrapper">
            <div className="mobile-nav-container">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link key={item.path} href={item.path} className={`mobile-nav-item ${isActive ? 'active' : ''}`}>
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                            {isActive && <motion.div layoutId="mobile-nav-indicator" className="nav-indicator" />}
                        </Link>
                    );
                })}
            </div>

            <style jsx>{`
                .mobile-nav-wrapper {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(15px);
                    box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.05);
                    border-top: 1px solid rgba(0, 0, 0, 0.05);
                    padding: 10px 10px calc(10px + env(safe-area-inset-bottom));
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
                    gap: 4px;
                    color: #888;
                    text-decoration: none;
                    font-size: 0.75rem;
                    font-weight: 600;
                    position: relative;
                    padding: 5px 12px;
                    transition: all 0.2s;
                    flex: 1;
                }

                .mobile-nav-item i {
                    font-size: 1.2rem;
                }

                .mobile-nav-item.active {
                    color: var(--primary-color);
                }

                .nav-indicator {
                    position: absolute;
                    top: -10px;
                    width: 25px;
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
        </div>
    );
}
