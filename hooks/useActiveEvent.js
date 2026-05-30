'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCustomers } from '@/context/CustomerContext';

const STORAGE_KEY = 'fiesta_active_event_id';

export function useActiveEvent() {
    const { customers } = useCustomers();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const customersWithEvents = useMemo(
        () => customers.filter(c => c.eventId),
        [customers]
    );

    const [eventId, setEventIdState] = useState('');

    useEffect(() => {
        const fromUrl = searchParams.get('event');
        const fromStorage = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : '';
        const initial = fromUrl || fromStorage || customersWithEvents[0]?.eventId || '';
        if (initial) setEventIdState(initial);
    }, [searchParams, customersWithEvents]);

    const setEventId = (id) => {
        setEventIdState(id);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, id);
        }
        const params = new URLSearchParams(searchParams.toString());
        if (id) {
            params.set('event', id);
        } else {
            params.delete('event');
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const activeCustomer = customersWithEvents.find(c => c.eventId === eventId) || null;

    const rsvpPublicUrl = eventId
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/rsvp?event=${eventId}`
        : '';

    const summaryPublicUrl = eventId
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/rsvp/summary?event=${eventId}`
        : '';

    return {
        eventId,
        setEventId,
        activeCustomer,
        customersWithEvents,
        rsvpPublicUrl,
        summaryPublicUrl
    };
}
