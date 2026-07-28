'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function TestDB() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user?.isAdmin) {
            router.replace('/');
        }
    }, [loading, user, router]);

    if (loading || !user?.isAdmin) {
        return <div style={{ padding: 40, textAlign: 'center' }}>אין גישה</div>;
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>דף בדיקה — למנהלים בלבד</h1>
            <p>השתמשו בכלי הניהול במקום דף זה.</p>
        </div>
    );
}
