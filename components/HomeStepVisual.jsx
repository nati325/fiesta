'use client';

import { useReducedMotion } from 'framer-motion';

const GOLD = {
    light: '#e8d4a8',
    mid: '#c4a574',
    deep: '#8f7344',
    shadow: '#5c4a2e',
};

function PickVisual() {
    return (
        <svg viewBox="0 0 80 80" fill="none" aria-hidden>
            <defs>
                <linearGradient id="step-gold-a" x1="20" y1="10" x2="60" y2="70" gradientUnits="userSpaceOnUse">
                    <stop stopColor={GOLD.light} />
                    <stop offset="0.55" stopColor={GOLD.mid} />
                    <stop offset="1" stopColor={GOLD.deep} />
                </linearGradient>
            </defs>
            <rect x="18" y="22" width="36" height="44" rx="4" fill="url(#step-gold-a)" opacity="0.35" transform="rotate(-8 36 44)" />
            <rect x="24" y="16" width="36" height="44" rx="4" fill="url(#step-gold-a)" opacity="0.65" transform="rotate(4 42 38)" />
            <rect x="28" y="20" width="36" height="44" rx="4" fill="url(#step-gold-a)" stroke={GOLD.shadow} strokeWidth="1.2" />
            <circle cx="46" cy="34" r="6" stroke={GOLD.shadow} strokeWidth="1.5" fill="none" />
            <path d="M43 34h6M46 31v6" stroke={GOLD.shadow} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function CartVisual() {
    return (
        <svg viewBox="0 0 80 80" fill="none" aria-hidden>
            <defs>
                <linearGradient id="step-gold-b" x1="16" y1="18" x2="64" y2="68" gradientUnits="userSpaceOnUse">
                    <stop stopColor={GOLD.light} />
                    <stop offset="0.5" stopColor={GOLD.mid} />
                    <stop offset="1" stopColor={GOLD.deep} />
                </linearGradient>
            </defs>
            <path
                d="M22 28h36l-4 26H26L22 28Z"
                fill="url(#step-gold-b)"
                stroke={GOLD.shadow}
                strokeWidth="1.2"
                strokeLinejoin="round"
            />
            <path d="M30 28l3-8h14l3 8" stroke={GOLD.shadow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="32" cy="60" r="3" fill={GOLD.shadow} />
            <circle cx="48" cy="60" r="3" fill={GOLD.shadow} />
        </svg>
    );
}

function GuideVisual() {
    return (
        <svg viewBox="0 0 80 80" fill="none" aria-hidden>
            <defs>
                <linearGradient id="step-gold-c" x1="14" y1="16" x2="66" y2="64" gradientUnits="userSpaceOnUse">
                    <stop stopColor={GOLD.light} />
                    <stop offset="0.55" stopColor={GOLD.mid} />
                    <stop offset="1" stopColor={GOLD.deep} />
                </linearGradient>
            </defs>
            <path
                d="M18 22h40a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H34l-10 10v-10h-6a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6Z"
                fill="url(#step-gold-c)"
                stroke={GOLD.shadow}
                strokeWidth="1.2"
                strokeLinejoin="round"
            />
            <circle cx="30" cy="38" r="2.2" fill={GOLD.shadow} />
            <circle cx="40" cy="38" r="2.2" fill={GOLD.shadow} />
            <circle cx="50" cy="38" r="2.2" fill={GOLD.shadow} />
        </svg>
    );
}

function PiggyBody() {
    return (
        <svg viewBox="0 0 96 96" fill="none" aria-hidden className="home-how__piggy-art">
            <defs>
                <linearGradient id="step-gold-d" x1="24" y1="18" x2="72" y2="78" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f3e6c8" />
                    <stop offset="0.38" stopColor={GOLD.mid} />
                    <stop offset="1" stopColor={GOLD.deep} />
                </linearGradient>
                <linearGradient id="step-gold-d-snout" x1="36" y1="50" x2="60" y2="70" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#edd9b0" />
                    <stop offset="1" stopColor={GOLD.mid} />
                </linearGradient>
                <radialGradient id="step-gold-d-shine" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(38 40) rotate(25) scale(22 18)">
                    <stop stopColor="#fff9ef" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#fff9ef" stopOpacity="0" />
                </radialGradient>
            </defs>

            <rect x="38" y="71" width="9" height="8" rx="3" fill={GOLD.deep} />
            <rect x="53" y="71" width="9" height="8" rx="3" fill={GOLD.deep} />

            <ellipse cx="48" cy="50" rx="30" ry="27" fill="url(#step-gold-d)" stroke={GOLD.shadow} strokeWidth="1.4" />
            <ellipse cx="48" cy="50" rx="30" ry="27" fill="url(#step-gold-d-shine)" />

            <path d="M30 30c-2-8 6-12 10-4l-2 8-8-4Z" fill={GOLD.mid} stroke={GOLD.shadow} strokeWidth="1" strokeLinejoin="round" />
            <path d="M66 30c2-8-6-12-10-4l2 8 8-4Z" fill={GOLD.mid} stroke={GOLD.shadow} strokeWidth="1" strokeLinejoin="round" />

            <rect x="36" y="24" width="24" height="5" rx="2.5" fill={GOLD.shadow} opacity="0.85" />

            <circle cx="37" cy="44" r="2.6" fill={GOLD.shadow} />
            <circle cx="59" cy="44" r="2.6" fill={GOLD.shadow} />
            <circle cx="37.8" cy="43.2" r="0.9" fill="#fff9ef" opacity="0.8" />
            <circle cx="59.8" cy="43.2" r="0.9" fill="#fff9ef" opacity="0.8" />

            <ellipse cx="48" cy="58" rx="14" ry="11" fill="url(#step-gold-d-snout)" stroke={GOLD.shadow} strokeWidth="1.2" />
            <ellipse cx="43" cy="58" rx="2.2" ry="2.8" fill={GOLD.shadow} opacity="0.55" />
            <ellipse cx="53" cy="58" rx="2.2" ry="2.8" fill={GOLD.shadow} opacity="0.55" />

            <path
                d="M42 63.5c2.2 2.8 9.8 2.8 12 0"
                stroke={GOLD.shadow}
                strokeWidth="1.6"
                strokeLinecap="round"
                className="home-how__piggy-smile"
            />

            <path
                d="M74 48c6-1 8 4 4 7-3 2-5-1-3-4"
                stroke={GOLD.mid}
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}

function PiggyCoinFx() {
    return (
        <svg viewBox="0 0 96 96" fill="none" aria-hidden className="home-how__piggy-art">
            <defs>
                <linearGradient id="step-gold-d-coin" x1="42" y1="4" x2="54" y2="16" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fff3d4" />
                    <stop offset="0.5" stopColor={GOLD.light} />
                    <stop offset="1" stopColor={GOLD.mid} />
                </linearGradient>
                {/* hide coin below slot opening — looks like it sinks into the pig */}
                <clipPath id="step-piggy-slot-clip">
                    <rect x="28" y="0" width="40" height="24" />
                </clipPath>
            </defs>

            <g className="home-how__piggy-coin" clipPath="url(#step-piggy-slot-clip)">
                <circle cx="48" cy="10" r="5.5" fill="url(#step-gold-d-coin)" stroke={GOLD.shadow} strokeWidth="0.9" />
                <ellipse cx="46" cy="8.5" rx="2" ry="1" fill="#fff9ef" opacity="0.45" />
            </g>

            <g className="home-how__piggy-confetti" transform="translate(48 26)">
                <circle className="home-how__confetti home-how__confetti--1" cx="0" cy="0" r="3.2" fill={GOLD.light} />
                <rect className="home-how__confetti home-how__confetti--2" x="-2" y="-2" width="4" height="4" rx="0.7" fill={GOLD.mid} />
                <circle className="home-how__confetti home-how__confetti--3" cx="0" cy="0" r="2.8" fill="#f3e6c8" />
                <rect className="home-how__confetti home-how__confetti--4" x="-1.8" y="-1.8" width="3.6" height="3.6" rx="0.6" fill={GOLD.deep} />
                <circle className="home-how__confetti home-how__confetti--5" cx="0" cy="0" r="3" fill={GOLD.mid} />
                <rect className="home-how__confetti home-how__confetti--6" x="-2.2" y="-1.2" width="4.4" height="3" rx="0.6" fill={GOLD.light} />
                <circle className="home-how__confetti home-how__confetti--7" cx="0" cy="0" r="2.6" fill={GOLD.deep} />
                <rect className="home-how__confetti home-how__confetti--8" x="-1.5" y="-2.2" width="3" height="4.4" rx="0.6" fill="#edd9b0" />
            </g>
        </svg>
    );
}

const VISUALS = {
    pick: PickVisual,
    cart: CartVisual,
    guide: GuideVisual,
};

export default function HomeStepVisual({ kind, label }) {
    const reduce = useReducedMotion();
    const Visual = VISUALS[kind] || PickVisual;
    const motionClass = reduce ? '' : ` home-how__visual-inner--${kind}`;

    return (
        <div className={`home-how__visual${kind === 'piggy' ? ' home-how__visual--piggy' : ''}`} aria-hidden>
            {kind === 'piggy' ? (
                <>
                    <div className={`home-how__visual-inner${motionClass}`}>
                        <PiggyBody />
                    </div>
                    {!reduce && (
                        <div className="home-how__piggy-fx">
                            <PiggyCoinFx />
                        </div>
                    )}
                </>
            ) : (
                <div className={`home-how__visual-inner${motionClass}`}>
                    <Visual />
                </div>
            )}
            <span className="sr-only">{label}</span>
        </div>
    );
}
