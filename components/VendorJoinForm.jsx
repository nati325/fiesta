'use client';

import { useState } from 'react';

const FIELDS = { name: '', business: '', phone: '', category: '' };

const CATEGORIES = [
    'DJ ומוזיקה',
    'צילום',
    'אולמות וגנים',
    'קייטרינג',
    'אלכוהול ובר',
    'עיצוב אירועים',
    'שמלות / חליפות',
    'אחר',
];

export default function VendorJoinForm({ submitLabel = 'דברו איתי' }) {
    const [form, setForm] = useState(FIELDS);

    const handleSubmit = (e) => {
        e.preventDefault();
        const message = [
            'היי Fiesta!',
            'אני ספק ומעוניין להצטרף לפלטפורמה.',
            '',
            `*שם:* ${form.name}`,
            `*עסק:* ${form.business}`,
            `*טלפון:* ${form.phone}`,
            `*תחום:* ${form.category || 'לא צוין'}`,
        ].join('\n');
        window.open(`https://wa.me/972535378985?text=${encodeURIComponent(message)}`, '_blank');
        setForm(FIELDS);
    };

    const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    return (
        <form className="vendor-join" onSubmit={handleSubmit}>
            <label>
                שם מלא
                <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={set('name')}
                    required
                />
            </label>
            <label>
                שם העסק
                <input
                    type="text"
                    name="business"
                    autoComplete="organization"
                    value={form.business}
                    onChange={set('business')}
                    required
                />
            </label>
            <label>
                טלפון
                <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    required
                />
            </label>
            <label>
                תחום
                <select name="category" value={form.category} onChange={set('category')} required>
                    <option value="">בחרו קטגוריה</option>
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </label>
            <button type="submit">{submitLabel}</button>
        </form>
    );
}
