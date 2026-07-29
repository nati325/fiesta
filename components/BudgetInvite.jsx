'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';

const COIN_SRC = '/images/shekel-coin.webp?v=7';

/** Fall lanes across the full stage — denser rain of shekels */
const COIN_LANES = [
    { left: '2%',  size: 34, duration: 9.4, delay: 0.2,  drift: 14,  spin: 1 },
    { left: '6%',  size: 56, duration: 7.2, delay: 0,    drift: 18,  spin: 1 },
    { left: '10%', size: 28, duration: 10.8, delay: 2.4, drift: -10, spin: -1 },
    { left: '14%', size: 42, duration: 8.6, delay: 1.4,  drift: -22, spin: -1 },
    { left: '18%', size: 68, duration: 6.8, delay: 0.8,  drift: 16,  spin: 1 },
    { left: '23%', size: 36, duration: 9.0, delay: 3.1,  drift: 8,   spin: -1 },
    { left: '28%', size: 50, duration: 7.6, delay: 1.8,  drift: -14, spin: 1 },
    { left: '33%', size: 30, duration: 11.2, delay: 4.2, drift: 20,  spin: -1 },
    { left: '38%', size: 58, duration: 8.1, delay: 0.5,  drift: -8,  spin: 1 },
    { left: '43%', size: 26, duration: 10.0, delay: 2.8, drift: 12,  spin: -1 },
    { left: '48%', size: 46, duration: 7.9, delay: 1.1,  drift: -18, spin: 1 },
    { left: '53%', size: 62, duration: 6.5, delay: 3.5,  drift: 10,  spin: -1 },
    { left: '58%', size: 32, duration: 9.7, delay: 0.9,  drift: -16, spin: 1 },
    { left: '63%', size: 54, duration: 7.4, delay: 2.2,  drift: 14,  spin: -1 },
    { left: '68%', size: 40, duration: 8.8, delay: 4.0,  drift: -12, spin: 1 },
    { left: '73%', size: 70, duration: 6.6, delay: 1.6,  drift: 8,   spin: -1 },
    { left: '78%', size: 48, duration: 8.3, delay: 0.3,  drift: -20, spin: 1 },
    { left: '83%', size: 34, duration: 9.5, delay: 2.6,  drift: 18,  spin: -1 },
    { left: '87%', size: 60, duration: 7.0, delay: 1.0,  drift: -10, spin: 1 },
    { left: '91%', size: 38, duration: 10.4, delay: 3.8, drift: 16,  spin: -1 },
    { left: '95%', size: 52, duration: 7.7, delay: 2.0,  drift: -14, spin: 1 },
    { left: '98%', size: 28, duration: 11.0, delay: 0.6, drift: 10,  spin: -1 },
];

/**
 * Homepage tools slide — dark stage with falling shekels, copy in the scene.
 * Carousel shell comes later; this is the first frame look.
 */
export default function BudgetInvite() {
    const reduce = useReducedMotion();
    const coins = useMemo(() => COIN_LANES, []);

    return (
        <section className="budget-invite" aria-labelledby="budget-invite-title">
            <div className="budget-invite__stage" aria-hidden>
                {!reduce &&
                    coins.map((coin, i) => (
                        <span
                            key={i}
                            className="budget-invite__coin"
                            style={{
                                left: coin.left,
                                width: coin.size,
                                height: coin.size,
                                '--fall-duration': `${coin.duration}s`,
                                '--fall-delay': `${coin.delay}s`,
                                '--coin-drift': `${coin.drift}px`,
                                '--coin-spin': coin.spin > 0 ? '1' : '-1',
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={COIN_SRC} alt="" width={coin.size} height={coin.size} draggable={false} />
                        </span>
                    ))}
            </div>

            <div className="budget-invite__container">
                <div className="budget-invite__copy">
                    <p className="budget-invite__kicker">כלי תכנון של Fiesta</p>
                    <h2 id="budget-invite-title">מה נכנס בתקציב שלכם?</h2>
                    <p className="budget-invite__lead">
                        הזינו סכום ובחרו קטגוריות — המחשבון ירכיב שילוב ספקים שנשאר בתוך המסגרת.
                    </p>
                    <Link href="/budget-planner" className="budget-invite__cta">
                        פתחו את מחשבון התקציב
                        <i className="fas fa-arrow-left" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
