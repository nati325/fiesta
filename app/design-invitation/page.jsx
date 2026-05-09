'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── Templates Definition ───────────────────────────────────────────────────
const TEMPLATES = [
    {
        id: 'gold-floral',
        name: 'פרחים זהב',
        bg: 'linear-gradient(135deg, #2c1a0e 0%, #1a0f0a 50%, #2c1a0e 100%)',
        accent: '#D4AF37',
        textColor: '#D4AF37',
        fontFamily: 'Assistant',
        preview: '🌹',
        description: 'אלגנטי ויוקרתי',
        borderStyle: '2px solid rgba(212,175,55,0.4)',
    },
    {
        id: 'white-minimal',
        name: 'מינימליסטי לבן',
        bg: 'linear-gradient(135deg, #ffffff 0%, #f8f5f0 100%)',
        accent: '#2c2c2c',
        textColor: '#2c2c2c',
        fontFamily: 'Assistant',
        preview: '🤍',
        description: 'נקי ומודרני',
        borderStyle: '1px solid #ddd',
    },
    {
        id: 'rose-garden',
        name: 'גן ורדים',
        bg: 'linear-gradient(135deg, #3d1c2e 0%, #1f0d1a 100%)',
        accent: '#e8a4c8',
        textColor: '#f5e0ef',
        fontFamily: 'Assistant',
        preview: '🌸',
        description: 'רומנטי ועדין',
        borderStyle: '1px solid rgba(232,164,200,0.4)',
    },
    {
        id: 'sage-green',
        name: 'ירוק טבעי',
        bg: 'linear-gradient(135deg, #1a2e1a 0%, #0f1f0f 100%)',
        accent: '#a8c89a',
        textColor: '#e8f0e8',
        fontFamily: 'Assistant',
        preview: '🌿',
        description: 'טבעי ורענן',
        borderStyle: '1px solid rgba(168,200,154,0.4)',
    },
    {
        id: 'royal-blue',
        name: 'כחול מלכותי',
        bg: 'linear-gradient(135deg, #0a1628 0%, #0d1f40 100%)',
        accent: '#c9a84c',
        textColor: '#e8d5a3',
        fontFamily: 'Assistant',
        preview: '💙',
        description: 'מרשים ומלכותי',
        borderStyle: '1px solid rgba(201,168,76,0.4)',
    },
    {
        id: 'blush-pink',
        name: 'ורוד בלאש',
        bg: 'linear-gradient(135deg, #f7e8e8 0%, #fdf0f0 100%)',
        accent: '#c4847a',
        textColor: '#5a2020',
        fontFamily: 'Assistant',
        preview: '🌷',
        description: 'רך ונשי',
        borderStyle: '1px solid rgba(196,132,122,0.3)',
    },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DesignInvitationPage() {
    const { user } = useAuth();
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
    const [fields, setFields] = useState({
        groomName: 'שם החתן',
        brideName: 'שם הכלה',
        date: 'יום שישי, כ׳ סיוון תשפ״ו',
        time: '19:00',
        venue: 'שם האולם, העיר',
        parents: 'בת למשפחה / בן למשפחה',
        extra: '',
    });
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const previewRef = useRef(null);

    const handleFieldChange = (key, value) => {
        setFields(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('/api/invitations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ template: selectedTemplate.id, fields }),
            });
            if (res.ok) setSaved(true);
        } catch (e) { }
        setSaving(false);
    };

    const handleDownload = () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        // Use html2canvas to capture and download
        import('html2canvas').then(({ default: html2canvas }) => {
            html2canvas(previewRef.current, { scale: 2, useCORS: true }).then(canvas => {
                const link = document.createElement('a');
                link.download = `הזמנה-${fields.groomName}-${fields.brideName}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0f0f0f', paddingTop: '80px' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)',
                borderBottom: '1px solid rgba(212,175,55,0.2)',
                padding: '20px 0',
                textAlign: 'center'
            }}>
                <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>
                    <i className="fas fa-arrow-right" style={{ marginLeft: '6px' }}></i>חזרה לדף הבית
                </Link>
                <h1 style={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.2rem)', margin: 0 }}>
                    ✉️ עצבו את ההזמנה שלכם
                </h1>
                <p style={{ color: '#888', margin: '8px 0 0', fontSize: '0.95rem' }}>
                    בחרו תבנית, ערכו את הפרטים, הורידו בחינם
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 0, maxWidth: '1400px', margin: '0 auto', minHeight: 'calc(100vh - 160px)' }}>
                {/* ─── Left Panel ─── */}
                <div style={{
                    background: '#1a1a1a',
                    borderLeft: '1px solid rgba(255,255,255,0.08)',
                    overflowY: 'auto',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '28px'
                }}>
                    {/* Template Picker */}
                    <div>
                        <h3 style={{ color: '#D4AF37', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
                            <i className="fas fa-palette" style={{ marginLeft: '8px' }}></i>תבנית
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTemplate(t)}
                                    style={{
                                        background: selectedTemplate.id === t.id ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                                        border: selectedTemplate.id === t.id ? '2px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        padding: '12px 8px',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                        color: selectedTemplate.id === t.id ? '#D4AF37' : '#aaa',
                                    }}
                                >
                                    <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{t.preview}</div>
                                    <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '2px' }}>{t.name}</div>
                                    <div style={{ fontSize: '0.68rem', opacity: 0.6 }}>{t.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fields */}
                    <div>
                        <h3 style={{ color: '#D4AF37', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
                            <i className="fas fa-pen" style={{ marginLeft: '8px' }}></i>עריכת טקסטים
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { key: 'groomName', label: 'שם החתן', icon: 'fa-male' },
                                { key: 'brideName', label: 'שם הכלה', icon: 'fa-female' },
                                { key: 'date', label: 'תאריך', icon: 'fa-calendar' },
                                { key: 'time', label: 'שעה', icon: 'fa-clock' },
                                { key: 'venue', label: 'מקום האירוע', icon: 'fa-map-marker-alt' },
                                { key: 'parents', label: 'שמות ההורים', icon: 'fa-users' },
                                { key: 'extra', label: 'הערה נוספת (אופציונלי)', icon: 'fa-comment' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ color: '#888', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <i className={`fas ${f.icon}`} style={{ color: '#D4AF37', width: '14px' }}></i>
                                        {f.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={fields[f.key]}
                                        onChange={e => handleFieldChange(f.key, e.target.value)}
                                        dir="rtl"
                                        style={{
                                            width: '100%',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            borderRadius: '8px',
                                            padding: '9px 12px',
                                            color: 'white',
                                            fontSize: '0.88rem',
                                            fontFamily: 'Assistant, sans-serif',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#D4AF37'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                        {!user && (
                            <div style={{
                                background: 'rgba(212,175,55,0.08)',
                                border: '1px solid rgba(212,175,55,0.25)',
                                borderRadius: '10px',
                                padding: '12px',
                                textAlign: 'center',
                                fontSize: '0.82rem',
                                color: '#bbb'
                            }}>
                                🔒 <Link href="/login" style={{ color: '#D4AF37', fontWeight: 700 }}>התחברו</Link> או{' '}
                                <Link href="/register" style={{ color: '#D4AF37', fontWeight: 700 }}>הרשמו</Link> כדי לשמור ולהוריד
                            </div>
                        )}
                        <button
                            onClick={handleDownload}
                            style={{
                                background: 'linear-gradient(135deg, #D4AF37, #b8952a)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '13px',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontFamily: 'Assistant, sans-serif',
                            }}
                        >
                            <i className="fas fa-download"></i>
                            הורידו כתמונה (PNG)
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || saved}
                            style={{
                                background: saved ? '#2d6a2d' : 'rgba(255,255,255,0.07)',
                                color: saved ? '#7dcf7d' : '#ccc',
                                border: `1px solid ${saved ? '#2d6a2d' : 'rgba(255,255,255,0.15)'}`,
                                borderRadius: '10px',
                                padding: '11px',
                                fontSize: '0.88rem',
                                fontWeight: 600,
                                cursor: saving ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontFamily: 'Assistant, sans-serif',
                                transition: 'all 0.3s',
                            }}
                        >
                            <i className={`fas ${saved ? 'fa-check' : saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
                            {saved ? 'נשמר בחשבונך ✓' : saving ? 'שומר...' : 'שמור בחשבוני'}
                        </button>
                    </div>
                </div>

                {/* ─── Canvas Preview ─── */}
                <div style={{
                    background: '#111',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    minHeight: '100%'
                }}>
                    <motion.div
                        key={selectedTemplate.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        ref={previewRef}
                        style={{
                            width: '500px',
                            minHeight: '700px',
                            background: selectedTemplate.bg,
                            border: selectedTemplate.borderStyle,
                            borderRadius: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '50px 40px',
                            textAlign: 'center',
                            fontFamily: 'Assistant, sans-serif',
                            direction: 'rtl',
                            position: 'relative',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                            gap: '0',
                        }}
                    >
                        {/* Top Decorative Line */}
                        <div style={{
                            width: '80%',
                            height: '1px',
                            background: `linear-gradient(to left, transparent, ${selectedTemplate.accent}, transparent)`,
                            marginBottom: '30px'
                        }} />

                        {/* Star Separator */}
                        <div style={{ color: selectedTemplate.accent, fontSize: '1.2rem', marginBottom: '20px', letterSpacing: '0.5em' }}>
                            ✦ ✦ ✦
                        </div>

                        {/* Intro */}
                        <p style={{ color: selectedTemplate.accent, fontSize: '0.9rem', marginBottom: '14px', opacity: 0.8, fontWeight: 400, letterSpacing: '0.05em' }}>
                            בשמחה רבה מזמינים אתכם לחגוג עמנו
                        </p>

                        {/* Names */}
                        <div style={{ marginBottom: '10px' }}>
                            <div style={{
                                color: selectedTemplate.textColor,
                                fontSize: '2.6rem',
                                fontWeight: 800,
                                lineHeight: 1.1,
                                textShadow: `0 0 30px ${selectedTemplate.accent}40`
                            }}>
                                {fields.groomName}
                            </div>
                            <div style={{ color: selectedTemplate.accent, fontSize: '1.4rem', margin: '6px 0', opacity: 0.7 }}>
                                &
                            </div>
                            <div style={{
                                color: selectedTemplate.textColor,
                                fontSize: '2.6rem',
                                fontWeight: 800,
                                lineHeight: 1.1,
                                textShadow: `0 0 30px ${selectedTemplate.accent}40`
                            }}>
                                {fields.brideName}
                            </div>
                        </div>

                        {/* Parents */}
                        {fields.parents && (
                            <p style={{ color: selectedTemplate.accent, fontSize: '0.82rem', marginTop: '12px', opacity: 0.7, fontStyle: 'italic' }}>
                                {fields.parents}
                            </p>
                        )}

                        {/* Divider */}
                        <div style={{
                            width: '60%',
                            height: '1px',
                            background: `linear-gradient(to left, transparent, ${selectedTemplate.accent}, transparent)`,
                            margin: '24px auto'
                        }} />

                        {/* Wedding Text */}
                        <p style={{ color: selectedTemplate.textColor, fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px', opacity: 0.9 }}>
                            לחתונתנו
                        </p>

                        {/* Date & Time */}
                        <div style={{
                            background: `${selectedTemplate.accent}15`,
                            border: `1px solid ${selectedTemplate.accent}40`,
                            borderRadius: '8px',
                            padding: '16px 30px',
                            marginBottom: '16px',
                            width: '80%',
                        }}>
                            <div style={{ color: selectedTemplate.accent, fontSize: '1.1rem', fontWeight: 700 }}>
                                📅 {fields.date}
                            </div>
                            <div style={{ color: selectedTemplate.textColor, fontSize: '1rem', marginTop: '6px', opacity: 0.85 }}>
                                ⏰ קבלת פנים: {fields.time}
                            </div>
                        </div>

                        {/* Venue */}
                        <div style={{ color: selectedTemplate.textColor, fontSize: '1rem', opacity: 0.85, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                            <span>📍</span>
                            <span>{fields.venue}</span>
                        </div>

                        {/* Extra note */}
                        {fields.extra && (
                            <p style={{ color: selectedTemplate.accent, fontSize: '0.82rem', opacity: 0.75, fontStyle: 'italic', marginTop: '8px' }}>
                                {fields.extra}
                            </p>
                        )}

                        {/* Bottom Decorative */}
                        <div style={{ color: selectedTemplate.accent, fontSize: '1rem', marginTop: '24px', letterSpacing: '0.5em', opacity: 0.6 }}>
                            ✦ ✦ ✦
                        </div>
                        <div style={{
                            width: '80%',
                            height: '1px',
                            background: `linear-gradient(to left, transparent, ${selectedTemplate.accent}, transparent)`,
                            marginTop: '20px'
                        }} />

                        {/* Fiesta Watermark */}
                        <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', color: selectedTemplate.accent, fontSize: '0.65rem', opacity: 0.4, letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>
                            DESIGNED WITH FIESTA ✦
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ─── Auth Modal ─── */}
            <AnimatePresence>
                {showAuthModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAuthModal(false)}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 9999, backdropFilter: 'blur(6px)'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: '#1a1a1a',
                                border: '1px solid rgba(212,175,55,0.3)',
                                borderRadius: '20px',
                                padding: '40px',
                                maxWidth: '380px',
                                width: '90%',
                                textAlign: 'center',
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔐</div>
                            <h3 style={{ color: '#D4AF37', fontSize: '1.4rem', marginBottom: '12px' }}>
                                כמעט שם!
                            </h3>
                            <p style={{ color: '#aaa', marginBottom: '28px', lineHeight: 1.6 }}>
                                כדי לשמור ולהוריד את ההזמנה שלכם,
                                <br />צריך חשבון חינמי ב-Fiesta
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Link
                                    href="/register"
                                    style={{
                                        background: 'linear-gradient(135deg, #D4AF37, #b8952a)',
                                        color: 'white',
                                        padding: '13px',
                                        borderRadius: '10px',
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        fontSize: '1rem',
                                        display: 'block'
                                    }}
                                >
                                    הרשמה חינמית 🎉
                                </Link>
                                <Link
                                    href="/login"
                                    style={{
                                        background: 'rgba(255,255,255,0.07)',
                                        color: '#ccc',
                                        padding: '11px',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        display: 'block'
                                    }}
                                >
                                    יש לי חשבון - התחבר
                                </Link>
                                <button
                                    onClick={() => setShowAuthModal(false)}
                                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.85rem', marginTop: '4px' }}
                                >
                                    המשך לעצב ללא שמירה
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
