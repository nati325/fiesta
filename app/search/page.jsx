'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import VendorCard from '@/components/VendorCard';
import { vendorMatchesArea } from '@/lib/vendorRegion';
import { useAuth } from '@/context/AuthContext';
import { vendorFitsEvent } from '@/lib/eventTypes';

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const area = searchParams.get('area') || 'כל הארץ';
    const { eventPreference } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Map Hebrew search terms to vendor types
    const hebrewTypeMap = {
        'דיג\'יי': 'dj', 'דג\'יי': 'dj', 'תקליטן': 'dj',
        'צלם': 'photographer', 'צילום': 'photographer', 'צלמים': 'photographer',
        'קייטרינג': 'catering', 'אוכל': 'catering', 'מזון': 'catering',
        'אולם': 'venue', 'גן': 'venue', 'מקום': 'venue',
        'שמלה': 'dresses', 'שמלות': 'dresses', 'כלה': 'dresses',
        'חליפה': 'suits', 'חליפות': 'suits', 'חתן': 'suits',
        'איפור': 'makeup', 'מאפרת': 'makeup',
        'שיער': 'hair', 'מספרה': 'hair', 'תסרוקת': 'hair',
        'טבעת': 'rings', 'טבעות': 'rings', 'תכשיטים': 'rings',
        'אלכוהול': 'alcohol', 'בר': 'alcohol', 'משקאות': 'alcohol',
        'אטרקציות': 'attractions', 'אפקטים': 'attractions', 'זיקוקים': 'attractions',
        'עיצוב': 'design', 'פרחים': 'design',
        'רב': 'rabbi', 'חופה': 'rabbi',
        'זמר': 'singers', 'להקה': 'singers', 'מוזיקה': 'singers',
        'הזמנות': 'invitations', 'כרטיסים': 'invitations',
        'מזכרות': 'souvenirs', 'מתנות': 'souvenirs',
        'מלון': 'hotels', 'בית מלון': 'hotels',
        'רכב': 'cars', 'לימוזין': 'cars',
        'הסעות': 'transportation', 'הסעה': 'transportation',
        'הפקה': 'event-production', 'מפיק': 'event-production',
        'פייטן': 'cantors', 'חזן': 'cantors',
        'נעליים': 'bride-shoes', 'נעלי כלה': 'bride-shoes',
        'דיאטה': 'dietitians', 'תזונה': 'dietitians',
        'כושר': 'personal-training', 'אימון': 'personal-training',
        'רווקים': 'bachelor', 'רווקות': 'bachelor',
    };

    useEffect(() => {
        fetch('/api/vendors')
            .then(res => res.json())
            .then(data => {
                const q = query.toLowerCase().trim();
                const all = Array.isArray(data) ? data : [];
                // Find matching type from Hebrew map
                const mappedType = Object.entries(hebrewTypeMap).find(([heb]) =>
                    q.includes(heb)
                )?.[1];

                const filtered = all.filter(v => {
                    if (!q) return false;
                    const matchesName = v.name?.toLowerCase().includes(q);
                    const matchesType = v.type?.toLowerCase().includes(q);
                    const matchesMappedType = mappedType && (v.type === mappedType || (Array.isArray(v.types) && v.types.includes(mappedType)));
                    const matchesDescription = v.description?.toLowerCase().includes(q);
                    const matchesQuery = matchesName || matchesType || matchesMappedType || matchesDescription;

                    const matchesArea = vendorMatchesArea(v, area);
                    if (!matchesQuery || !matchesArea) return false;
                    if (eventPreference && !vendorFitsEvent(v, eventPreference)) {
                        return false;
                    }
                    return true;
                });
                setVendors(filtered);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [query, area, eventPreference]);

    return (
        <div className="search-results-page">
            <div className="results-header">
                <div className="container">
                    <h1>
                        {query.trim()
                            ? <>תוצאות חיפוש עבור: <span className="highlight">&quot;{query}&quot;</span></>
                            : 'חיפוש ספקים'}
                    </h1>
                    <p>
                        {query.trim()
                            ? <>מצאנו {vendors.length} ספקים רלוונטיים {area !== 'כל הארץ' ? `באזור ${area}` : ''}</>
                            : 'הזינו מילת חיפוש כדי למצוא ספקים'}
                    </p>
                </div>
            </div>

            <div className="container">
                {loading ? (
                    <div className="loading-state">טוען ספקים...</div>
                ) : vendors.length > 0 ? (
                    <div className="vendors-grid">
                        {vendors.map((v, i) => (
                            <VendorCard key={v.id} vendor={v} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <i className="fas fa-search"></i>
                        <h2>מצטערים, לא מצאנו תוצאות</h2>
                        <p>נסו לחפש משהו אחר או לבדוק את הקטגוריות הפופולריות שלנו</p>
                        <Link href="/vendors" className="back-home">לכל הספקים</Link>
                    </div>
                )}
            </div>

            <style jsx>{`
                .search-results-page {
                    padding-top: 100px;
                    min-height: 100vh;
                    background: var(--white);
                }
                .results-header {
                    background: white;
                    padding: 48px 0;
                    margin-bottom: 32px;
                    border-bottom: 1px solid var(--border-color);
                    text-align: right;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                h1 {
                    font-size: clamp(1.6rem, 3vw, 2.2rem);
                    font-weight: 500;
                    margin-bottom: 8px;
                    font-family: var(--font-display);
                }
                .highlight {
                    color: var(--text-dark);
                }
                p {
                    font-size: 1rem;
                    color: var(--text-light);
                }
                .vendors-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                    padding-bottom: 80px;
                }
                .no-results {
                    text-align: center;
                    padding: 80px 20px;
                }
                .no-results i {
                    font-size: 3rem;
                    color: #e5e2dc;
                    margin-bottom: 16px;
                }
                .back-home {
                    display: inline-block;
                    margin-top: 24px;
                    background: var(--charcoal);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: 600;
                    text-decoration: none;
                }
                .loading-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--text-light);
                }
                @media (max-width: 768px) {
                    .search-results-page {
                        padding-top: 88px;
                        padding-bottom: calc(var(--mobile-chrome-clearance, 88px) + 16px);
                    }
                    .results-header {
                        padding: 28px 0;
                        margin-bottom: 24px;
                    }
                    .container { padding: 0 16px; }
                    h1 {
                        font-size: 1.5rem;
                        line-height: 1.35;
                    }
                    p { font-size: 0.95rem; }
                    .vendors-grid {
                        grid-template-columns: 1fr;
                        gap: 14px;
                        padding-bottom: 8px;
                    }
                    .no-results {
                        padding: 60px 16px;
                    }
                    .no-results i { font-size: 2.5rem; }
                    .back-home {
                        width: 100%;
                        max-width: 280px;
                        text-align: center;
                        padding: 14px 24px;
                        min-height: 48px;
                    }
                }
            `}</style>
        </div>
    );
}

export default function SearchResultsPage() {
    return (
        <Suspense fallback={<div>טוען...</div>}>
            <SearchResultsContent />
        </Suspense>
    );
}
