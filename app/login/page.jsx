'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function LoginForm() {
    const { login, isAdmin, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('next') || searchParams.get('redirect') || '/profile';
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const goAfterLogin = (data) => {
        const nextParam = searchParams.get('next');
        if (nextParam && nextParam.startsWith('/')) {
            router.push(nextParam);
            router.refresh();
            return;
        }
        if (data.user?.isAdmin) {
            const target = redirect.startsWith('/') ? redirect : '/admin';
            router.push(target);
            router.refresh();
        } else {
            router.push('/profile');
            router.refresh();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(formData.username.trim(), formData.password);
            goAfterLogin(data);
        } catch (err) {
            setError(err.message || 'שגיאה בהתחברות');
        } finally {
            setLoading(false);
        }
    };

    if (isAdmin) {
        return (
            <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '16px', color: '#166534', fontWeight: 600 }}>אתם כבר מחוברים כמנהלים</p>
                <Link href="/admin" className="btn btn-primary full-width" style={{ display: 'block', marginBottom: '10px' }}>
                    לדף הניהול
                </Link>
                <Link href="/" className="btn-text" style={{ color: '#999' }}>חזרה לאתר</Link>
            </div>
        );
    }

    if (user) {
        return (
            <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600 }}>
                    היי {user.name || user.username}
                </p>
                <p style={{ marginBottom: '20px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    אתם כבר מחוברים
                </p>
                <Link href="/profile" className="btn btn-primary full-width" style={{ display: 'block' }}>
                    לאזור האישי
                </Link>
            </div>
        );
    }

    return (
        <>
            {error && (
                <div className="auth-error">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="login-username">שם משתמש</label>
                    <input
                        id="login-username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="לדוגמה: noa_2026"
                        autoComplete="username"
                        autoFocus
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="login-password">סיסמה</label>
                    <input
                        id="login-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="הסיסמה שלכם"
                        required
                        autoComplete="current-password"
                    />
                </div>
                <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                    {loading ? 'מתחברים...' : 'התחברות'}
                </button>
            </form>
            <p className="auth-switch">
                עדיין אין לכם חשבון?{' '}
                <Link href="/register">הרשמה מהירה</Link>
            </p>
        </>
    );
}

export default function LoginPage() {
    return (
        <div className="auth-page">
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="auth-card"
            >
                <div className="auth-top">
                    <Link href="/" className="auth-back">
                        <i className="fas fa-arrow-right"></i> חזרה
                    </Link>
                </div>
                <div className="auth-brand">Fiesta</div>
                <h2>ברוכים השבים</h2>
                <p className="auth-sub">התחברו עם שם משתמש וסיסמה כדי לשמור מועדפים ולתכנן את האירוע</p>
                <Suspense fallback={<p style={{ textAlign: 'center' }}>טוען...</p>}>
                    <LoginForm />
                </Suspense>
            </motion.div>
            <style jsx>{`
                .auth-page {
                    padding: 100px 16px 48px;
                    min-height: 100vh;
                    background:
                        radial-gradient(ellipse at top right, rgba(201, 169, 110, 0.12), transparent 45%),
                        linear-gradient(180deg, #f7f5f1 0%, #f0ece4 100%);
                    display: flex;
                    justify-content: center;
                }
                .auth-card {
                    background: #fff;
                    padding: 36px 32px 32px;
                    border-radius: 16px;
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.05);
                    width: 100%;
                    max-width: 420px;
                    height: fit-content;
                }
                .auth-top { margin-bottom: 18px; }
                .auth-back {
                    color: #999;
                    text-decoration: none;
                    font-size: 0.9rem;
                }
                .auth-back i { margin-left: 8px; }
                .auth-brand {
                    font-family: var(--font-display);
                    font-size: 1.85rem;
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 8px;
                    letter-spacing: 0.02em;
                    background: linear-gradient(
                        165deg,
                        #2a2218 0%,
                        #5c4a2e 35%,
                        #8f7344 62%,
                        #c4a574 100%
                    );
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    -webkit-text-fill-color: transparent;
                }
                .auth-card :global(h2) {
                    text-align: center;
                    color: var(--text-dark);
                    margin: 0 0 8px;
                    font-family: var(--font-display);
                    font-weight: 500;
                    font-size: 1.45rem;
                }
                .auth-sub {
                    text-align: center;
                    color: var(--text-light);
                    font-size: 0.92rem;
                    line-height: 1.55;
                    margin: 0 0 28px;
                }
                .auth-card :global(.auth-form) {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                .auth-card :global(.auth-error) {
                    color: #fff;
                    background: #e74c3c;
                    padding: 10px 12px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    text-align: center;
                    font-size: 0.9rem;
                }
                .auth-card :global(.auth-switch) {
                    text-align: center;
                    margin-top: 22px;
                    color: var(--text-light);
                    font-size: 0.92rem;
                }
                .auth-card :global(.auth-switch a) {
                    color: var(--text-dark);
                    font-weight: 600;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                @media (max-width: 480px) {
                    .auth-page { padding: 88px 12px 32px; }
                    .auth-card { padding: 28px 18px 24px; }
                }
            `}</style>
        </div>
    );
}
