'use client';

import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import BrandMark from '@/components/BrandMark';
import { useAuth } from '@/context/AuthContext';

/** Extra tiles only show on mobile (CSS); enough to reach the hero bottom. */
const FLOWER_COPIES = 7;

/**
 * Homepage hero — invitation arch + floral side columns.
 * Flowers are anchored to the full hero (screen edges), not the card.
 * On mobile, each side is a continuous overlapping cascade.
 */
function FlowerColumn({ side, reduce }) {
  const isLeft = side === 'left';
  const src = isLeft
    ? '/images/hero/flower-left.webp?v=8'
    : '/images/hero/flower-right.webp?v=8';

  const stackClass = reduce
    ? 'fiesta-hero__flower-stack'
    : 'fiesta-hero__flower-stack fiesta-hero__flower-motion';

  return (
    <div className={`fiesta-hero__flower fiesta-hero__flower--${side}`}>
      <div className={stackClass}>
        {Array.from({ length: FLOWER_COPIES }, (_, i) => (
          <div key={i} className="fiesta-hero__flower-tile">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              width={900}
              height={1200}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'low'}
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero3D({ onOpenOnboarding: _onOpenOnboarding }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const { hasOnboarded, eventReady, user } = useAuth();
  const returning = eventReady && hasOnboarded;
  const name = user?.name ? `, ${user.name}` : '';

  return (
    <section ref={sectionRef} className="fiesta-hero" aria-label="Fiesta — הפקת אירועים">
      <div className="fiesta-hero__bg" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="fiesta-hero__bg-img"
          src="/images/hero/hero-bg.jpg"
          alt=""
          width={853}
          height={1844}
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />
      </div>

      <div className="fiesta-hero__flowers" aria-hidden>
        <FlowerColumn side="left" reduce={reduce} />
        <FlowerColumn side="right" reduce={reduce} />
      </div>

      <div className="fiesta-hero__stage">
        <div className="fiesta-hero__content">
          <p className="fiesta-hero__kicker">הפקת אירועים</p>

          <BrandMark as="h1" variant="hero" className="fiesta-hero__brand" priority />

          <div className="fiesta-hero__flourish" aria-hidden>
            <svg viewBox="0 0 140 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 9h46" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <path d="M86 9h46" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <path d="M70 2.2L73.8 9 70 15.8 66.2 9 70 2.2Z" fill="currentColor" />
              <path d="M62 9h6M72 9h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>

          <p className="fiesta-hero__lead">
            {returning
              ? `ברוכים הבאים חזרה${name}`
              : 'חוסכים 5%–10% על ספקים לאירוע שלכם'}
          </p>

          <div className="fiesta-hero__diamond" aria-hidden />

          <p className="fiesta-hero__sub">
            {returning
              ? 'ממשיכים מאיפה שעצרתם — האירוע, הספקים והסל כבר מחכים.'
              : 'בוחרים ספקים, בונים סל, וסוגרים במחיר Fiesta — עם ליווי אישי בחינם.'}
          </p>

          <div className="fiesta-hero__actions">
            <Link
              href={returning ? '/my-event' : '/event-setup'}
              className="fiesta-hero__btn-primary"
            >
              {returning ? 'המשיכו מהנקודה האחרונה' : 'בואו נכיר את האירוע'}
            </Link>
            <Link
              href="/vendors"
              className="fiesta-hero__btn-secondary"
            >
              לכל הספקים
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
