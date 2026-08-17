'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useVendors } from '@/context/VendorContext';
import VendorCard from '@/components/VendorCard';

const WA_PHONE = '972535378985';

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { vendors, favorites, loading: vendorsLoading } = useVendors();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?next=/profile');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="profile-page">
        <div className="container profile-wrap">
          <p className="profile-loading">טוען אזור אישי...</p>
        </div>
      </div>
    );
  }

  const favoriteVendors = vendors.filter((v) => favorites.includes(String(v.id)));

  const waFavoritesUrl = (() => {
    const names = favoriteVendors.map((v) => v.name).filter(Boolean);
    const text =
      names.length > 0
        ? `היי, הגעתי מ־Fiesta מהאזור האישי שלי. המועדפים שלי:\n${names.map((n) => `• ${n}`).join('\n')}\nאשמח לדבר עם נציג`
        : 'היי, הגעתי מ־Fiesta מהאזור האישי ואשמח לדבר עם נציג';
    return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;
  })();

  return (
    <div className="profile-page">
      <div className="container profile-wrap">
        <header className="profile-header">
          <div>
            <p className="profile-kicker">אזור אישי</p>
            <h1>{user.name || user.username}</h1>
            <p className="profile-meta">
              {user.username ? `@${user.username}` : null}
              {user.email ? ` · ${user.email}` : null}
            </p>
          </div>
          <div className="profile-actions">
            {user.isAdmin && (
              <Link href="/admin" className="btn-secondary">
                ניהול
              </Link>
            )}
            <button type="button" className="btn-ghost" onClick={logout}>
              התנתקות
            </button>
          </div>
        </header>

        <section className="profile-cart">
          <div className="cart-head">
            <div>
              <h2>הספקים שאהבתי</h2>
              <p>כמו סל אישי — נשמור את זה גם לניוזלטר והצעות בהמשך</p>
            </div>
            <a href={waFavoritesUrl} target="_blank" rel="noopener noreferrer" className="btn-wa">
              <i className="fab fa-whatsapp"></i>
              לדבר עם נציג על המועדפים
            </a>
          </div>

          {vendorsLoading ? (
            <p className="profile-loading">טוען ספקים...</p>
          ) : (
            <AnimatePresence mode="popLayout">
              {favoriteVendors.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="cart-empty"
                >
                  <i className="far fa-heart"></i>
                  <h3>עדיין אין מועדפים</h3>
                  <p>לחצו על אהבתי בדף של ספק והוא יופיע כאן</p>
                  <Link href="/vendors" className="btn-primary">
                    לגלות ספקים
                  </Link>
                </motion.div>
              ) : (
                <div className="cart-grid">
                  {favoriteVendors.map((v, i) => (
                    <VendorCard key={v.id} vendor={v} index={i} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          )}
        </section>
      </div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background: #faf9f7;
          padding: 110px 0 100px;
        }
        .profile-wrap {
          max-width: 1100px;
        }
        .profile-loading {
          text-align: center;
          color: #777;
          padding: 40px 0;
        }
        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .profile-kicker {
          margin: 0 0 4px;
          color: #8F7344;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .profile-header h1 {
          margin: 0;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-family: var(--font-display), var(--font-frank), serif;
        }
        .profile-meta {
          margin: 6px 0 0;
          color: #777;
          font-size: 0.92rem;
        }
        .profile-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .btn-secondary,
        .btn-ghost,
        .btn-primary,
        .btn-wa {
          border-radius: 10px;
          padding: 10px 14px;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          border: 1px solid transparent;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-secondary {
          background: #111;
          color: #fff;
        }
        .btn-ghost {
          background: #fff;
          border-color: #e5e2dc;
          color: #444;
        }
        .btn-primary {
          background: #111;
          color: #fff;
          margin-top: 8px;
        }
        .btn-wa {
          background: #25d366;
          color: #fff;
        }
        .profile-cart {
          background: #fff;
          border: 1px solid #ebe7e0;
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        }
        .cart-head {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .cart-head h2 {
          margin: 0 0 4px;
          font-size: 1.25rem;
        }
        .cart-head p {
          margin: 0;
          color: #777;
          font-size: 0.9rem;
        }
        .cart-empty {
          text-align: center;
          padding: 48px 16px;
          color: #666;
        }
        .cart-empty i {
          font-size: 2.2rem;
          color: #c4b5a0;
          margin-bottom: 12px;
        }
        .cart-empty h3 {
          margin: 0 0 6px;
        }
        .cart-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        @media (max-width: 640px) {
          .profile-page {
            padding-top: 90px;
            padding-bottom: calc(var(--mobile-chrome-clearance, 100px) + 24px);
          }
          .profile-cart {
            padding: 16px;
          }
          .cart-grid {
            grid-template-columns: 1fr;
          }
          .profile-actions {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 10px;
          }
          .profile-actions a,
          .profile-actions button {
            width: 100%;
            justify-content: center;
            min-height: 48px;
          }
        }
      `}</style>
    </div>
  );
}
