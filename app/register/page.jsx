'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData.name, formData.email, formData.password);
            alert('ההרשמה בוצעה בהצלחה! כעת ניתן להתחבר');
            router.push('/login');
        } catch (err) {
            setError(err.message || 'שגיאה בהרשמה');
        }
    };

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
                <h2 style={{ textAlign: 'center', color: 'var(--text-dark)', marginBottom: '10px', fontFamily: 'var(--font-display)', fontWeight: 500 }}>הרשמה</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '30px' }}>השימוש ב-Fiesta חינם — תמיד</p>

                {error && <div style={{ color: 'white', background: '#ff4d4f', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label>שם מלא</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>אימייל</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>סיסמה</label>
                        <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    </div>

                    <button type="submit" className="btn btn-primary full-width">הירשם</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-light)' }}>
                    כבר יש לך חשבון? <Link href="/login" style={{ color: 'var(--text-dark)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>התחבר כאן</Link>
                </p>
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
