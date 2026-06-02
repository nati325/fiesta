'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav({ user, onLogout, tabs = [] }) {
  const pathname = usePathname();

  return (
    <nav className="crm-nav">
      <div className="crm-nav-container">
        <div className="crm-logo">
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <span className="fiesta-brand">FIESTA</span>
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
              {tab.label}
            </button>
          ))}

          <Link
            href="/admin/add-vendor"
            className={`nav-btn-special ${pathname === '/admin/add-vendor' ? 'active' : ''}`}
          >
            📱 הוספה מהירה
          </Link>
          <Link href="/admin/rsvp" className="nav-btn-special">
            אישורי הגעה ✨
          </Link>
          <Link href="/admin/tools/alcohol" className="nav-btn-special">
            מחשבון אלכוהול 🥂
          </Link>
        </div>

        <div className="crm-user">
          <span>שלום, {user?.email}</span>
          <button type="button" onClick={onLogout} className="btn-logout">
            התנתק
          </button>
        </div>
      </div>
    </nav>
  );
}
