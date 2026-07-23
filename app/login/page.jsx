'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function LoginForm() {
    const { unlockAdmin, login, isAdmin } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/admin';
    const [password, setPassword] = useState('');
    const [showFullLogin, setShowFullLogin] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const goAfterLogin = (data) => {
        if (data.user?.isAdmin) {
            const target = redirect.startsWith('/') ? redirect : '/admin';
            router.push(target);
            router.refresh();
        } else {
            router.push('/');
        }
    };

    const handleMasterUnlock = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await unlockAdmin(password.trim());
            goAfterLogin(data);
        } catch (err) {
            setError(err.message || 'סיסמה שגויה');
        } finally {
            setLoading(false);
        }
    };

    const handleFullLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(formData.email, formData.password);
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
                <p style={{ marginBottom: '16px', color: '#166534', fontWeight: 700 }}>כבר במצב עריכה</p>
                <Link href="/admin" className="btn btn-primary full-width" style={{ display: 'block', marginBottom: '10px' }}>
                    לדף הניהול
                </Link>
                <Link href="/" className="btn-text" style={{ color: '#999' }}>חזרה לאתר</Link>
            </div>
        );
    }

    if (!showFullLogin) {
        return (
            <>
                {error && (
                    <div style={{ color: 'white', background: '#ff4d4f', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleMasterUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label>קוד כניסה לניהול</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="הזן קוד..."
                            required
                            autoFocus
                            autoComplete="current-password"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                        {loading ? 'בודק...' : 'כניסה לעריכה'}
                    </button>
                </form>
                <button
                    type="button"
                    onClick={() => setShowFullLogin(true)}
                    style={{
                        marginTop: '18px',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: '#999',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontFamily: 'inherit',
                    }}
                >
                    התחברות עם אימייל ←
                </button>
            </>
        );
    }

    return (
        <>
            {error && (
                <div style={{ color: 'white', background: '#ff4d4f', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>
                    {error}
                </div>
            )}
            <form onSubmit={handleFullLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                    <label>אימייל</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>סיסמה</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                    {loading ? 'מתחבר...' : 'התחבר'}
                </button>
            </form>
            <button
                type="button"
                onClick={() => setShowFullLogin(false)}
                style={{
                    marginTop: '18px',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                }}
            >
                ← חזרה לקוד כניסה
            </button>
        </>
    );
}

export default function LoginPage() {
    return (
        <div className="auth-page">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="auth-card"
            >
                <div style={{ marginBottom: '20px' }}>
                    <Link href="/" className="btn-text" style={{ color: '#999', padding: 0 }}>
                        <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i> חזרה
                    </Link>
                </div>
                <h2 style={{ textAlign: 'center', color: 'var(--text-dark)', marginBottom: '8px', fontFamily: 'var(--font-display)', fontWeight: 500 }}>כניסת ניהול</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '28px' }}>
                    הזן את קוד הניהול כדי לערוך ספקים ולגשת לדף הניהול
                </p>
                <Suspense fallback={<p style={{ textAlign: 'center' }}>טוען...</p>}>
                    <LoginForm />
                </Suspense>
            </motion.div>
            <style jsx>{`
                .auth-page {
                    padding: 100px 16px 40px;
                    min-height: 100vh;
                    background: var(--off-white);
                    display: flex;
                    justify-content: center;
                }
                .auth-card {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                    width: 100%;
                    max-width: 400px;
                    height: fit-content;
                }
                @media (max-width: 480px) {
                    .auth-page { padding: 88px 12px 32px; }
                    .auth-card { padding: 24px 16px; }
                }
            `}</style>
        </div>
    );
}
