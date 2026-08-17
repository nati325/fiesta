'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Hero3D from '@/components/Hero3D';
import HomeStepVisual from '@/components/HomeStepVisual';
import BudgetInvite from '@/components/BudgetInvite';
import { useAuth } from '@/context/AuthContext';

const HOW_STEPS = [
    {
        n: '01',
        visual: 'pick',
        title: 'בוחרים ספקים',
        text: 'מקום, מוזיקה, צילום ועיצוב — לפי האירוע שלכם.',
        why: 'בלי לרדוף אחרי הצעות בכל מקום.',
    },
    {
        n: '02',
        visual: 'cart',
        title: 'מוסיפים לסל',
        text: 'מרכזים את כל הספקים שאהבתם במקום אחד.',
        why: 'ספקים, תקציב וסל — במערכת אחת.',
    },
    {
        n: '03',
        visual: 'guide',
        title: 'מקבלים ליווי',
        text: 'יועץ Fiesta ב־WhatsApp עוזר לסגור את הפרטים.',
        why: 'מישהו אמיתי שעובר איתכם על האירוע.',
    },
    {
        n: '04',
        visual: 'piggy',
        title: 'סוגרים במחיר Fiesta',
        text: 'חוסכים 5%–10% וממשיכים בביטחון.',
        why: 'הנחה אמיתית — לא מחיר מנופח.',
    },
];

const EVENT_ENTRIES = [
    { id: 'חתונה', label: 'חתונה', icon: 'fa-ring' },
    { id: 'בר מצווה', label: 'בר מצווה', num: '13' },
    { id: 'בת מצווה', label: 'בת מצווה', num: '12' },
    { id: 'ברית', label: 'ברית', icon: 'fa-baby' },
    { id: 'אירוע עסקי', label: 'אירוע עסקי', icon: 'fa-briefcase' },
    { id: 'יום הולדת', label: 'יום הולדת', icon: 'fa-cake-candles' },
];

