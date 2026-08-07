'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData.name.trim(), formData.username.trim(), formData.password);
            router.push('/profile');
            router.refresh();
        } catch (err) {
            setError(err.message || 'שגיאה בהרשמה');
        } finally {
            setLoading(false);
        }
    };

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
                <h2>יצירת חשבון</h2>
                <p className="auth-sub">
                    שם משתמש וסיסמה — ואתם בפנים. השימוש ב־Fiesta תמיד בחינם.
                </p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="reg-name">שם לתצוגה (אופציונלי)</label>
                        <input
                            id="reg-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="לדוגמה: נועה ויוסי"
                            autoComplete="name"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-username">שם משתמש</label>
                        <input
                            id="reg-username"
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="בחרו שם ייחודי"
                            required
                            autoComplete="username"
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-password">סיסמה</label>
                        <input
                            id="reg-password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="לפחות 4 תווים"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                        {loading ? 'יוצרים חשבון...' : 'להרשמה והתחברות'}
                    </button>
                </form>
                <p className="auth-switch">
                    כבר יש לכם חשבון?{' '}
                    <Link href="/login">התחברות</Link>
                </p>
            </motion.div>
            <style jsx>{`
                .auth-page {
                    padding: 100px 16px 48px;
                    min-height: 100vh;
                    background:
                        radial-gradient(ellipse at top left, rgba(201, 169, 110, 0.12), transparent 45%),
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
                .auth-card h2 {
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
                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                .auth-error {
                    color: #fff;
                    background: #e74c3c;
                    padding: 10px 12px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    text-align: center;
                    font-size: 0.9rem;
                }
                .auth-switch {
                    text-align: center;
                    margin-top: 22px;
                    color: var(--text-light);
                    font-size: 0.92rem;
                }
                .auth-switch a {
                    color: var(--text-dark);
                    font-weight: 600;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                @media (max-width: 480px) {
                    .auth-page { padding: 88px 12px calc(32px + env(safe-area-inset-bottom, 0px)); }
                    .auth-card { padding: 28px 18px 24px; }
                    .auth-page input,
                    .auth-page select,
                    .auth-page textarea {
                        font-size: 16px;
                        min-height: 48px;
                    }
                }
            `}</style>
        </div>
    );
}
