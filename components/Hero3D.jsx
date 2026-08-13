'use client';

import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import Link from 'next/link';

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

  return (
    <section ref={sectionRef} className="fiesta-hero" aria-label="Fiesta — הפקת אירועים">
      <div className="fiesta-hero__flowers" aria-hidden>
        <FlowerColumn side="left" reduce={reduce} />
        <FlowerColumn side="right" reduce={reduce} />
      </div>

      <div className="fiesta-hero__stage">
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

        <div className="fiesta-hero__content">
          <p className="fiesta-hero__kicker">הפקת אירועים</p>

          <h1 className="fiesta-hero__brand">Fiesta</h1>

          <div className="fiesta-hero__flourish" aria-hidden>
            <svg viewBox="0 0 140 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 9h46" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <path d="M86 9h46" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <path d="M70 2.2L73.8 9 70 15.8 66.2 9 70 2.2Z" fill="currentColor" />
              <path d="M62 9h6M72 9h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>

          <p className="fiesta-hero__lead">אירוע החלומות שלכם, בלי פשרות.</p>

          <div className="fiesta-hero__diamond" aria-hidden />

          <p className="fiesta-hero__sub">
            ספקים מובילים, מחירים בלעדיים וליווי מקצועי – בחינם.
          </p>

          <div className="fiesta-hero__actions">
            <button
              type="button"
              className="fiesta-hero__btn-primary"
              onClick={() =>
                document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              מצאו ספק
            </button>
            <Link href="/budget-planner" className="fiesta-hero__btn-secondary">
              מחשבון תקציב
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
