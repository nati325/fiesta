'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/admin';
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login(formData.email, formData.password);
            if (data.user?.isAdmin) {
                router.push(redirect.startsWith('/admin') ? redirect : '/admin');
            } else {
                router.push('/');
            }
        } catch (err) {
            setError(err.message || 'שגיאה בהתחברות');
        }
    };

    return (
        <>
            {error && <div style={{ color: 'white', background: '#ff4d4f', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                    <label>אימייל</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label>סיסמה</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary full-width">התחבר</button>
            </form>
        </>
    );
}

export default function LoginPage() {
    return (
        <div style={{ paddingTop: '120px', minHeight: '100vh', background: '#f9f9f9', display: 'flex', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', height: 'fit-content' }}
            >
                <div style={{ marginBottom: '20px' }}>
                    <Link href="/" className="btn-text" style={{ color: '#999', padding: 0 }}>
                        <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i> חזרה
                    </Link>
                </div>
                <h2 style={{ textAlign: 'center', color: '#D4AF37', marginBottom: '30px' }}>התחברות</h2>
                <Suspense fallback={<p style={{ textAlign: 'center' }}>טוען...</p>}>
                    <LoginForm />
                </Suspense>
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                    אין לך חשבון? <Link href="/register" style={{ color: '#D4AF37', cursor: 'pointer', fontWeight: 'bold' }}>הרשם כאן</Link>
                </p>
            </motion.div>
        </div>
    );
}
