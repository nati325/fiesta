'use client';

import AdminGuard from '@/components/AdminGuard';
import { CustomerProvider } from '@/context/CustomerContext';

export default function AdminLayout({ children }) {
    return (
        <AdminGuard>
            <CustomerProvider>
                {children}
            </CustomerProvider>
        </AdminGuard>
    );
}
