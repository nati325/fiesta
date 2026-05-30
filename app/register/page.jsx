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
                <h2 style={{ textAlign: 'center', color: '#D4AF37', marginBottom: '10px' }}>הרשמה</h2>
                <p style={{ textAlign: 'center', color: '#2E7D32', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '30px' }}>השימוש ב-Fiesta חינם לגמרי - תמיד!</p>

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
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                    כבר יש לך חשבון? <Link href="/login" style={{ color: '#D4AF37', cursor: 'pointer', fontWeight: 'bold' }}>התחבר כאן</Link>
                </p>
            </motion.div>
        </div>
    );
}
