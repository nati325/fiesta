'use client';

import { AuthProvider } from '@/context/AuthContext';
import { VendorProvider } from '@/context/VendorContext';

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <VendorProvider>
                {children}
            </VendorProvider>
        </AuthProvider>
    );
}
