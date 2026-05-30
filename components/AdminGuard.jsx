'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminGuard({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        document.body.classList.add('admin-mode');
        return () => document.body.classList.remove('admin-mode');
    }, []);

    useEffect(() => {
        if (!loading && (!user || !user.isAdmin)) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading || !user?.isAdmin) {
        return (
            <div style={{ padding: '120px', textAlign: 'center', fontFamily: 'Assistant, sans-serif' }}>
                טוען מערכת ניהול...
            </div>
        );
    }

    return children;
}
