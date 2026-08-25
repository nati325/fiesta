export const SUPPLIER_GROUPS = [
    {
        id: 'main', label: 'מרכז האירוע', icon: 'fa-star', suppliers: [
            { type: 'dj', icon: 'fa-music', title: 'DJ ומוזיקה' },
            { type: 'photographer', icon: 'fa-camera-retro', title: 'צילום אירועים' },
            { type: 'alcohol', icon: 'fa-glass-cheers', title: 'אלכוהול ובר' },
            { type: 'catering', icon: 'fa-utensils', title: 'קייטרינג' },
            { type: 'venue', icon: 'fa-building', title: 'אולמות וגנים' },
            { type: 'design', icon: 'fa-palette', title: 'עיצוב אירועים' }
        ]
    },
    {
        id: 'look', label: 'לוק חתן-כלה', icon: 'fa-user-tie', suppliers: [
            { type: 'dresses', icon: 'fa-person-dress', title: 'שמלות כלה' },
            { type: 'suits', icon: 'fa-user-tie', title: 'חליפות חתן' },
            { type: 'bride-shoes', icon: 'fa-shoe-prints', title: 'נעלי כלה' },
            { type: 'groom-shoes', icon: 'fa-shoe-prints', title: 'נעלי חתן' },
            { type: 'hair', icon: 'fa-scissors', title: 'עיצוב שיער' },
            { type: 'makeup', icon: 'fa-eye', title: 'איפור' },
            { type: 'rings', icon: 'fa-ring', title: 'טבעות נישואין' }
        ]
    },
    {
        id: 'planning', label: 'ארגון ולוגיסטיקה', icon: 'fa-calendar-check', suppliers: [
            { type: 'event-production', icon: 'fa-star', title: 'הפקת אירועים' },
            { type: 'rsvp', icon: 'fa-check-to-slot', title: 'אישורי הגעה' },
            { type: 'invitations', icon: 'fa-envelope-open-text', title: 'הזמנות' },
            { type: 'transportation', icon: 'fa-bus', title: 'הסעות' },
            { type: 'cars', icon: 'fa-car', title: 'רכבי יוקרה' },
            { type: 'equipment-rental', icon: 'fa-chair', title: 'השכרת ציוד' }
        ]
    },
    {
        id: 'content', label: 'מסורת ותוכן', icon: 'fa-heart', suppliers: [
            { type: 'rabbi', icon: 'fa-book-open', title: 'רב לחופה' },
            { type: 'cantors', icon: 'fa-microphone-lines', title: 'חזנים ופייטנים' },
            { type: 'singers', icon: 'fa-microphone', title: 'זמרים ולהקות' },
            { type: 'religious-bands', icon: 'fa-guitar', title: 'להקות דתיות' },
            { type: 'challa', icon: 'fa-bread-slice', title: 'הפרשת חלה' },
            { type: 'attractions', icon: 'fa-wand-magic-sparkles', title: 'אטרקציות' },
            { type: 'souvenirs', icon: 'fa-gift', title: 'מזכרות' }
        ]
    },
    {
        id: 'extra', label: 'אירוח ופינוק', icon: 'fa-spa', suppliers: [
            { type: 'hotels', icon: 'fa-bed', title: 'מלונות' },
            { type: 'bachelor', icon: 'fa-glass-cheers', title: 'מסיבות רווקים' },
            { type: 'getting-ready', icon: 'fa-house-user', title: 'התארגנות כלה' },
            { type: 'dietitians', icon: 'fa-apple-whole', title: 'תזונה ודיאטה' },
            { type: 'personal-training', icon: 'fa-dumbbell', title: 'כושר ואימון' }
        ]
    }
];

export const CATEGORY_IMAGES = {
    'dj': 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=500&q=80',
    'photographer': '/images/event_photographer.png',
    'alcohol': '/images/bar_hero.png',
    'catering': '/images/catering.jpeg',
    'venue': '/images/venue_hero.png',
    'design': '/images/wedding_floral_arch_1765744424651.png',
    'dresses': '/images/wedding_dress.jpeg',
    'suits': '/images/groom_suits.jpeg',
    'bride-shoes': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80',
    'groom-shoes': 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=500&q=80',
    'hair': 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=500&q=80',
    'makeup': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=500&q=80',
    'rings': '/images/jewelry_hero.png',
    'event-production': '/images/event_production.jpeg',
    'rsvp': 'https://images.unsplash.com/photo-1512418490979-92798ccc13fb?auto=format&fit=crop&w=500&q=80',
    'invitations': '/images/invitations_hero.png',
    'transportation': '/images/car_hero.png',
    'cars': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80',
    'equipment-rental': '/images/wedding_table_detail_1765744408525.png',
    'rabbi': '/images/rabbi.jpeg',
    'cantors': 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=500&q=80',
    'singers': '/images/entertainment_hero.png',
    'religious-bands': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
    'challa': 'https://images.unsplash.com/photo-1610452399201-9a7076594d2f?auto=format&fit=crop&w=500&q=80',
    'attractions': '/images/attractions_hero.png',
    'souvenirs': 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=500&q=80',
    'hotels': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80',
    'bachelor': 'https://images.unsplash.com/photo-1514525253344-f81bcd3ce942?auto=format&fit=crop&w=500&q=80',
    'getting-ready': '/images/wedding_lounge_1765744440712.png',
    'dietitians': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=80',
    'personal-training': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=80'
};

export const CATEGORY_FALLBACK_IMAGE = '/images/hero_wedding_bg_1765744390134.png';

const TYPE_META = Object.fromEntries(
    SUPPLIER_GROUPS.flatMap((group) =>
        group.suppliers.map((s) => [s.type, { icon: s.icon, label: s.title }]),
    ),
);

export function getSupplierTypeMeta(type) {
    return TYPE_META[type] || { icon: 'fa-store', label: 'ספק' };
}
