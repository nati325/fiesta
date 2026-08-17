'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import BrandMark from '@/components/BrandMark';
import { usePathname } from 'next/navigation';

export default function AdminNav({ user, onLogout, tabs = [] }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [moreOpen]);

  const moreActive =
    pathname === '/admin/add-vendor' ||
    pathname?.startsWith('/admin/rsvp') ||
    pathname?.startsWith('/admin/tools');

  return (
    <nav className="crm-nav">
      <div className="crm-nav-container">
        <div className="crm-logo">
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <BrandMark variant="admin" />
          </Link>
          <span className="admin-tag">ADMIN CRM</span>
        </div>

        <div className="crm-nav-links">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.active ? 'active' : ''}
              onClick={tab.onClick}
            >
              <span className="crm-tab-label-full">{tab.label}</span>
              <span className="crm-tab-label-short">{tab.shortLabel || tab.label}</span>
            </button>
          ))}

          <div className="crm-nav-desktop-links">
            <Link
              href="/admin/add-vendor"
              className={`nav-btn-special ${pathname === '/admin/add-vendor' ? 'active' : ''}`}
            >
              הוספה מהירה
            </Link>
            <Link href="/admin/rsvp" className="nav-btn-special">
              אישורי הגעה
            </Link>
            <Link href="/admin/tools/alcohol" className="nav-btn-special">
              מחשבון אלכוהול
            </Link>
          </div>

          <div className="crm-nav-more" ref={moreRef}>
            <button
              type="button"
              className={`nav-btn-special crm-nav-more-btn ${moreOpen || moreActive ? 'active' : ''}`}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen((v) => !v)}
            >
              עוד <i className={`fas fa-chevron-${moreOpen ? 'up' : 'down'}`} aria-hidden />
            </button>
            {moreOpen && (
              <div className="crm-nav-more-menu" role="menu">
                <Link
                  href="/admin/add-vendor"
                  role="menuitem"
                  className={pathname === '/admin/add-vendor' ? 'active' : ''}
                  onClick={() => setMoreOpen(false)}
                >
                  הוספה מהירה
                </Link>
                <Link href="/admin/rsvp" role="menuitem" onClick={() => setMoreOpen(false)}>
                  אישורי הגעה
                </Link>
                <Link href="/admin/tools/alcohol" role="menuitem" onClick={() => setMoreOpen(false)}>
                  מחשבון אלכוהול
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="crm-user">
          <span className="crm-user-greeting">שלום, {user?.name || user?.username || user?.email || 'מנהל'}</span>
          <button type="button" onClick={onLogout} className="btn-logout">
            התנתק
          </button>
        </div>
      </div>
    </nav>
  );
}
