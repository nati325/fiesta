'use client';

import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

/**
 * Homepage hero — brand stage with premium floral framing.
 * Entrance fade + continuous idle float (no mouse tracking).
 */
export default function Hero3D({ onOpenOnboarding: _onOpenOnboarding }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} className="fiesta-hero" aria-label="Fiesta — הפקת אירועים">
      <div className="fiesta-hero__bg" aria-hidden />

      <div className="fiesta-hero__flowers" aria-hidden>
        <div className="fiesta-hero__flower fiesta-hero__flower--left">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28, x: -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 1.05, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={reduce ? 'fiesta-hero__flower-stack' : 'fiesta-hero__flower-stack fiesta-hero__flower-motion'}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero/flower-left.webp?v=3"
                alt=""
                width={900}
                height={1200}
                decoding="async"
                fetchPriority="high"
                draggable={false}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero/flower-left.webp?v=3"
                alt=""
                width={900}
                height={1200}
                decoding="async"
                draggable={false}
              />
            </div>
          </motion.div>
        </div>

        <div className="fiesta-hero__flower fiesta-hero__flower--right">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 1.05, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={reduce ? 'fiesta-hero__flower-stack' : 'fiesta-hero__flower-stack fiesta-hero__flower-motion'}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero/flower-right.webp?v=3"
                alt=""
                width={900}
                height={1200}
                decoding="async"
                fetchPriority="high"
                draggable={false}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero/flower-right.webp?v=3"
                alt=""
                width={900}
                height={1200}
                decoding="async"
                draggable={false}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="fiesta-hero__content">
        <motion.p
          className="fiesta-hero__kicker"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          הפקת אירועים
        </motion.p>

        <motion.h1
          className="fiesta-hero__brand"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          Fiesta
        </motion.h1>

        <motion.div
          className="fiesta-hero__rule"
          aria-hidden
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        />

        <motion.p
          className="fiesta-hero__lead"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.4 }}
        >
          אירוע החלומות שלכם, בלי פשרות.
        </motion.p>

        <motion.p
          className="fiesta-hero__sub"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          ספקים מובילים, מחירים בלעדיים וליווי מקצועי — בחינם.
        </motion.p>

        <motion.div
          className="fiesta-hero__actions"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
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
        </motion.div>
      </div>

      <motion.div
        className="fiesta-hero__scroll"
        aria-hidden
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <span className="fiesta-hero__scroll-line" />
      </motion.div>
    </section>
  );
}
