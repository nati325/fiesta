'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Floating edit toolbar — visible only when master admin is unlocked.
 */
export default function SiteEditBar() {
  const { isAdmin, user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (loading || !isAdmin) return null;
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) return null;

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10050,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '95vw',
        padding: '10px 14px',
        borderRadius: '999px',
        background: 'rgba(15, 23, 42, 0.92)',
        color: 'white',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        backdropFilter: 'blur(12px)',
        fontFamily: 'Assistant, sans-serif',
        fontSize: '0.85rem',
        fontWeight: 700,
      }}
    >
      <span style={{ color: '#fbbf24', whiteSpace: 'nowrap' }}>
        <i className="fas fa-pen-to-square" style={{ marginLeft: '6px' }} />
        מצב עריכה
      </span>
      <span style={{ opacity: 0.5 }}>|</span>
      <Link
        href="/admin"
        style={{ color: 'white', textDecoration: 'none', whiteSpace: 'nowrap' }}
      >
        דף ניהול
      </Link>
      <Link
        href="/admin/add-vendor"
        style={{ color: 'white', textDecoration: 'none', whiteSpace: 'nowrap' }}
      >
        + ספק חדש
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: 'none',
          color: 'white',
          borderRadius: '999px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontWeight: 800,
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
        title={user?.email || 'יציאה'}
      >
        יציאה
      </button>
    </div>
  );
}

export function EditChip({ href, label = 'ערוך', onClick, style = {} }) {
  const { isAdmin, loading } = useAuth();
  if (loading || !isAdmin) return null;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#0f172a',
    color: '#fbbf24',
    border: '1px solid rgba(251, 191, 36, 0.5)',
    borderRadius: '999px',
    padding: '6px 12px',
    fontSize: '0.75rem',
    fontWeight: 800,
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: 'Assistant, sans-serif',
    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
    ...style,
  };

  if (onClick) {
    return (
      <button type="button" onClick={onClick} style={baseStyle}>
        <i className="fas fa-pen" />
        {label}
      </button>
    );
  }

  return (
    <Link href={href || '/admin'} style={baseStyle}>
      <i className="fas fa-pen" />
      {label}
    </Link>
  );
}
