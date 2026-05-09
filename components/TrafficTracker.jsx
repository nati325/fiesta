'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function TrafficTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Track the visit
        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page: pathname })
        }).catch(() => {});
    }, [pathname]);

    return null; // This component doesn't render anything
}
