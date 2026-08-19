'use client';

import { usePathname } from 'next/navigation';

const HIDDEN_PATHS = ['/design-invitation', '/rsvp', '/login', '/register', '/cart'];

const WhatsAppButton = () => {
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) return null;
    if (HIDDEN_PATHS.some((p) => pathname === p || pathname?.startsWith(`${p}/`))) return null;

    const phoneNumber = '972535378985';
    const message = encodeURIComponent(
        'היי, הגעתי מ־Fiesta ואשמח לתיאום דרככם'
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float-compact"
            aria-label="תעבור לנציג פייסטה"
            title="תעבור לנציג פייסטה"
        >
            <i className="fab fa-whatsapp"></i>
            <span className="whatsapp-label-small">תעבור לנציג פייסטה</span>
        </a>
    );
};

export default WhatsAppButton;
