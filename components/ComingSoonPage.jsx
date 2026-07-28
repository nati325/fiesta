'use client';

import Link from 'next/link';

export default function ComingSoonPage({
    title,
    subtitle,
    icon = 'fas fa-hammer',
}) {
    return (
        <div className="coming-soon-page">
            <div className="coming-soon-inner">
                <div className="icon-wrap" aria-hidden>
                    <i className={icon}></i>
                </div>
                <p className="badge">בקרוב</p>
                <h1>{title}</h1>
                <p className="subtitle">{subtitle}</p>
                <p className="status">העמוד בבנייה — נחזור אליכם עם מערכת מלאה בקרוב.</p>
                <Link href="/" className="home-btn">
                    חזרה לדף הבית
                </Link>
            </div>

            <style jsx>{`
                .coming-soon-page {
                    min-height: 100vh;
                    background: var(--off-white);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 120px 20px 100px;
                    text-align: center;
                }
                .coming-soon-inner {
                    max-width: 480px;
                    width: 100%;
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 48px 28px;
                }
                .icon-wrap {
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 20px;
                    border-radius: 14px;
                    background: var(--off-white);
                    border: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--charcoal);
                    font-size: 1.5rem;
                }
                .badge {
                    display: inline-block;
                    margin: 0 0 12px;
                    padding: 4px 12px;
                    border-radius: 6px;
                    background: var(--charcoal);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                }
                h1 {
                    font-family: var(--font-display);
                    font-size: clamp(1.6rem, 4vw, 2.1rem);
                    font-weight: 500;
                    color: var(--text-dark);
                    margin: 0 0 12px;
                }
                .subtitle {
                    color: var(--text-light);
                    font-size: 1rem;
                    line-height: 1.6;
                    margin: 0 0 20px;
                }
                .status {
                    color: var(--text-dark);
                    font-weight: 600;
                    font-size: 0.95rem;
                    margin: 0 0 28px;
                }
                .home-btn {
                    display: inline-block;
                    background: var(--charcoal);
                    color: white;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.95rem;
                }
                .home-btn:hover {
                    background: #000;
                }
                @media (max-width: 768px) {
                    .coming-soon-page {
                        padding: 100px 16px 120px;
                    }
                    .coming-soon-inner {
                        padding: 36px 20px;
                    }
                }
            `}</style>
        </div>
    );
}