export default function HomePage() {
    const [articles, setArticles] = useState([]);
    const [contactData, setContactData] = useState({ name: '', phone: '' });
    const { hasOnboarded } = useAuth();
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        fetch('/api/articles').then(res => res.json()).then(data => setArticles(Array.isArray(data) ? data : []));
    }, []);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        const message = `היי Fiesta!\nהשארתי פרטים באתר ואשמח שתחזרו אליי:\n\n*שם:* ${contactData.name}\n*טלפון:* ${contactData.phone}`;
        window.open(`https://wa.me/972535378985?text=${encodeURIComponent(message)}`, '_blank');
        setContactData({ name: '', phone: '' });
    };

    // Kept only for the legacy modal markup below; the active flow is
    // /event-setup and this modal is no longer opened.
    const startWithEvent = () => setShowOnboarding(false);

    return (
        <div className="home-container">
            <Hero3D />

            {/* Mission + how it works — first section after hero */}
            <section className="home-how" id="how" aria-labelledby="home-mission-title">
                <div className="home-how__inner">
                    <div className="home-how__mission">
                        <p className="home-how__kicker">מה זה Fiesta</p>
                        <h2 id="home-mission-title" className="home-how__title">
                            פלטפורמה שנבנתה למען עם ישראל
                        </h2>
                        <div className="home-how__flourish" aria-hidden>
                            <svg viewBox="0 0 140 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 9h46" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                                <path d="M86 9h46" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                                <path d="M70 2.2L73.8 9 70 15.8 66.2 9 70 2.2Z" fill="currentColor" />
                                <path d="M62 9h6M72 9h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                            </svg>
                        </div>

                        <div className="home-how__story">
                            <p className="home-how__lead">
                                יוקר המחיה פוגע בכולנו — גם כשמדובר באירוע משפחתי. Fiesta הוקמה
                                כדי לתת לכם מקום אחד לתכנן חתונה, בר מצווה או כל חגיגה, בלי לשלם על דמיון.
                            </p>
                            <p>
                                כל הספקים אצלנו נותנים מחיר Fiesta אמיתי. לא «הנחה» על מחיר מקורי
                                שמישהו המציא, ולא מבצע שנראה נהדר בפרסומת ובסוף לא חסכתם כלום.
                                המחיר הרגיל הוא מה שהספק באמת גובה — ודרכנו אתם משלמים פחות.
                            </p>
                        </div>

                        <aside className="home-how__gift" aria-label="מתנה ללקוחות Fiesta">
                            <p className="home-how__gift-label">מתנה מאיתנו</p>
                            <p className="home-how__gift-text">
                                סגרתם איתנו אולם ועוד שני ספקים? או שיש לכם שישה ספקים ומעלה?
                                תקבלו בוט אישורי הגעה וסידור שולחנות — בחינם.
                                כי גם שם אנחנו רוצים לחסוך לכם כסף, זמן ועוגמת נפש.
                            </p>
                        </aside>
                    </div>

                    <div className="home-how__process" id="why" aria-labelledby="home-how-title">
                        <header className="home-how__head">
                            <p className="home-how__kicker">איך זה עובד</p>
                            <h3 id="home-how-title" className="home-how__process-title">
                                ארבעה שלבים עד אירוע סגור
                            </h3>
                            <div className="home-how__diamond" aria-hidden />
                            <p className="home-how__bridge">
                                יוקר המחיה לא צריך לשבור את האירוע.
                                ככה Fiesta מובילה אתכם — שלב אחרי שלב.
                            </p>
                        </header>

                        <ol className="home-how__steps">
                            {HOW_STEPS.map((step) => (
                                <li key={step.n} className="home-how__step" aria-label={`שלב ${step.n}: ${step.title}`}>
                                    <HomeStepVisual kind={step.visual} label={`שלב ${step.n}`} />
                                    <h4>{step.title}</h4>
                                    <p className="home-how__step-text">{step.text}</p>
                                    <p className="home-how__step-why">{step.why}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            {/* Event type entry → vendors */}
            <section className="home-events" id="events" aria-labelledby="home-events-title">
                <div className="home-events__inner">
                    <header className="home-events__head">
                        <p className="home-events__kicker">הצעד הראשון</p>
                        <h2 id="home-events-title" className="home-events__title">
                            בואו נבנה את האירוע
                        </h2>
                        <div className="home-events__flourish" aria-hidden>
                            <svg viewBox="0 0 140 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 9h46" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                                <path d="M86 9h46" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                                <path d="M70 2.2L73.8 9 70 15.8 66.2 9 70 2.2Z" fill="currentColor" />
                                <path d="M62 9h6M72 9h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                            </svg>
                        </div>
                        <p className="home-events__lead">
                            בחרו סוג אירוע — ונכנסים לקטלוג הספקים, לתקציב ולסל במקום אחד.
                        </p>
                    </header>

                    <div className="home-events__grid">
                        {EVENT_ENTRIES.map((ev) => (
                            <Link
                                key={ev.id}
                                href="/event-setup"
                                className="home-events__card"
                            >
                                <span className="home-events__icon" aria-hidden="true">
                                    {ev.num ? (
                                        <span className="home-events__num">{ev.num}</span>
                                    ) : (
                                        <i className={`fas ${ev.icon}`} />
                                    )}
                                </span>
                                <span className="home-events__label">{ev.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="home-events__cta">
                        <Link
                            href={hasOnboarded ? '/my-event' : '/event-setup'}
                            className="home-events__btn"
                        >
                            {hasOnboarded ? 'האירוע שלי' : 'בואו נכיר את האירוע'}
                            <i className="fas fa-arrow-left" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            <BudgetInvite />

            {articles.length > 0 && (
                <section id="articles" className="articles-home-section">
                    <div className="container">
                        <div className="section-header">
                            <h2>מדריכים והשראה</h2>
                            <p>טיפים לתכנון האירוע — מהשטח של Fiesta</p>
                        </div>
                        <div className="articles-home-grid">
                            {articles.slice(0, 4).map((a) => (
                                <Link key={a.id} href={`/article/${a.id}`} className="article-home-card">
                                    <div className="article-home-img">
                                        <img src={a.image} alt={a.title || ''} loading="lazy" />
                                    </div>
                                    <div className="article-home-body">
                                        <h3>{a.title}</h3>
                                        {a.excerpt ? <p>{a.excerpt}</p> : null}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Final CTA */}
            <section id="contact" className="contact-section">
                <div className="container">
                    <div className="contact-card">
                        <div className="c-text">
                            <h2>בואו נבנה את האירוע שלכם</h2>
                            <p>השאירו פרטים — יועץ Fiesta יחזור אליכם עם ספקים, מחירים וליווי אישי.</p>
                            <div className="c-perks">
                                <span><i className="fas fa-check"></i> מענה מהיר</span>
                                <span><i className="fas fa-check"></i> ללא התחייבות</span>
                                <span><i className="fas fa-check"></i> חיסכון 5%–10%</span>
                            </div>
                        </div>
                        <form onSubmit={handleContactSubmit} className="c-form">
                            <input id="contact-name" name="name" type="text" autoComplete="name" placeholder="שם מלא" value={contactData.name} onChange={e => setContactData({...contactData, name: e.target.value})} required />
                            <input id="contact-phone" name="phone" type="tel" autoComplete="tel" placeholder="טלפון" value={contactData.phone} onChange={e => setContactData({...contactData, phone: e.target.value})} required />
                            <button type="submit">דברו איתי</button>
                        </form>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .home-container { background: var(--white); overflow-x: hidden; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }

                .home-section { padding: 72px 0; }
                .section-header { text-align: right; margin-bottom: 36px; }
                .section-header h2 {
                    font-size: clamp(1.6rem, 3vw, 2.1rem);
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: var(--text-dark);
                }
                .section-header p { color: var(--text-light); font-size: 1rem; margin: 0; }

                .articles-home-section { padding: 56px 0 72px; background: var(--off-white); border-top: 1px solid var(--border-color); }
                .articles-home-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 16px;
                }
                .article-home-card {
                    text-decoration: none;
                    background: #fff;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    color: inherit;
                    display: flex;
                    flex-direction: column;
                    min-height: 100%;
                }
                .article-home-img { height: 140px; background: #eee; }
                .article-home-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
                .article-home-body { padding: 14px 16px 18px; text-align: right; }
                .article-home-body h3 {
                    margin: 0 0 8px;
                    font-size: 1.05rem;
                    font-weight: 600;
                    color: var(--text-dark);
                    line-height: 1.35;
                }
                .article-home-body p {
                    margin: 0;
                    font-size: 0.88rem;
                    color: var(--text-light);
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .contact-section { padding: 72px 0 96px; background: var(--off-white); }
                .contact-card {
                    background: var(--white);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 48px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 48px;
                    align-items: center;
                }
                .c-text { text-align: right; }
                .c-text h2 {
                    font-size: clamp(1.6rem, 3vw, 2.2rem);
                    font-weight: 500;
                    margin-bottom: 12px;
                }
                .c-text p { font-size: 1.05rem; color: var(--text-light); margin-bottom: 20px; }
                .c-perks {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 14px 20px;
                    font-weight: 500;
                    color: var(--text-dark);
                    font-size: 0.9rem;
                }
                .c-perks i { color: var(--primary-color); margin-left: 6px; }
                .c-form { display: flex; flex-direction: column; gap: 12px; }
                .c-form input {
                    padding: 16px 18px;
                    border-radius: var(--radius-sm);
                    border: 1px solid #e5e2dc;
                    font-size: 1rem;
                    text-align: right;
                    font-family: inherit;
                    background: #fff;
                }
                .c-form input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }
                .c-form button {
                    background: var(--charcoal);
                    color: #fff;
                    border: none;
                    padding: 16px;
                    border-radius: var(--radius-sm);
                    font-weight: 600;
                    font-size: 1rem;
                    font-family: inherit;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .c-form button:hover { background: #000; }

                @media (max-width: 900px) {
                    .contact-card { grid-template-columns: 1fr; padding: 32px 20px; gap: 28px; }
                    .c-text, .section-header { text-align: center; }
                    .c-perks { justify-content: center; }
                }

                @media (max-width: 768px) {
                    .container { padding: 0 16px; }
                    .home-section { padding: 48px 0; }
                    .contact-section { padding: 48px 0 calc(var(--mobile-chrome-clearance, 64px) + 24px); }
                    .c-perks {
                        flex-direction: column;
                        align-items: center;
                        gap: 10px;
                    }
                }

                @media (max-width: 480px) {
                    .contact-card { padding: 24px 16px; }
                }
            `}</style>

            <AnimatePresence>
                {showOnboarding && (
                    <div className="onboarding-overlay">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="onboarding-card"
                        >
                            <div className="onboarding-header">
                                <h2>איזה אירוע חוגגים?</h2>
                                <p>נתאים לכם ספקים והטבות רלוונטיות</p>
                            </div>

                            <div className="onboarding-options">
                                {[
                                    { id: 'חתונה', label: 'חתונה' },
                                    { id: 'בר מצווה', label: 'בר מצווה' },
                                    { id: 'בת מצווה', label: 'בת מצווה' },
                                    { id: 'ברית', label: 'ברית' },
                                    { id: 'בריתה', label: 'בריתה' },
                                    { id: 'אירוע עסקי', label: 'אירוע עסקי' },
                                    { id: 'יום הולדת', label: 'יום הולדת' },
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        className="onboarding-opt-btn"
                                        onClick={() => startWithEvent(opt.id)}
                                    >
                                        <span className="opt-label">{opt.label}</span>
                                    </button>
                                ))}
                            </div>

                            <button className="onboarding-skip" onClick={() => setShowOnboarding(false)}>כרגע אני רק מסתכל...</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                .onboarding-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 10000; padding: 16px;
                }
                .onboarding-card {
                    background: white; width: 100%; max-width: 440px;
                    border-radius: 16px; padding: 36px 28px; text-align: center;
                    border: 1px solid rgba(0,0,0,0.06);
                    max-height: min(90vh, 720px); overflow-y: auto;
                }
                .onboarding-header h2 {
                    font-family: var(--font-display); font-size: 1.55rem; font-weight: 500;
                    margin-bottom: 8px; color: #141414;
                }
                .onboarding-header p { color: #6b6b6b; line-height: 1.5; margin-bottom: 28px; font-size: 0.95rem; }
                .onboarding-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 24px; }
                .onboarding-opt-btn {
                    background: #f7f6f4; border: 1px solid #e8e5df; padding: 18px 14px;
                    border-radius: 10px; cursor: pointer; transition: border-color 0.2s, background 0.2s;
                    display: flex; align-items: center; justify-content: center;
                    font-family: inherit; min-height: 56px;
                }
                .onboarding-opt-btn:hover { background: #fff; border-color: #8F7344; }
                .onboarding-opt-btn .opt-label { font-weight: 600; color: #141414; font-size: 0.95rem; }
                .onboarding-skip {
                    background: none; border: none; color: #9a9a9a; font-weight: 500;
                    cursor: pointer; font-size: 0.88rem; text-decoration: underline; padding: 12px;
                    font-family: inherit;
                }
                @media (max-width: 480px) {
                    .onboarding-card { padding: 28px 16px; }
                    .onboarding-header h2 { font-size: 1.3rem; }
                    .onboarding-opt-btn { padding: 14px 10px; min-height: 48px; }
                }
            `}}></style>
        </div>
    );
}
