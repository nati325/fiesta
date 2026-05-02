'use client';

import { AuthProvider } from '@/context/AuthContext';
import { VendorProvider } from '@/context/VendorContext';
import { CustomerProvider } from '@/context/CustomerContext';

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <CustomerProvider>
                <VendorProvider>
                    {children}
                </VendorProvider>
            </CustomerProvider>
        </AuthProvider>
    );
}
