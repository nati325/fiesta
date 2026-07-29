'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';

const COIN_SRC = '/images/shekel-coin.webp?v=7';

/** Predefined fall lanes — varied size, speed, and spin for depth */
const COIN_LANES = [
    { left: '6%',  size: 56, duration: 7.2, delay: 0,    drift: 18,  spin: 1 },
    { left: '14%', size: 38, duration: 9.1, delay: 1.4,  drift: -22, spin: -1 },
    { left: '22%', size: 72, duration: 6.4, delay: 0.6,  drift: 12,  spin: 1 },
    { left: '78%', size: 64, duration: 7.8, delay: 0.3,  drift: -16, spin: -1 },
    { left: '86%', size: 44, duration: 8.6, delay: 2.1,  drift: 20,  spin: 1 },
    { left: '92%', size: 52, duration: 6.9, delay: 1.0,  drift: -10, spin: -1 },
    { left: '4%',  size: 32, duration: 10.2, delay: 3.2, drift: 14,  spin: 1 },
    { left: '96%', size: 36, duration: 9.4, delay: 2.8,  drift: -18, spin: -1 },
    { left: '11%', size: 48, duration: 7.5, delay: 4.0,  drift: 8,   spin: -1 },
    { left: '88%', size: 58, duration: 8.0, delay: 3.6,  drift: -12, spin: 1 },
];

/**
 * Homepage tools slide — dark stage, glass card, falling shekel coins.
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
                <div className="budget-invite__card">
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
