'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const CANVAS_W = 600;
const CANVAS_H = 840;

const STEPS = [
    { id: 'template', label: 'בחירת תבנית', num: 1 },
    { id: 'content', label: 'תוכן', num: 2 },
    { id: 'design', label: 'עיצוב', num: 3 },
    { id: 'export', label: 'הורדה', num: 4 },
];

const FONTS = [
    { id: 'Heebo', name: 'Heebo' },
    { id: 'Assistant', name: 'Assistant' },
    { id: 'Rubik', name: 'Rubik' },
    { id: 'Frank Ruhl Libre', name: 'Frank Ruhl' },
    { id: 'David Libre', name: 'David' },
    { id: 'Alef', name: 'Alef' },
    { id: 'Secular One', name: 'Secular' },
    { id: 'Varela Round', name: 'Varela' },
    { id: 'Amatic SC', name: 'Amatic' },
    { id: 'Miriam Libre', name: 'Miriam' },
    { id: 'Noto Serif Hebrew', name: 'Noto Serif' },
    { id: 'Bellefair', name: 'Bellefair' },
];

const IMAGE_TEMPLATES = [
    { id: 'new-1', name: 'יוקרה קלאסית', url: '/invitation-templates/new-tpl-1.jpeg' },
    { id: 'new-2', name: 'בוטני עדין', url: '/invitation-templates/new-tpl-2.jpeg' },
    { id: 'new-3', name: 'מינימליזם', url: '/invitation-templates/new-tpl-3.jpeg' },
    { id: 'new-4', name: 'זהב מלכותי', url: '/invitation-templates/new-tpl-4.jpeg' },
    { id: 'new-5', name: 'רטרו שיק', url: '/invitation-templates/new-tpl-5.jpeg' },
    { id: 'new-6', name: 'מודרני', url: '/invitation-templates/new-tpl-6.jpeg' },
    { id: 'tpl-1', name: 'בוטיק משי', url: '/invitation-templates/tpl-1.png' },
    { id: 'tpl-2', name: 'זהב עתיק', url: '/invitation-templates/tpl-2.png' },
    { id: 'tpl-3', name: 'פרחים', url: '/invitation-templates/tpl-3.png' },
    { id: 'tpl-4', name: 'פרימיום', url: '/invitation-templates/tpl-4.png' },
    { id: 'tpl-5', name: 'טבע', url: '/invitation-templates/tpl-5.png' },
    { id: 'tpl-6', name: 'שיש', url: '/invitation-templates/tpl-6.png' },
    { id: 'tpl-7', name: 'זהב עדין', url: '/invitation-templates/tpl-7.png' },
    { id: 'tpl-8', name: 'פלטינום', url: '/invitation-templates/tpl-8.png' },
    ...Array.from({ length: 15 }, (_, i) => ({
        id: `missing-${i + 1}`,
        name: `קולקציה ${i + 1}`,
        url: `/invitation-templates/missing-photo-${i + 1}.jpeg`,
    })),
];

const DEFAULT_DATA = {
    bsd: 'בס"ד',
    intro: '',
    names: '',
    date: '',
    times: '',
    location: '',
    groomParents: '',
    brideParents: '',
};

const DEFAULT_LAYOUT = [
    { id: 'bsd', top: 95, fontSize: 15 },
    { id: 'intro', top: 170, fontSize: 17 },
    { id: 'names', top: 285, fontSize: 46 },
    { id: 'date', top: 400, fontSize: 21 },
    { id: 'times', top: 450, fontSize: 18 },
    { id: 'location', top: 505, fontSize: 20 },
    { id: 'brideParents', top: 600, fontSize: 14, left: 420, originX: 'center', textAlign: 'center' },
    { id: 'groomParents', top: 600, fontSize: 14, left: 180, originX: 'center', textAlign: 'center' },
];

const ARCH_LAYOUT = [
    { id: 'bsd', top: 130, fontSize: 14 },
    { id: 'intro', top: 195, fontSize: 16 },
    { id: 'names', top: 300, fontSize: 44 },
    { id: 'date', top: 420, fontSize: 20 },
    { id: 'times', top: 470, fontSize: 17 },
    { id: 'location', top: 525, fontSize: 18 },
    { id: 'brideParents', top: 620, fontSize: 13, left: 410, originX: 'center', textAlign: 'center' },
    { id: 'groomParents', top: 620, fontSize: 13, left: 190, originX: 'center', textAlign: 'center' },
];

const OPEN_LAYOUT = [
    { id: 'bsd', top: 110, fontSize: 15 },
    { id: 'intro', top: 185, fontSize: 17 },
    { id: 'names', top: 310, fontSize: 48 },
    { id: 'date', top: 430, fontSize: 21 },
    { id: 'times', top: 485, fontSize: 18 },
    { id: 'location', top: 545, fontSize: 20 },
    { id: 'brideParents', top: 640, fontSize: 14, left: 430, originX: 'center', textAlign: 'center' },
    { id: 'groomParents', top: 640, fontSize: 14, left: 170, originX: 'center', textAlign: 'center' },
];

const GOLD_LAYOUT = [
    { id: 'bsd', top: 240, fontSize: 15 },
    { id: 'intro', top: 295, fontSize: 17 },
    { id: 'names', top: 375, fontSize: 46 },
    { id: 'date', top: 470, fontSize: 20 },
    { id: 'times', top: 520, fontSize: 18 },
    { id: 'location', top: 570, fontSize: 19 },
    { id: 'brideParents', top: 655, fontSize: 13, left: 415, originX: 'center', textAlign: 'center' },
    { id: 'groomParents', top: 655, fontSize: 13, left: 185, originX: 'center', textAlign: 'center' },
];

const TEMPLATE_LAYOUTS = {
    'new-1': ARCH_LAYOUT,
    'new-2': ARCH_LAYOUT,
    'new-3': [
        { id: 'bsd', top: 150, fontSize: 14 },
        { id: 'intro', top: 215, fontSize: 16 },
        { id: 'names', top: 320, fontSize: 44 },
        { id: 'date', top: 440, fontSize: 20 },
        { id: 'times', top: 490, fontSize: 17 },
        { id: 'location', top: 545, fontSize: 18 },
        { id: 'brideParents', top: 640, fontSize: 13, left: 410, originX: 'center', textAlign: 'center' },
        { id: 'groomParents', top: 640, fontSize: 13, left: 190, originX: 'center', textAlign: 'center' },
    ],
    'new-4': GOLD_LAYOUT,
    'new-5': OPEN_LAYOUT,
    'new-6': OPEN_LAYOUT,
    'tpl-1': OPEN_LAYOUT,
    'tpl-2': GOLD_LAYOUT,
    'tpl-3': OPEN_LAYOUT,
    'tpl-4': GOLD_LAYOUT,
    'tpl-5': OPEN_LAYOUT,
    'tpl-6': OPEN_LAYOUT,
    'tpl-7': GOLD_LAYOUT,
    'tpl-8': GOLD_LAYOUT,
};

function getLayoutForTemplate(tplId) {
    if (TEMPLATE_LAYOUTS[tplId]) return TEMPLATE_LAYOUTS[tplId];
    if (String(tplId).startsWith('missing-')) return ARCH_LAYOUT;
    return DEFAULT_LAYOUT;
}

const COLOR_SCHEMES = [
    { id: 'ink', name: 'שחור עדין', fill: '#141414' },
    { id: 'brass', name: 'זהב על לבן', fill: '#8F7344' },
    { id: 'olive', name: 'ירוק זית', fill: '#5C6B4A' },
    { id: 'navy', name: 'כחול עמוק', fill: '#1E3A5F' },
    { id: 'burgundy', name: 'בורדו', fill: '#6B2D3C' },
    { id: 'charcoal', name: 'אפור פחם', fill: '#3D3D3D' },
];

const SIZE_PRESETS = [
    { id: 'small', name: 'קטן', scale: 0.88 },
    { id: 'regular', name: 'רגיל', scale: 1 },
    { id: 'large', name: 'גדול', scale: 1.14 },
];

const DRAFT_KEY = 'fiesta-invitation-draft-v1';
const PARENT_LABELS = {
    brideParents: 'הורי הכלה',
    groomParents: 'הורי החתן',
};

const FIELD_ORDER = ['bsd', 'intro', 'names', 'date', 'times', 'location', 'brideParents', 'groomParents'];

const FIELD_LABELS = {
    bsd: 'בס"ד',
    intro: 'משפט פתיחה',
    names: 'שמות החתן והכלה',
    date: 'תאריך',
    times: 'שעות',
    location: 'מיקום',
    groomParents: 'שם האב והאם של החתן',
    brideParents: 'שם האב והאם של הכלה',
};

const FIELD_PLACEHOLDERS = {
    bsd: 'בס"ד',
    intro: 'לדוגמה: נעלה את ירושלים על ראש שמחתנו',
    names: 'לדוגמה: נועה ודניאל',
    date: 'לדוגמה: יום שלישי, י״ד באלול',
    times: 'לדוגמה: קבלת פנים 19:30 | חופה 20:30',
    location: 'לדוגמה: אולם הגן, תל אביב',
    groomParents: 'לדוגמה: שלמה ורחל לוי',
    brideParents: 'לדוגמה: בני ושרה כהן',
};

const FIELD_HELP = {
    bsd: 'אופציונלי — אפשר למחוק אם לא רלוונטי',
    intro: 'משפט קצר בראש ההזמנה',
    names: 'השמות שיופיעו בגדול במרכז',
    date: 'תאריך האירוע בעברית',
    times: 'שעות קבלת פנים וחופה',
    location: 'שם האולם / הכתובת',
    groomParents: 'שמות הורי החתן — יופיעו בהזמנה',
    brideParents: 'שמות הורי הכלה — יופיעו בהזמנה',
};

function loadFabricScript() {
    return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && window.fabric) {
            resolve(window.fabric);
            return;
        }

        let settled = false;
        const ok = (fabric) => {
            if (settled) return;
            settled = true;
            resolve(fabric);
        };
        const fail = (err) => {
            if (settled) return;
            settled = true;
            reject(err instanceof Error ? err : new Error(String(err)));
        };

        const finish = () => {
            if (window.fabric) ok(window.fabric);
            else fail(new Error('Fabric.js loaded but window.fabric is missing'));
        };

        const existing = document.querySelector('script[data-fabric]');
        if (existing) {
            if (window.fabric) {
                ok(window.fabric);
                return;
            }
            existing.addEventListener('load', finish);
            existing.addEventListener('error', () => fail(new Error('Fabric.js failed to load')));
            // Already finished loading before listeners attached
            if (existing.dataset.loaded === '1') finish();
            return;
        }
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
        s.async = true;
        s.dataset.fabric = '1';
        s.onload = () => {
            s.dataset.loaded = '1';
            finish();
        };
        s.onerror = () => fail(new Error('Fabric.js failed to load'));
        document.head.appendChild(s);

        // Mobile networks / CDN stalls — don't hang forever on a blank editor
        setTimeout(() => {
            if (!window.fabric) fail(new Error('Fabric.js load timeout'));
        }, 15000);
    });
}

function TemplateThumb({ url, name }) {
    const [failed, setFailed] = useState(false);
    if (failed) {
        return (
            <div className="tpl-fallback" role="img" aria-label={`${name} — אין תצוגה`}>
                <i className="fas fa-image" aria-hidden />
                <span>אין תצוגה</span>
            </div>
        );
    }
    return (
        <img
            src={url}
            alt={name}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
        />
    );
}

function loadStudioFonts() {
    if (document.querySelector('link[data-studio-fonts]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.dataset.studioFonts = '1';
    l.href =
        'https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&family=Heebo:wght@400;600;700&family=Rubik:wght@400;700&family=Varela+Round&family=Secular+One&family=Alef:wght@400;700&family=Frank+Ruhl+Libre:wght@400;700&family=Amatic+SC:wght@400;700&family=David+Libre:wght@400;700&family=Miriam+Libre:wght@400;700&family=Noto+Serif+Hebrew:wght@400;700&family=Bellefair&display=swap';
    document.head.appendChild(l);
}

export default function DesignInvitationPage() {
    const fabricRef = useRef(null);
    const canvasElRef = useRef(null);
    const stageRef = useRef(null);
    const formDataRef = useRef(DEFAULT_DATA);
    const globalFontRef = useRef('Heebo');
    const textColorRef = useRef('#141414');
    const renderGenRef = useRef(0);
    const moveModeRef = useRef('line');
    const historyRef = useRef([]);
    const pushHistoryRef = useRef(() => {});
    const pendingHistoryPushRef = useRef(false);
    const baseSizesRef = useRef(null);

    const [step, setStep] = useState(0); // 0 template, 1 content, 2 design, 3 export
    const [fabricReady, setFabricReady] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState(DEFAULT_DATA);
    const [globalFont, setGlobalFont] = useState('Heebo');
    const [activeObject, setActiveObject] = useState(null);
    const [styleTick, setStyleTick] = useState(0);
    const [displayScale, setDisplayScale] = useState(0.55);
    const [exporting, setExporting] = useState(false);
    const [toast, setToast] = useState('');
    const [initError, setInitError] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [moveMode, setMoveMode] = useState('line'); // 'line' | 'all'
    const [nudgeStep, setNudgeStep] = useState(8);
    const [textAlignMode, setTextAlignMode] = useState('center'); // 'center' | 'right'
    const [textColor, setTextColor] = useState('#141414');
    const [colorSchemeId, setColorSchemeId] = useState('ink');
    const [canUndo, setCanUndo] = useState(false);
    const [sizePreset, setSizePreset] = useState('regular');
    const [showPhonePreview, setShowPhonePreview] = useState(false);
    const [draftSavedAt, setDraftSavedAt] = useState(null);
    const [sharing, setSharing] = useState(false);

    formDataRef.current = formData;
    globalFontRef.current = globalFont;
    textColorRef.current = textColor;
    moveModeRef.current = moveMode;

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2500);
    };

    const pushHistory = useCallback(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const texts = canvas
            .getObjects()
            .filter((o) => o.type === 'i-text' || o.type === 'text')
            .map((o) => ({
                fieldId: o.fieldId,
                left: o.left,
                top: o.top,
                fontSize: o.fontSize,
                fontFamily: o.fontFamily,
                fill: o.fill,
                textAlign: o.textAlign,
                originX: o.originX,
                text: o.text,
            }));
        if (!texts.length) return;
        historyRef.current.push({
            texts,
            globalFont: globalFontRef.current,
            textColor: textColorRef.current,
            textAlignMode,
            colorSchemeId,
        });
        if (historyRef.current.length > 40) historyRef.current.shift();
        setCanUndo(true);
    }, [textAlignMode, colorSchemeId]);

    pushHistoryRef.current = pushHistory;

    const undoLast = useCallback(() => {
        const canvas = fabricRef.current;
        if (!canvas || historyRef.current.length === 0) {
            showToast('אין מה לבטל');
            return;
        }
        const prev = historyRef.current.pop();
        setCanUndo(historyRef.current.length > 0);
        canvas.discardActiveObject();
        const byId = new Map(prev.texts.map((t) => [t.fieldId, t]));
        canvas.getObjects().forEach((o) => {
            if (o.type !== 'i-text' && o.type !== 'text') return;
            const snap = byId.get(o.fieldId);
            if (!snap) return;
            o.set({
                left: snap.left,
                top: snap.top,
                fontSize: snap.fontSize,
                fontFamily: snap.fontFamily,
                fill: snap.fill,
                textAlign: snap.textAlign,
                originX: snap.originX,
                text: snap.text,
            });
            o.setCoords();
        });
        if (prev.globalFont) {
            setGlobalFont(prev.globalFont);
            globalFontRef.current = prev.globalFont;
        }
        if (prev.textColor) {
            setTextColor(prev.textColor);
            textColorRef.current = prev.textColor;
        }
        if (prev.textAlignMode) setTextAlignMode(prev.textAlignMode);
        if (prev.colorSchemeId) setColorSchemeId(prev.colorSchemeId);
        setFormData((fd) => {
            const next = { ...fd };
            prev.texts.forEach((t) => {
                if (t.fieldId) next[t.fieldId] = t.text;
            });
            return next;
        });
        canvas.requestRenderAll();
        setActiveObject(null);
        setStyleTick((v) => v + 1);
        showToast('בוטל');
    }, []);

    useEffect(() => {
        document.body.classList.add('studio-mode');
        loadStudioFonts();
        return () => document.body.classList.remove('studio-mode');
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                if (step === 1 || step === 2) {
                    e.preventDefault();
                    undoLast();
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [step, undoLast]);

    const renderTemplate = useCallback((canvas, tpl) => {
        if (!canvas || !window.fabric || !tpl) return;
        const data = formDataRef.current;
        const font = globalFontRef.current;
        const fill = textColorRef.current;
        const gen = ++renderGenRef.current;

        // Hard reset — prevent leftover / raced duplicate text objects
        canvas.discardActiveObject();
        canvas.getObjects().slice().forEach((o) => canvas.remove(o));
        canvas.backgroundImage = null;
        canvas.backgroundColor = '#ffffff';
        canvas.requestRenderAll();
        historyRef.current = [];
        setCanUndo(false);

        window.fabric.Image.fromURL(
            tpl.url,
            (img) => {
                // Stale callback from an older render — ignore
                if (gen !== renderGenRef.current || !fabricRef.current || fabricRef.current !== canvas) return;
                if (!img) return;

                // Fit image INSIDE canvas (contain) — never crop half the invitation
                const scale = Math.min(CANVAS_W / img.width, CANVAS_H / img.height);
                const scaledW = img.width * scale;
                const scaledH = img.height * scale;
                img.set({
                    scaleX: scale,
                    scaleY: scale,
                    left: (CANVAS_W - scaledW) / 2,
                    top: (CANVAS_H - scaledH) / 2,
                    originX: 'left',
                    originY: 'top',
                    selectable: false,
                    evented: false,
                });
                canvas.setBackgroundImage(img, () => {
                    if (gen !== renderGenRef.current) return;
                    // Clear any objects that raced in while image loaded
                    canvas.getObjects().slice().forEach((o) => canvas.remove(o));

                    const layout = getLayoutForTemplate(tpl.id);
                    layout.forEach((field) => {
                        const originX = field.originX || 'center';
                        const textAlign = field.textAlign || 'center';
                        const left = field.left != null ? field.left : CANVAS_W / 2;

                        // Parent column labels (non-editable)
                        if (PARENT_LABELS[field.id]) {
                            const label = new window.fabric.Text(PARENT_LABELS[field.id], {
                                fieldId: `${field.id}__label`,
                                isParentLabel: true,
                                left,
                                top: field.top - 22,
                                fontSize: Math.max(11, Math.round(field.fontSize * 0.85)),
                                fontFamily: font,
                                fill,
                                opacity: 0.72,
                                textAlign,
                                originX,
                                originY: 'top',
                                selectable: false,
                                evented: false,
                                objectCaching: false,
                            });
                            canvas.add(label);
                        }

                        const t = new window.fabric.IText(data[field.id] || '', {
                            fieldId: field.id,
                            left,
                            top: field.top,
                            fontSize: field.fontSize,
                            fontFamily: font,
                            fill,
                            textAlign,
                            originX,
                            originY: 'top',
                            editable: true,
                            objectCaching: false,
                            lockScalingX: true,
                            lockScalingY: true,
                            lockRotation: true,
                            hasControls: false,
                            hasBorders: true,
                            borderColor: '#8F7344',
                            cornerColor: '#8F7344',
                            padding: 6,
                        });
                        canvas.add(t);
                    });
                    canvas.discardActiveObject();
                    canvas.requestRenderAll();
                    baseSizesRef.current = null;
                });
            },
            { crossOrigin: 'anonymous' }
        );
    }, []);

    /** Remove duplicate lines with the same fieldId (keeps the first / already-moved one). */
    const dedupeTextByField = useCallback(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const seen = new Set();
        canvas
            .getObjects()
            .filter((o) => o.type === 'i-text' || o.type === 'text')
            .forEach((o) => {
                const id = o.fieldId;
                if (!id) return;
                if (seen.has(id)) {
                    canvas.remove(o);
                } else {
                    seen.add(id);
                }
            });
    }, []);

    // Init fabric once (hidden until template chosen — still mount canvas)
    useEffect(() => {
        let disposed = false;
        let canvas;

        loadFabricScript()
            .then((fabric) => {
                if (disposed || !canvasElRef.current || fabricRef.current) {
                    if (fabricRef.current) setFabricReady(true);
                    return;
                }

                canvas = new fabric.Canvas(canvasElRef.current, {
                    width: CANVAS_W,
                    height: CANVAS_H,
                    backgroundColor: '#ffffff',
                    preserveObjectStacking: true,
                    selection: false,
                    allowTouchScrolling: true,
                });
                fabricRef.current = canvas;

                canvas.on('text:changed', (e) => {
                    if (e.target?.fieldId) {
                        setFormData((prev) => ({ ...prev, [e.target.fieldId]: e.target.text }));
                    }
                });
                const syncSelection = () => {
                    const active = canvas.getActiveObject();
                    if (!active || active.type === 'activeSelection') {
                        setActiveObject(null);
                        return;
                    }
                    if (active.fieldId) setActiveObject(active);
                    else setActiveObject(null);
                };
                canvas.on('selection:created', syncSelection);
                canvas.on('selection:updated', syncSelection);
                canvas.on('selection:cleared', () => setActiveObject(null));
                canvas.on('object:modified', () => {
                    // After drag — drop any accidental duplicates (keep first = moved line)
                    const seen = new Set();
                    canvas
                        .getObjects()
                        .filter((o) => o.type === 'i-text' || o.type === 'text')
                        .forEach((o) => {
                            if (!o.fieldId) return;
                            if (seen.has(o.fieldId)) canvas.remove(o);
                            else seen.add(o.fieldId);
                        });
                    canvas.requestRenderAll();
                    setStyleTick((v) => v + 1);
                });

                // Linked drag: in "all text" mode, moving one line moves every line
                let linkedDrag = null;
                canvas.on('mouse:down', (opt) => {
                    const t = opt.target;
                    pendingHistoryPushRef.current = !!(t && (t.type === 'i-text' || t.type === 'text'));
                    if (moveModeRef.current !== 'all' || !t || (t.type !== 'i-text' && t.type !== 'text')) {
                        linkedDrag = null;
                        return;
                    }
                    linkedDrag = { target: t, left: t.left || 0, top: t.top || 0 };
                });
                canvas.on('object:moving', (opt) => {
                    if (pendingHistoryPushRef.current) {
                        pushHistoryRef.current();
                        pendingHistoryPushRef.current = false;
                    }
                    const t = opt.target;
                    // Keep «הורי הכלה/חתן» labels glued above parent names
                    if (t?.fieldId && PARENT_LABELS[t.fieldId]) {
                        const label = canvas.getObjects().find((o) => o.fieldId === `${t.fieldId}__label`);
                        if (label) {
                            label.set({ left: t.left, top: (t.top || 0) - 22 });
                            label.setCoords();
                        }
                    }
                    if (moveModeRef.current !== 'all' || !linkedDrag) return;
                    if (!t || t !== linkedDrag.target) return;
                    const dx = (t.left || 0) - linkedDrag.left;
                    const dy = (t.top || 0) - linkedDrag.top;
                    linkedDrag = { target: t, left: t.left || 0, top: t.top || 0 };
                    if (!dx && !dy) return;
                    canvas.getObjects().forEach((o) => {
                        if (o === t) return;
                        if (o.type !== 'i-text' && o.type !== 'text') return;
                        o.set({
                            left: (o.left || 0) + dx,
                            top: (o.top || 0) + dy,
                        });
                        o.setCoords();
                    });
                });
                canvas.on('mouse:up', () => {
                    linkedDrag = null;
                    pendingHistoryPushRef.current = false;
                });

                setFabricReady(true);
            })
            .catch(() =>
                setInitError('לא הצלחנו לטעון את מנוע העריכה. בדקו את החיבור לרשת ורעננו את הדף.')
            );

        return () => {
            disposed = true;
            if (canvas) {
                canvas.dispose();
                fabricRef.current = null;
            }
        };
    }, []);

    // Scale invitation to fit the stage — full card visible, never clipped
    useEffect(() => {
        const updateScale = () => {
            const el = stageRef.current;
            if (!el || step === 0) return;
            const pad = 48;
            const availW = Math.max(200, el.clientWidth - pad);
            const availH = Math.max(260, el.clientHeight - pad);
            const s = Math.min(availW / CANVAS_W, availH / CANVAS_H);
            setDisplayScale(Math.max(0.28, Math.min(s, 0.95)));
        };
        // Wait a frame so layout is real after leaving parked mode
        const t = requestAnimationFrame(() => {
            updateScale();
            const canvas = fabricRef.current;
            if (canvas && step >= 1) {
                canvas.calcOffset();
                canvas.requestRenderAll();
            }
        });
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateScale) : null;
        if (ro && stageRef.current) ro.observe(stageRef.current);
        window.addEventListener('resize', updateScale);
        return () => {
            cancelAnimationFrame(t);
            window.removeEventListener('resize', updateScale);
            ro?.disconnect();
        };
    }, [step, fabricReady, selectedTemplate]);

    // When entering content/design — paint once if empty (never re-paint over moved text)
    useEffect(() => {
        if (step < 1 || !fabricReady || !selectedTemplate || !fabricRef.current) return;
        const canvas = fabricRef.current;
        dedupeTextByField();
        const hasText = canvas.getObjects().some((o) => o.type === 'i-text' || o.type === 'text');
        const hasBg = !!canvas.backgroundImage;
        if (!hasText || !hasBg) {
            renderTemplate(canvas, selectedTemplate);
        } else {
            canvas.calcOffset();
            canvas.requestRenderAll();
        }
    }, [step, fabricReady, selectedTemplate, renderTemplate, dedupeTextByField]);

    const selectTemplate = (tpl) => {
        setSelectedTemplate(tpl);
        if (fabricRef.current) renderTemplate(fabricRef.current, tpl);
    };

    const goNext = () => {
        if (step === 0 && !selectedTemplate) {
            showToast('בחרו תבנית כדי להמשיך');
            return;
        }
        if (step === 0 && (initError || !fabricReady)) {
            showToast(initError || 'מנוע העריכה עדיין נטען — נסו שוב בעוד רגע');
            return;
        }
        // Do NOT call renderTemplate again — races Image.fromURL and duplicates text lines.
        if (step === 2) {
            const canvas = fabricRef.current;
            if (canvas) {
                commitActiveSelection();
                canvas.requestRenderAll();
                setPreviewUrl(canvas.toDataURL({ format: 'png', multiplier: 1.5 }));
            }
        }
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
        setActiveObject(null);
    };

    const goBack = () => {
        setStep((s) => Math.max(s - 1, 0));
        setActiveObject(null);
    };

    const handleFormChange = (id, val) => {
        setFormData((prev) => ({ ...prev, [id]: val }));
        const canvas = fabricRef.current;
        if (!canvas) return;
        dedupeTextByField();
        const obj = canvas.getObjects().find((o) => o.fieldId === id);
        if (obj) {
            obj.set('text', val);
            canvas.requestRenderAll();
        }
    };

    const handleActiveStyleChange = (prop, val) => {
        const canvas = fabricRef.current;
        const active = canvas?.getActiveObject();
        if (!active) return;
        pushHistory();
        active.set(prop, val);
        canvas.requestRenderAll();
        setStyleTick((v) => v + 1);
        setActiveObject(active);
    };

    const handleGlobalFontChange = (fontId) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        pushHistory();
        setGlobalFont(fontId);
        dedupeTextByField();
        getAllStyledText().forEach((obj) => obj.set('fontFamily', fontId));
        canvas.requestRenderAll();
        setStyleTick((v) => v + 1);
        showToast(`גופן: ${fontId}`);
    };

    const applyTextColor = (fill, schemeId = 'custom') => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        pushHistory();
        setTextColor(fill);
        textColorRef.current = fill;
        setColorSchemeId(schemeId);
        dedupeTextByField();
        getAllStyledText().forEach((obj) => obj.set('fill', fill));
        canvas.requestRenderAll();
        setStyleTick((v) => v + 1);
    };

    const applyGlobalSize = (presetId) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const preset = SIZE_PRESETS.find((p) => p.id === presetId);
        if (!preset) return;
        const texts = getTextObjects();
        if (!texts.length) return;
        pushHistory();
        if (!baseSizesRef.current) {
            baseSizesRef.current = {};
            texts.forEach((o) => {
                baseSizesRef.current[o.fieldId] = o.fontSize;
            });
        }
        texts.forEach((o) => {
            const base = baseSizesRef.current[o.fieldId] || o.fontSize;
            o.set('fontSize', Math.max(10, Math.round(base * preset.scale)));
            o.setCoords();
        });
        // Scale parent labels too
        canvas.getObjects().forEach((o) => {
            if (!o.isParentLabel) return;
            const parentId = String(o.fieldId || '').replace('__label', '');
            const base = baseSizesRef.current[parentId];
            if (base) o.set('fontSize', Math.max(10, Math.round(base * 0.85 * preset.scale)));
        });
        setSizePreset(presetId);
        canvas.requestRenderAll();
        setStyleTick((v) => v + 1);
        showToast(`גודל: ${preset.name}`);
    };

    const TEXT_MARGIN_RIGHT = 72;
    const TEXT_CENTER_X = CANVAS_W / 2;

    const alignAllText = (mode) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        commitActiveSelection();
        const texts = getTextObjects();
        if (!texts.length) {
            showToast('אין טקסט ליישור');
            return;
        }
        pushHistory();
        setTextAlignMode(mode);
        texts.forEach((o) => {
            // Keep side-by-side parents relative when centering/righting main block
            const isParent = o.fieldId === 'brideParents' || o.fieldId === 'groomParents';
            if (mode === 'right') {
                if (isParent) {
                    const base = o.fieldId === 'brideParents' ? CANVAS_W - 100 : CANVAS_W - 260;
                    o.set({ originX: 'center', textAlign: 'center', left: base });
                } else {
                    o.set({
                        originX: 'right',
                        textAlign: 'right',
                        left: CANVAS_W - TEXT_MARGIN_RIGHT,
                    });
                }
            } else if (isParent) {
                o.set({
                    originX: 'center',
                    textAlign: 'center',
                    left: o.fieldId === 'brideParents' ? 420 : 180,
                });
            } else {
                o.set({
                    originX: 'center',
                    textAlign: 'center',
                    left: TEXT_CENTER_X,
                });
            }
            o.setCoords();
        });
        canvas.requestRenderAll();
        setStyleTick((v) => v + 1);
        showToast(mode === 'right' ? 'כל הטקסט מיושר לימין' : 'כל הטקסט ממורכז');
    };

    const getTextObjects = () => {
        const canvas = fabricRef.current;
        if (!canvas) return [];
        dedupeTextByField();
        return canvas
            .getObjects()
            .filter((o) => (o.type === 'i-text' || o.type === 'text') && o.fieldId && !o.isParentLabel);
    };

    const getAllStyledText = () => {
        const canvas = fabricRef.current;
        if (!canvas) return [];
        return canvas.getObjects().filter((o) => o.type === 'i-text' || o.type === 'text');
    };

    /** Commit ActiveSelection positions back onto individual lines (no ghosts). */
    const commitActiveSelection = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (active && active.type === 'activeSelection') {
            active.forEachObject?.(() => {});
            // Fabric: discard restores each child's absolute coords
            canvas.discardActiveObject();
        } else {
            canvas.discardActiveObject();
        }
        dedupeTextByField();
        canvas.requestRenderAll();
    };

    const selectTextLine = (fieldId) => {
        const canvas = fabricRef.current;
        if (!canvas || !window.fabric) return;
        setMoveMode('line');
        commitActiveSelection();
        const obj = getTextObjects().find((o) => o.fieldId === fieldId);
        if (!obj) return;
        canvas.setActiveObject(obj);
        canvas.requestRenderAll();
        setActiveObject(obj);
        setStyleTick((v) => v + 1);
    };

    const selectAllText = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        commitActiveSelection();
        const texts = getTextObjects();
        if (!texts.length) {
            showToast('אין טקסט להזזה');
            return;
        }
        // No ActiveSelection — it was cloning lines. Linked-drag moves all instead.
        canvas.discardActiveObject();
        texts.forEach((t) => t.set({ objectCaching: false }));
        if (texts[0]) {
            canvas.setActiveObject(texts[0]);
            setActiveObject(texts[0]);
        }
        canvas.requestRenderAll();
        setStyleTick((v) => v + 1);
        showToast('מצב כל הטקסט — גררו שורה אחת וכולן יזוזו יחד');
    };

    const applyMoveMode = (mode) => {
        setMoveMode(mode);
        moveModeRef.current = mode;
        if (mode === 'all') {
            selectAllText();
        } else {
            commitActiveSelection();
            setActiveObject(null);
        }
    };

    const nudgeSelection = (dx, dy) => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const texts = getTextObjects();
        if (!texts.length) {
            showToast('אין טקסט להזזה');
            return;
        }
        pushHistory();
        commitActiveSelection();
        // Move text lines + parent labels together
        canvas.getObjects().forEach((o) => {
            if ((o.type !== 'i-text' && o.type !== 'text') || !o.fieldId) return;
            o.set({
                left: (o.left || 0) + dx,
                top: (o.top || 0) + dy,
            });
            o.setCoords();
        });
        canvas.requestRenderAll();
        setStyleTick((v) => v + 1);
    };

    const captureInvitationPng = (multiplier = 2) => {
        const canvas = fabricRef.current;
        if (!canvas) return null;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        return canvas.toDataURL({ format: 'png', multiplier });
    };

    const downloadDataUrl = (dataUrl, filename) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const dataUrl = captureInvitationPng(2);
            if (!dataUrl) throw new Error('no canvas');
            downloadDataUrl(dataUrl, `fiesta-invitation-${Date.now()}.png`);
            showToast('ההזמנה הורדה בהצלחה');
        } catch {
            showToast('שגיאה בייצוא');
        } finally {
            setExporting(false);
        }
    };

    const handleExportStory = async () => {
        setExporting(true);
        try {
            const dataUrl = captureInvitationPng(2);
            if (!dataUrl) throw new Error('no canvas');
            const STORY_W = 1080;
            const STORY_H = 1920;
            const img = await new Promise((resolve, reject) => {
                const i = new Image();
                i.onload = () => resolve(i);
                i.onerror = reject;
                i.src = dataUrl;
            });
            const c = document.createElement('canvas');
            c.width = STORY_W;
            c.height = STORY_H;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#111111';
            ctx.fillRect(0, 0, STORY_W, STORY_H);
            const scale = Math.min(STORY_W / img.width, STORY_H / img.height) * 0.9;
            const w = img.width * scale;
            const h = img.height * scale;
            ctx.drawImage(img, (STORY_W - w) / 2, (STORY_H - h) / 2, w, h);
            downloadDataUrl(c.toDataURL('image/png'), `fiesta-story-${Date.now()}.png`);
            showToast('סטורי הורד (1080×1920)');
        } catch {
            showToast('שגיאה בייצוא סטורי');
        } finally {
            setExporting(false);
        }
    };

    const handleExportPdf = async () => {
        setExporting(true);
        try {
            const dataUrl = captureInvitationPng(2);
            if (!dataUrl) throw new Error('no canvas');

            const loadJsPdf = () =>
                new Promise((resolve, reject) => {
                    if (typeof window !== 'undefined' && window.jspdf?.jsPDF) {
                        resolve(window.jspdf.jsPDF);
                        return;
                    }
                    const existing = document.querySelector('script[data-jspdf]');
                    if (existing) {
                        existing.addEventListener('load', () => resolve(window.jspdf.jsPDF));
                        existing.addEventListener('error', reject);
                        return;
                    }
                    const s = document.createElement('script');
                    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                    s.async = true;
                    s.dataset.jspdf = '1';
                    s.onload = () => resolve(window.jspdf.jsPDF);
                    s.onerror = reject;
                    document.head.appendChild(s);
                });

            try {
                const jsPDF = await loadJsPdf();
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'pt',
                    format: [CANVAS_W, CANVAS_H],
                });
                pdf.addImage(dataUrl, 'PNG', 0, 0, CANVAS_W, CANVAS_H);
                pdf.save(`fiesta-invitation-${Date.now()}.pdf`);
                showToast('PDF הורד להדפסה');
            } catch {
                const w = window.open('');
                if (w) {
                    w.document.write(
                        `<html dir="rtl"><head><title>הזמנה</title></head><body style="margin:0;text-align:center;background:#fff"><img src="${dataUrl}" style="max-width:100%;height:auto"/><script>setTimeout(()=>print(),400)</script></body></html>`
                    );
                    w.document.close();
                    showToast('חלון הדפסה נפתח — שמרו כ־PDF');
                } else {
                    downloadDataUrl(dataUrl, `fiesta-invitation-print-${Date.now()}.png`);
                    showToast('הורד PNG להדפסה');
                }
            }
        } catch {
            showToast('שגיאה בייצוא PDF');
        } finally {
            setExporting(false);
        }
    };

    const saveDraft = () => {
        try {
            const texts = getTextObjects().map((o) => ({
                fieldId: o.fieldId,
                left: o.left,
                top: o.top,
                fontSize: o.fontSize,
                fontFamily: o.fontFamily,
                fill: o.fill,
                textAlign: o.textAlign,
                originX: o.originX,
                text: o.text,
            }));
            const payload = {
                formData,
                globalFont,
                textColor,
                textAlignMode,
                colorSchemeId,
                sizePreset,
                templateId: selectedTemplate?.id,
                texts,
                savedAt: Date.now(),
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
            setDraftSavedAt(payload.savedAt);
            showToast('הטיוטה נשמרה במכשיר');
        } catch {
            showToast('לא הצלחנו לשמור');
        }
    };

    const buildInviteText = () =>
        [
            'הזמנה לחתונה',
            formData.names,
            formData.date,
            formData.times,
            formData.location,
            '',
            'נשמח לראותכם!',
        ]
            .filter(Boolean)
            .join('\n');

    /** Convert canvas PNG → JPEG File (WhatsApp shares images more reliably as JPEG). */
    const invitationToImageFile = async () => {
        const pngUrl = captureInvitationPng(2);
        if (!pngUrl) return null;

        const img = await new Promise((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = pngUrl;
        });

        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0);

        const blob = await new Promise((resolve) => {
            c.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
        });
        if (!blob) {
            const pngBlob = await (await fetch(pngUrl)).blob();
            return new File([pngBlob], 'fiesta-invitation.png', { type: 'image/png' });
        }

        const safeName = String(formData.names || 'invitation')
            .replace(/[^\w\u0590-\u05FF\-]+/g, '-')
            .slice(0, 40);
        return new File([blob], `fiesta-${safeName || 'invitation'}.jpg`, { type: 'image/jpeg' });
    };

    /**
     * Share invitation AS IMAGE (not text).
     * Opens share sheet with the photo — pick WhatsApp to send the image.
     * Important: do NOT attach text alongside files — WhatsApp often drops the image.
     */
    const shareInvitationAsImage = async () => {
        const file = await invitationToImageFile();
        if (!file) {
            showToast('אין הזמנה לשיתוף');
            return false;
        }

        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            try {
                const payload = { files: [file], title: 'הזמנה' };
                const canFiles =
                    typeof navigator.canShare !== 'function' || navigator.canShare(payload);
                if (canFiles) {
                    await navigator.share(payload);
                    showToast('בחרו וואטסאפ — ההזמנה נשלחת כתמונה');
                    return true;
                }
            } catch (err) {
                if (err?.name === 'AbortError') return true;
            }
            try {
                await navigator.share({ files: [file] });
                showToast('בחרו וואטסאפ — ההזמנה נשלחת כתמונה');
                return true;
            } catch (err) {
                if (err?.name === 'AbortError') return true;
            }
        }

        try {
            if (navigator.clipboard && window.ClipboardItem) {
                await navigator.clipboard.write([new ClipboardItem({ [file.type]: file })]);
                window.open('https://web.whatsapp.com/', '_blank', 'noopener,noreferrer');
                showToast('התמונה הועתקה — הדביקו בוואטסאפ (Ctrl+V)');
                return true;
            }
        } catch {
            /* ignore */
        }

        const url = URL.createObjectURL(file);
        downloadDataUrl(url, file.name);
        URL.revokeObjectURL(url);
        window.open('https://wa.me/', '_blank', 'noopener,noreferrer');
        showToast('התמונה הורדה — בוואטסאפ: צרף ← בחרו את הקובץ');
        return false;
    };

    const shareDirect = async () => {
        setSharing(true);
        try {
            await shareInvitationAsImage();
        } catch {
            showToast('השיתוף נכשל — נסו שוב מהטלפון');
        } finally {
            setSharing(false);
        }
    };

    const shareWhatsApp = async () => {
        setSharing(true);
        try {
            await shareInvitationAsImage();
        } catch {
            showToast('לא ניתן לשתף תמונה מכאן — נסו מהטלפון');
        } finally {
            setSharing(false);
        }
    };

    const interactive = step === 1 || step === 2;
    const activeFill = typeof activeObject?.fill === 'string' ? activeObject.fill : '#141414';
    const activeFont = activeObject?.fontFamily || globalFont;
    const activeSize = Math.round(activeObject?.fontSize || 30);

    // Lock selection on export; enable multi-select drag on design
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const selectable = step === 1 || step === 2;
        canvas.selection = false; // never multi-box select — prevents Fabric clone bugs
        canvas.getObjects().forEach((o) => {
            const isText = o.type === 'i-text' || o.type === 'text';
            o.selectable = selectable && isText;
            o.evented = selectable && isText;
            o.lockMovementX = !selectable;
            o.lockMovementY = !selectable;
            if (isText) o.objectCaching = false;
        });
        if (!selectable) {
            canvas.discardActiveObject();
            setActiveObject(null);
        }
        canvas.requestRenderAll();
    }, [step]);

    return (
        <div className="studio" dir="rtl">
            <header className="topbar">
                <div className="topbar-start">
                    <Link href="/" className="back" aria-label="חזרה">
                        <i className="fas fa-arrow-right"></i>
                    </Link>
                    <div className="brand">
                        <span className="brand-a">Fiesta</span>
                        <span className="brand-b">Studio</span>
                    </div>
                </div>

                <div className="topbar-end">
                    {(step === 1 || step === 2) && (
                        <button
                            type="button"
                            className="btn-ghost"
                            onClick={undoLast}
                            disabled={!canUndo}
                            title="ביטול פעולה אחרונה"
                        >
                            ביטול
                        </button>
                    )}
                    {step === 3 && (
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={shareDirect}
                            disabled={sharing || exporting}
                        >
                            {sharing ? 'משתף…' : 'שיתוף ישיר'}
                        </button>
                    )}
                </div>
            </header>

            <div className={`workspace step-${STEPS[step].id}`}>
                {/* —— STEP 0: Templates —— */}
                {step === 0 && (
                    <section className="template-step">
                        {initError && (
                            <div className="studio-banner error" role="alert">
                                <strong>שגיאה בטעינת העורך</strong>
                                <span>{initError}</span>
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={() => window.location.reload()}
                                >
                                    רענון הדף
                                </button>
                            </div>
                        )}
                        <div className="step-intro">
                            <h1>בחרו תבנית להזמנה</h1>
                            <p>לאחר הבחירה תערכו את התוכן והעיצוב בשלבים הבאים</p>
                            <button
                                type="button"
                                className="btn-ghost draft-load"
                                onClick={() => {
                                    try {
                                        const raw = localStorage.getItem(DRAFT_KEY);
                                        if (!raw) {
                                            showToast('אין טיוטה שמורה');
                                            return;
                                        }
                                        const draft = JSON.parse(raw);
                                        if (draft.formData) setFormData(draft.formData);
                                        if (draft.globalFont) setGlobalFont(draft.globalFont);
                                        if (draft.textColor) setTextColor(draft.textColor);
                                        if (draft.colorSchemeId) setColorSchemeId(draft.colorSchemeId);
                                        if (draft.textAlignMode) setTextAlignMode(draft.textAlignMode);
                                        if (draft.sizePreset) setSizePreset(draft.sizePreset);
                                        if (draft.templateId) {
                                            const tpl = IMAGE_TEMPLATES.find((t) => t.id === draft.templateId);
                                            if (tpl) {
                                                setSelectedTemplate(tpl);
                                                if (fabricRef.current) {
                                                    setTimeout(() => {
                                                        renderTemplate(fabricRef.current, tpl);
                                                        setStep(1);
                                                        showToast('טיוטה נטענה');
                                                    }, 50);
                                                    return;
                                                }
                                            }
                                        }
                                        showToast('טיוטה נטענה — בחרו תבנית להמשך');
                                    } catch {
                                        showToast('לא הצלחנו לטעון טיוטה');
                                    }
                                }}
                            >
                                טעינת טיוטה שמורה
                            </button>
                        </div>
                        <div className="template-grid">
                            {IMAGE_TEMPLATES.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    className={`tpl ${selectedTemplate?.id === t.id ? 'active' : ''}`}
                                    onClick={() => selectTemplate(t)}
                                    onDoubleClick={() => {
                                        selectTemplate(t);
                                        setTimeout(() => setStep(1), 50);
                                    }}
                                >
                                    <div className="tpl-img-wrap">
                                        <TemplateThumb url={t.url} name={t.name} />
                                    </div>
                                    <span>{t.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className={`mobile-sticky-cta ${selectedTemplate ? 'visible' : ''}`}>
                            <button
                                type="button"
                                className="btn-primary full"
                                onClick={goNext}
                                disabled={!selectedTemplate}
                            >
                                {selectedTemplate
                                    ? `המשך עם “${selectedTemplate.name}”`
                                    : 'בחרו תבנית כדי להמשיך'}
                            </button>
                        </div>
                    </section>
                )}

                {/* —— STEPS 1–3: side panel —— */}
                {step >= 1 && (
                    <aside className="side-panel">
                        {step === 1 && (
                            <div className="panel-inner content-panel">
                                <div className="step-banner">
                                    <span className="step-banner-kicker">שלב 2 מתוך 4</span>
                                    <h2>מלאו את פרטי ההזמנה</h2>
                                    <p>
                                        כתבו כאן את השמות, התאריך והמיקום.
                                        <strong> כל שינוי מתעדכן מיד בהזמנה ליד.</strong>
                                    </p>
                                </div>

                                <div className="fields">
                                    {FIELD_ORDER.filter((id) => id !== 'brideParents' && id !== 'groomParents').map((id, idx) => (
                                        <div key={id} className="field">
                                            <label>
                                                <span className="field-idx">{idx + 1}</span>
                                                {FIELD_LABELS[id]}
                                            </label>
                                            <textarea
                                                rows={id === 'intro' ? 2 : 1}
                                                value={formData[id] || ''}
                                                placeholder={FIELD_PLACEHOLDERS[id]}
                                                onChange={(e) => handleFormChange(id, e.target.value)}
                                            />
                                            <span className="field-help">{FIELD_HELP[id]}</span>
                                        </div>
                                    ))}

                                    <div className="parents-block">
                                        <h3 className="parents-title">הורים — כמו בהזמנה אמיתית</h3>
                                        <div className="parents-grid">
                                            <div className="field">
                                                <label>
                                                    <span className="field-idx">7</span>
                                                    הורי הכלה
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={formData.brideParents || ''}
                                                    placeholder={FIELD_PLACEHOLDERS.brideParents}
                                                    onChange={(e) => handleFormChange('brideParents', e.target.value)}
                                                />
                                                <span className="field-help">יופיעו בעמודת ימין בהזמנה</span>
                                            </div>
                                            <div className="field">
                                                <label>
                                                    <span className="field-idx">8</span>
                                                    הורי החתן
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={formData.groomParents || ''}
                                                    placeholder={FIELD_PLACEHOLDERS.groomParents}
                                                    onChange={(e) => handleFormChange('groomParents', e.target.value)}
                                                />
                                                <span className="field-help">יופיעו בעמודת שמאל בהזמנה</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="panel-cta">
                                    <button type="button" className="btn-primary full" onClick={goNext}>
                                        סיימתי עם התוכן — המשך לעיצוב
                                    </button>
                                    <p className="panel-cta-note">אפשר לחזור לכאן בכל רגע ולתקן</p>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="panel-inner design-simple">
                                <div className="step-banner">
                                    <span className="step-banner-kicker">שלב 3 מתוך 4</span>
                                    <h2>עיצוב ההזמנה</h2>
                                    <p>גופן, צבע, גודל, מיקום והזזה — ואפשר לבטל בכל רגע.</p>
                                </div>

                                <div className="simple-block">
                                    <div className="simple-num">1</div>
                                    <div className="simple-body">
                                        <h3>גופן</h3>
                                        <select
                                            className="font-select"
                                            value={globalFont}
                                            onChange={(e) => handleGlobalFontChange(e.target.value)}
                                            style={{ fontFamily: globalFont }}
                                        >
                                            {FONTS.map((f) => (
                                                <option key={f.id} value={f.id} style={{ fontFamily: f.id }}>
                                                    {f.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="simple-block">
                                    <div className="simple-num">2</div>
                                    <div className="simple-body">
                                        <h3>צבע טקסט</h3>
                                        <div className="scheme-grid">
                                            {COLOR_SCHEMES.map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    className={`scheme-chip ${colorSchemeId === s.id ? 'active' : ''}`}
                                                    onClick={() => applyTextColor(s.fill, s.id)}
                                                >
                                                    <span className="scheme-swatch" style={{ background: s.fill }} />
                                                    <span>{s.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <label className="custom-color">
                                            <span>צבע מותאם</span>
                                            <input
                                                type="color"
                                                value={textColor}
                                                onChange={(e) => applyTextColor(e.target.value, 'custom')}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="simple-block">
                                    <div className="simple-num">3</div>
                                    <div className="simple-body">
                                        <h3>גודל לכל הטקסט</h3>
                                        <div className="align-mode size-presets">
                                            {SIZE_PRESETS.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    className={`mode-btn ${sizePreset === p.id ? 'active' : ''}`}
                                                    onClick={() => applyGlobalSize(p.id)}
                                                >
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="simple-block">
                                    <div className="simple-num">4</div>
                                    <div className="simple-body">
                                        <h3>מיקום על ההזמנה</h3>
                                        <div className="align-mode">
                                            <button
                                                type="button"
                                                className={`mode-btn ${textAlignMode === 'center' ? 'active' : ''}`}
                                                onClick={() => alignAllText('center')}
                                            >
                                                ממורכז
                                            </button>
                                            <button
                                                type="button"
                                                className={`mode-btn ${textAlignMode === 'right' ? 'active' : ''}`}
                                                onClick={() => alignAllText('right')}
                                            >
                                                לימין
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="simple-block">
                                    <div className="simple-num">5</div>
                                    <div className="simple-body">
                                        <h3>הזזה קלה</h3>
                                        <p className="simple-tip">החצים מזיזים את כל הטקסט. אפשר גם ללחוץ על שורה בהזמנה ולגרור אותה. ביטול למעלה בסרגל.</p>
                                        <div className="nudge-wrap" dir="ltr">
                                            <div className="nudge-pad" role="group" aria-label="הזזת טקסט">
                                                <span className="nudge-empty" aria-hidden="true" />
                                                <button type="button" className="nudge-btn" onClick={() => nudgeSelection(0, -12)} aria-label="למעלה">
                                                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 5l7 8H5l7-8z" fill="currentColor"/></svg>
                                                </button>
                                                <span className="nudge-empty" aria-hidden="true" />
                                                <button type="button" className="nudge-btn" onClick={() => nudgeSelection(-12, 0)} aria-label="שמאלה">
                                                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12l8-7v14l-8-7z" fill="currentColor"/></svg>
                                                </button>
                                                <button type="button" className="nudge-btn nudge-btn-down" onClick={() => nudgeSelection(0, 12)} aria-label="למטה">
                                                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 19l-7-8h14l-7 8z" fill="currentColor"/></svg>
                                                </button>
                                                <button type="button" className="nudge-btn" onClick={() => nudgeSelection(12, 0)} aria-label="ימינה">
                                                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M19 12l-8 7V5l8 7z" fill="currentColor"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {activeObject?.fieldId && (
                                    <div className="simple-block accent">
                                        <div className="simple-num">·</div>
                                        <div className="simple-body">
                                            <h3>גודל השורה שנבחרה</h3>
                                            <p className="simple-tip">{FIELD_LABELS[activeObject.fieldId] || 'שורה'}</p>
                                            <div className="size-row">
                                                <button type="button" onClick={() => handleActiveStyleChange('fontSize', activeSize - 2)}>קטן יותר</button>
                                                <span>{activeSize}</span>
                                                <button type="button" onClick={() => handleActiveStyleChange('fontSize', activeSize + 2)}>גדול יותר</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="panel-cta">
                                    <button type="button" className="btn-primary full" onClick={goNext}>
                                        נראה טוב — המשך להורדה
                                    </button>
                                    <p className="panel-cta-note">אפשר לחזור לכאן בכל רגע</p>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="panel-inner export-panel">
                                <div className="step-banner">
                                    <span className="step-banner-kicker">שלב 4 מתוך 4</span>
                                    <h2>ההזמנה מוכנה</h2>
                                    <p>שתפו ישר לחברים, או הורידו קובץ למכשיר.</p>
                                </div>

                                <button
                                    type="button"
                                    className="btn-primary full btn-share"
                                    onClick={shareDirect}
                                    disabled={sharing || exporting}
                                >
                                    {sharing ? 'פותח שיתוף תמונה…' : 'שיתוף ישיר כתמונה'}
                                </button>
                                <p className="share-hint">נפתח תפריט שיתוף עם תמונת ההזמנה — בחרו וואטסאפ לשליחה</p>

                                <button
                                    type="button"
                                    className="btn-ghost full"
                                    onClick={() => {
                                        const url = captureInvitationPng(1.5);
                                        if (url) setPreviewUrl(url);
                                        setShowPhonePreview(true);
                                    }}
                                >
                                    תצוגה מקדימה בטלפון
                                </button>

                                <div className="export-actions">
                                    <button type="button" className="btn-ghost full" onClick={shareWhatsApp} disabled={sharing || exporting}>
                                        שליחה לוואטסאפ כתמונה
                                    </button>
                                    <button type="button" className="btn-ghost full" onClick={handleExport} disabled={exporting}>
                                        {exporting ? 'מוריד…' : 'הורדת PNG'}
                                    </button>
                                    <button type="button" className="btn-ghost full" onClick={handleExportPdf} disabled={exporting}>
                                        הורדת PDF להדפסה
                                    </button>
                                    <button type="button" className="btn-ghost full" onClick={handleExportStory} disabled={exporting}>
                                        הורדת סטורי (1080×1920)
                                    </button>
                                    <button type="button" className="btn-ghost full" onClick={saveDraft}>
                                        שמירה במכשיר
                                        {draftSavedAt ? ` · נשמר` : ''}
                                    </button>
                                </div>

                                <button type="button" className="btn-ghost full" onClick={() => setStep(1)}>
                                    חזרה לעריכת תוכן
                                </button>
                                <button type="button" className="btn-ghost full" onClick={() => setStep(2)}>
                                    חזרה לעיצוב
                                </button>
                            </div>
                        )}
                    </aside>
                )}

                {/* Canvas stage — ALWAYS mounted so Fabric survives step changes */}
                <section
                    className={`stage ${step === 0 ? 'stage-parked' : ''}`}
                    ref={stageRef}
                    aria-hidden={step === 0}
                >
                    {initError && step > 0 && (
                        <div className="stage-msg error" role="alert">
                            <div className="stage-error-box">
                                <strong>לא ניתן להציג את העורך</strong>
                                <p>{initError}</p>
                                <button type="button" className="btn-ghost" onClick={() => window.location.reload()}>
                                    רענון הדף
                                </button>
                            </div>
                        </div>
                    )}
                    {!fabricReady && !initError && step > 0 && (
                        <div className="stage-msg">טוען את ההזמנה…</div>
                    )}

                    {step >= 1 && (
                        <div className="preview-label">
                            <span>תצוגה חיה של ההזמנה</span>
                            <small>
                                {step === 1 && 'הטקסט שאתם כותבים מופיע כאן מיד'}
                                {step === 2 && 'לחצו על שורה וגררו · או הזיזו עם החצים'}
                                {step === 3 && 'כך תיראה הקובץ שתורידו'}
                            </small>
                        </div>
                    )}

                    <div
                        className={`invite-viewport ${interactive ? 'editable' : ''}`}
                        style={{
                            width: CANVAS_W * displayScale,
                            height: CANVAS_H * displayScale,
                        }}
                    >
                        <div
                            className="invite-scaler"
                            style={{
                                width: CANVAS_W,
                                height: CANVAS_H,
                                transform: `scale(${displayScale})`,
                                transformOrigin: 'top left',
                            }}
                        >
                            <canvas ref={canvasElRef} />
                        </div>
                    </div>
                </section>
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        className="toast"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating progress dock */}
            <nav className="progress-dock" aria-label="התקדמות בעיצוב">
                <div className="dock-inner">
                    <button
                        type="button"
                        className="dock-nav"
                        onClick={goBack}
                        disabled={step === 0}
                        aria-label="שלב קודם"
                    >
                        הקודם
                    </button>

                    <div className="dock-center">
                        <div className="dock-track" role="list">
                            {STEPS.map((s, i) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    role="listitem"
                                    className={`dock-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
                                    aria-label={`${s.label}${i === step ? ' (נוכחי)' : ''}`}
                                    aria-current={i === step ? 'step' : undefined}
                                    onClick={() => {
                                        if (i === 0) setStep(0);
                                        else if (i > 0 && selectedTemplate && i <= step) setStep(i);
                                    }}
                                    disabled={i > 0 && !selectedTemplate}
                                >
                                    <span className="dock-dot-core">{s.num}</span>
                                </button>
                            ))}
                        </div>
                        <div className="dock-meta">
                            <span className="dock-step-label">{STEPS[step].label}</span>
                            <span className="dock-step-count">{step + 1} / {STEPS.length}</span>
                        </div>
                        <div className="dock-bar" aria-hidden="true">
                            <div
                                className="dock-bar-fill"
                                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {step < 3 ? (
                        <button type="button" className="dock-nav dock-nav-primary" onClick={goNext}>
                            {step === 0 ? 'המשך' : step === 1 ? 'לעיצוב' : 'להורדה'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="dock-nav dock-nav-primary"
                            onClick={shareDirect}
                            disabled={sharing || exporting}
                        >
                            {sharing ? '…' : 'שיתוף'}
                        </button>
                    )}
                </div>
            </nav>

            <AnimatePresence>
                {showPhonePreview && (
                    <motion.div
                        className="phone-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPhonePreview(false)}
                    >
                        <motion.div
                            className="phone-sheet"
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="phone-sheet-head">
                                <strong>תצוגה בוואטסאפ</strong>
                                <button type="button" className="btn-ghost" onClick={() => setShowPhonePreview(false)}>
                                    סגור
                                </button>
                            </div>
                            <div className="phone-frame">
                                <div className="phone-notch" />
                                <div className="wa-chat">
                                    <div className="wa-bubble">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="תצוגת הזמנה" className="wa-invite-img" />
                                        ) : (
                                            <p className="wa-fallback">טוען תצוגה…</p>
                                        )}
                                        <p className="wa-caption">
                                            {formData.names}
                                            <br />
                                            {formData.date}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-primary full btn-share"
                                style={{ marginTop: 14 }}
                                onClick={() => {
                                    setShowPhonePreview(false);
                                    shareDirect();
                                }}
                                disabled={sharing}
                            >
                                {sharing ? 'משתף…' : 'שיתוף ישיר עכשיו'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .studio {
                    min-height: 100vh;
                    background: #f3f2ef;
                    color: #141414;
                    font-family: var(--font-heebo), Heebo, sans-serif;
                    display: flex;
                    flex-direction: column;
                    padding-bottom: calc(88px + env(safe-area-inset-bottom));
                }
                .topbar {
                    height: 52px;
                    background: #fff;
                    border-bottom: 1px solid rgba(0,0,0,0.08);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 0 14px;
                    position: sticky;
                    top: 0;
                    z-index: 40;
                }
                .topbar-start, .topbar-end {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-shrink: 0;
                }
                .back {
                    width: 44px;
                    height: 44px;
                    border-radius: 8px;
                    background: #f7f6f4;
                    border: 1px solid rgba(0,0,0,0.08);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: #141414;
                    text-decoration: none;
                }
                .brand { display: flex; align-items: baseline; gap: 8px; }
                .brand-a {
                    font-family: var(--font-frank), 'Frank Ruhl Libre', serif;
                    font-size: 1.3rem;
                    font-weight: 700;
                }
                .brand-b {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #8F7344;
                }
                .progress-dock {
                    position: fixed;
                    left: 50%;
                    bottom: calc(14px + env(safe-area-inset-bottom));
                    transform: translateX(-50%);
                    z-index: 60;
                    width: min(520px, calc(100vw - 24px));
                    pointer-events: none;
                }
                .dock-inner {
                    pointer-events: auto;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.92);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(0,0,0,0.08);
                    border-radius: 18px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.12);
                }
                .dock-nav {
                    flex-shrink: 0;
                    min-width: 64px;
                    height: 44px;
                    padding: 0 12px;
                    border-radius: 12px;
                    border: 1px solid #e5e2dc;
                    background: #fff;
                    font-family: inherit;
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    color: #333;
                }
                .dock-nav:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }
                .dock-nav-primary {
                    background: #111;
                    color: #fff;
                    border-color: #111;
                }
                .dock-nav-primary:disabled {
                    opacity: 0.5;
                }
                .dock-center {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                }
                .dock-track {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .dock-dot {
                    border: none;
                    background: transparent;
                    padding: 0;
                    cursor: pointer;
                }
                .dock-dot:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }
                .dock-dot-core {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.72rem;
                    font-weight: 700;
                    background: #ebe8e2;
                    color: #777;
                    transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
                }
                .dock-dot.done .dock-dot-core {
                    background: #d4c4a8;
                    color: #111;
                }
                .dock-dot.active .dock-dot-core {
                    background: #111;
                    color: #fff;
                    transform: scale(1.08);
                }
                .dock-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.75rem;
                    line-height: 1;
                }
                .dock-step-label {
                    font-weight: 700;
                    color: #111;
                }
                .dock-step-count {
                    color: #999;
                    font-variant-numeric: tabular-nums;
                }
                .dock-bar {
                    width: 100%;
                    max-width: 180px;
                    height: 3px;
                    border-radius: 999px;
                    background: #ebe8e2;
                    overflow: hidden;
                }
                .dock-bar-fill {
                    height: 100%;
                    background: #8F7344;
                    border-radius: 999px;
                    transition: width 0.25s ease;
                }

                .btn-primary, .btn-ghost {
                    border: none;
                    border-radius: 8px;
                    padding: 10px 16px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    font-family: inherit;
                    cursor: pointer;
                }
                .btn-primary { background: #111; color: #fff; }
                .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
                .btn-ghost {
                    background: #f7f6f4;
                    color: #141414;
                    border: 1px solid rgba(0,0,0,0.08);
                }
                .btn-primary.full, .btn-ghost.full { width: 100%; }

                .workspace {
                    flex: 1;
                    min-height: 0;
                    display: flex;
                    background: #f3f2ef;
                }
                .workspace.step-template {
                    display: block;
                    overflow: auto;
                    -webkit-overflow-scrolling: touch;
                    overscroll-behavior: contain;
                }

                .studio-banner {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: center;
                    gap: 10px 14px;
                    margin: 0 0 18px;
                    padding: 12px 14px;
                    border-radius: 12px;
                    text-align: center;
                    font-size: 0.88rem;
                    line-height: 1.45;
                }
                .studio-banner.error {
                    background: #fdecea;
                    color: #8a1f11;
                    border: 1px solid #f5c6cb;
                }
                .studio-banner strong {
                    display: block;
                    width: 100%;
                    font-size: 0.95rem;
                }

                .template-step {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 28px 20px 120px;
                    min-height: min(70vh, 640px);
                }
                .step-intro {
                    text-align: center;
                    margin-bottom: 28px;
                }
                .step-intro h1 {
                    font-family: var(--font-frank), 'Frank Ruhl Libre', serif;
                    font-weight: 500;
                    font-size: clamp(1.5rem, 3vw, 2rem);
                    margin: 0 0 8px;
                    color: #141414;
                }
                .step-intro p { color: #6b6b6b; margin: 0 0 10px; }
                .draft-load { margin-top: 4px; }
                .template-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 14px;
                }
                .tpl {
                    border: 2px solid transparent;
                    background: #fff;
                    border-radius: 12px;
                    overflow: hidden;
                    padding: 0;
                    cursor: pointer;
                    text-align: center;
                    font-family: inherit;
                    box-shadow: 0 1px 0 rgba(0,0,0,0.04);
                }
                .tpl-img-wrap {
                    aspect-ratio: 600 / 840;
                    background: #e8e6e1;
                    overflow: hidden;
                    position: relative;
                }
                .tpl-img-wrap :global(img) {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    display: block;
                    background: #f7f6f4;
                }
                .tpl-img-wrap :global(.tpl-fallback) {
                    width: 100%;
                    height: 100%;
                    min-height: 120px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    background: #ebe8e2;
                    color: #888;
                    font-size: 0.78rem;
                    font-weight: 600;
                }
                .tpl-img-wrap :global(.tpl-fallback i) {
                    font-size: 1.4rem;
                    opacity: 0.7;
                }
                .tpl span {
                    display: block;
                    padding: 10px 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #141414;
                }
                .tpl.active {
                    border-color: #111;
                }
                .mobile-sticky-cta {
                    display: none;
                }

                .side-panel {
                    width: 380px;
                    flex-shrink: 0;
                    background: #fff;
                    border-left: 1px solid rgba(0,0,0,0.08);
                    overflow-y: auto;
                }
                .panel-inner { padding: 22px 18px 40px; }
                .panel-inner h2 {
                    font-family: var(--font-frank), 'Frank Ruhl Libre', serif;
                    font-weight: 500;
                    font-size: 1.35rem;
                    margin: 0 0 6px;
                }
                .step-banner {
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(0,0,0,0.08);
                }
                .step-banner-kicker {
                    display: inline-block;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    color: #8F7344;
                    margin-bottom: 8px;
                }
                .step-banner h2 { margin-bottom: 8px; }
                .step-banner p {
                    margin: 0;
                    color: #555;
                    font-size: 0.9rem;
                    line-height: 1.55;
                }
                .step-banner strong { color: #111; font-weight: 700; }
                .hint { color: #6b6b6b; font-size: 0.88rem; margin: 0 0 18px; }
                .subh {
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin: 18px 0 10px;
                    font-family: inherit;
                }
                .fields { display: flex; flex-direction: column; gap: 16px; }
                .field label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 6px;
                }
                .field-idx {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 22px;
                    height: 22px;
                    border-radius: 6px;
                    background: #111;
                    color: #fff;
                    font-size: 0.72rem;
                    font-weight: 700;
                    flex-shrink: 0;
                }
                .field textarea {
                    width: 100%;
                    border: 1px solid #e5e2dc;
                    border-radius: 8px;
                    padding: 11px 12px;
                    font-family: inherit;
                    font-size: 0.92rem;
                    resize: vertical;
                    background: #fafafa;
                    text-align: right;
                    min-height: 42px;
                    line-height: 1.4;
                }
                .field textarea::placeholder {
                    color: #aaa;
                    font-size: 0.85rem;
                }
                .field textarea:focus {
                    outline: none;
                    border-color: #8F7344;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(143,115,68,0.12);
                }
                .field-help {
                    display: block;
                    margin-top: 5px;
                    font-size: 0.75rem;
                    color: #888;
                    line-height: 1.35;
                }
                .panel-cta {
                    margin-top: 24px;
                    padding-top: 18px;
                    border-top: 1px solid rgba(0,0,0,0.08);
                    position: sticky;
                    bottom: 0;
                    background: linear-gradient(to top, #fff 85%, transparent);
                    padding-bottom: 4px;
                }
                .panel-cta .btn-primary { width: 100%; }
                .panel-cta-note {
                    margin: 10px 0 0;
                    text-align: center;
                    font-size: 0.78rem;
                    color: #999;
                }
                .btn-primary.full, .btn-ghost.full { width: 100%; }
                .preview-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    margin-bottom: 14px;
                    text-align: center;
                }
                .preview-label span {
                    font-size: 0.78rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    color: #111;
                    background: #fff;
                    border: 1px solid rgba(0,0,0,0.1);
                    padding: 6px 14px;
                    border-radius: 999px;
                }
                .preview-label small {
                    font-size: 0.78rem;
                    color: #777;
                }
                .pick-box {
                    margin-top: 16px;
                    padding: 14px 14px 12px;
                    background: #f7f6f4;
                    border-radius: 10px;
                    border: 1px dashed #d4d0c8;
                }
                .pick-box strong {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 0.88rem;
                }
                .pick-box p {
                    margin: 0 0 10px;
                    font-size: 0.84rem;
                    color: #555;
                    line-height: 1.55;
                }
                .pick-box ol {
                    margin: 0;
                    padding-right: 18px;
                    font-size: 0.84rem;
                    color: #555;
                    line-height: 1.65;
                }
                .move-mode {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 14px;
                }
                .align-mode {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 0;
                }
                .section-hint {
                    margin: -4px 0 10px;
                    font-size: 0.78rem;
                    color: #888;
                    line-height: 1.4;
                }
                .design-simple .simple-block {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                    margin-bottom: 18px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                }
                .design-simple .simple-block.accent {
                    background: #f7f6f4;
                    border: 1px solid #e5e2dc;
                    border-radius: 10px;
                    padding: 12px;
                    border-bottom: none;
                }
                .simple-num {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    background: #111;
                    color: #fff;
                    font-size: 0.85rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .simple-body {
                    flex: 1;
                    min-width: 0;
                }
                .simple-body h3 {
                    margin: 2px 0 10px;
                    font-size: 0.95rem;
                    font-weight: 700;
                    font-family: inherit;
                }
                .simple-tip {
                    margin: 0 0 12px;
                    font-size: 0.8rem;
                    color: #666;
                    line-height: 1.45;
                }
                .font-select {
                    width: 100%;
                    padding: 12px 14px;
                    border: 1px solid #e5e2dc;
                    border-radius: 10px;
                    font-size: 1.05rem;
                    background: #fafafa;
                    font-family: inherit;
                }
                .font-select:focus {
                    outline: none;
                    border-color: #8F7344;
                    background: #fff;
                }
                .scheme-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 10px;
                }
                .scheme-chip {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    text-align: right;
                    border: 1px solid #e5e2dc;
                    background: #fff;
                    border-radius: 10px;
                    padding: 9px 10px;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #333;
                }
                .scheme-chip.active {
                    border-color: #111;
                    box-shadow: 0 0 0 2px rgba(17,17,17,0.12);
                }
                .scheme-swatch {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    flex-shrink: 0;
                    border: 1px solid rgba(0,0,0,0.12);
                }
                .custom-color {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    font-size: 0.8rem;
                    color: #666;
                    font-weight: 600;
                }
                .custom-color input {
                    width: 42px;
                    height: 32px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                }
                .btn-ghost:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }
                .size-presets {
                    grid-template-columns: 1fr 1fr 1fr;
                }
                .parents-block {
                    margin-top: 8px;
                    padding-top: 14px;
                    border-top: 1px solid rgba(0,0,0,0.08);
                }
                .parents-title {
                    margin: 0 0 12px;
                    font-size: 0.92rem;
                    font-weight: 700;
                    font-family: inherit;
                }
                .parents-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .export-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin: 14px 0 18px;
                }
                .btn-share {
                    margin-top: 4px;
                    min-height: 52px;
                    font-size: 1.05rem;
                }
                .share-hint {
                    margin: 8px 0 16px;
                    text-align: center;
                    font-size: 0.78rem;
                    color: #888;
                    line-height: 1.4;
                }
                .phone-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.55);
                    z-index: 200;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .phone-sheet {
                    background: #f3f2ef;
                    border-radius: 18px;
                    padding: 16px;
                    width: min(380px, 100%);
                    box-shadow: 0 24px 64px rgba(0,0,0,0.28);
                }
                .phone-sheet-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 14px;
                }
                .phone-frame {
                    background: #111;
                    border-radius: 28px;
                    padding: 12px 10px 18px;
                    border: 3px solid #2a2a2a;
                }
                .phone-notch {
                    width: 90px;
                    height: 8px;
                    border-radius: 999px;
                    background: #333;
                    margin: 4px auto 12px;
                }
                .wa-chat {
                    background: #0b141a;
                    background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
                    background-size: 12px 12px;
                    border-radius: 16px;
                    padding: 16px 12px 20px;
                    min-height: 360px;
                }
                .wa-bubble {
                    background: #005c4b;
                    color: #fff;
                    border-radius: 10px 10px 4px 10px;
                    padding: 8px;
                    max-width: 92%;
                    margin-right: auto;
                }
                .wa-invite-img {
                    width: 100%;
                    display: block;
                    border-radius: 6px;
                    background: #fff;
                }
                .wa-caption {
                    margin: 8px 4px 2px;
                    font-size: 0.82rem;
                    line-height: 1.45;
                    opacity: 0.95;
                }
                .wa-fallback {
                    margin: 24px 8px;
                    text-align: center;
                    opacity: 0.7;
                    font-size: 0.85rem;
                }
                @media (max-width: 900px) {
                    .parents-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .design-simple .nudge-pad {
                    margin-top: 0;
                }
                .design-simple .size-row button {
                    flex: 1;
                    width: auto;
                    height: 40px;
                    padding: 0 10px;
                    font-size: 0.85rem;
                    font-family: inherit;
                    font-weight: 600;
                }
                .nudge-wrap {
                    display: flex;
                    justify-content: center;
                    padding: 6px 0 2px;
                }
                .mode-btn {
                    border: 1px solid #e5e2dc;
                    background: #fafafa;
                    border-radius: 8px;
                    padding: 11px 8px;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 0.84rem;
                    font-weight: 600;
                    color: #444;
                }
                .mode-btn.active {
                    background: #111;
                    color: #fff;
                    border-color: #111;
                }
                .line-picker {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 14px;
                    max-height: 220px;
                    overflow-y: auto;
                }
                .line-picker-hint {
                    margin: 0 0 4px;
                    font-size: 0.78rem;
                    color: #888;
                }
                .line-pick {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 2px;
                    text-align: right;
                    width: 100%;
                    border: 1px solid #e5e2dc;
                    background: #fff;
                    border-radius: 8px;
                    padding: 8px 10px;
                    cursor: pointer;
                    font-family: inherit;
                }
                .line-pick:hover { border-color: #cfc9bd; }
                .line-pick.active {
                    border-color: #8F7344;
                    background: #faf7f2;
                    box-shadow: 0 0 0 2px rgba(143,115,68,0.15);
                }
                .line-pick-label {
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: #333;
                }
                .line-pick-preview {
                    font-size: 0.8rem;
                    color: #777;
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .nudge-block {
                    margin: 4px 0 18px;
                    padding: 12px;
                    background: #f7f6f4;
                    border-radius: 10px;
                }
                .nudge-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    margin-bottom: 10px;
                    font-size: 0.82rem;
                    font-weight: 700;
                }
                .nudge-head select {
                    border: 1px solid #e5e2dc;
                    border-radius: 6px;
                    padding: 4px 8px;
                    font-family: inherit;
                    font-size: 0.78rem;
                    background: #fff;
                }
                .nudge-pad {
                    display: grid;
                    grid-template-columns: repeat(3, 48px);
                    grid-template-rows: repeat(2, 48px);
                    gap: 8px;
                    padding: 12px;
                    background: #f3f1ed;
                    border: 1px solid #e5e2dc;
                    border-radius: 16px;
                    direction: ltr;
                }
                .nudge-empty {
                    width: 48px;
                    height: 48px;
                    visibility: hidden;
                    pointer-events: none;
                }
                .nudge-btn {
                    width: 48px;
                    height: 48px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #ddd8cf;
                    background: #fff;
                    border-radius: 12px;
                    cursor: pointer;
                    color: #222;
                    box-shadow: 0 1px 0 rgba(0,0,0,0.04);
                    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
                }
                .nudge-btn:hover {
                    background: #111;
                    color: #fff;
                    border-color: #111;
                }
                .nudge-btn:active {
                    transform: scale(0.96);
                }
                .nudge-btn svg {
                    display: block;
                }
                .nudge-note {
                    margin: 10px 0 0;
                    text-align: center;
                    font-size: 0.76rem;
                    color: #888;
                }
                .font-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                .font-chip {
                    border: 1px solid #e5e2dc;
                    background: #fafafa;
                    border-radius: 8px;
                    padding: 11px 8px;
                    cursor: pointer;
                    font-size: 0.92rem;
                }
                .font-chip.active {
                    background: #111;
                    color: #fff;
                    border-color: #111;
                }
                .inspector label {
                    display: block;
                    font-size: 0.75rem;
                    color: #777;
                    font-weight: 600;
                    margin: 12px 0 6px;
                }
                .inspector select {
                    width: 100%;
                    padding: 10px;
                    border-radius: 8px;
                    border: 1px solid #e5e2dc;
                    font-family: inherit;
                }
                .color-row { display: flex; align-items: center; gap: 10px; }
                .color-row input {
                    width: 42px;
                    height: 36px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                }
                .color-row span {
                    font-family: ui-monospace, monospace;
                    font-size: 0.8rem;
                    color: #888;
                }
                .size-row { display: flex; align-items: center; gap: 12px; }
                .size-row button {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    border: 1px solid #e5e2dc;
                    background: #fff;
                    cursor: pointer;
                    font-size: 1.1rem;
                }
                .size-row span { min-width: 48px; text-align: center; font-weight: 600; }
                .drag-tip, .pick-tip {
                    margin-top: 16px;
                    font-size: 0.82rem;
                    color: #888;
                    line-height: 1.5;
                }
                .export-preview {
                    width: 100%;
                    border-radius: 10px;
                    border: 1px solid rgba(0,0,0,0.08);
                    margin-bottom: 16px;
                    background: #f7f6f4;
                }
                .export-panel .btn-ghost { margin-top: 8px; }
                .export-panel .btn-primary { margin-bottom: 4px; }

                .stage {
                    flex: 1;
                    min-width: 0;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background:
                        radial-gradient(circle at 50% 40%, #faf9f7 0%, #ebe8e2 100%);
                    overflow: auto;
                    position: relative;
                }
                .stage-msg {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #666;
                    z-index: 2;
                    padding: 16px;
                    background: rgba(243, 242, 239, 0.92);
                }
                .stage-msg.error { color: #8a1f11; }
                .stage-error-box {
                    max-width: 320px;
                    text-align: center;
                    background: #fff;
                    border: 1px solid #f5c6cb;
                    border-radius: 12px;
                    padding: 18px 16px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
                }
                .stage-error-box strong {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 1rem;
                }
                .stage-error-box p {
                    margin: 0 0 14px;
                    font-size: 0.88rem;
                    line-height: 1.45;
                    color: #666;
                }
                .stage-parked {
                    position: absolute !important;
                    left: -10000px !important;
                    top: 0 !important;
                    width: 420px !important;
                    height: 600px !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    overflow: hidden !important;
                    flex: none !important;
                }
                .invite-viewport {
                    position: relative;
                    flex-shrink: 0;
                    background: #fff;
                    box-shadow: 0 16px 48px rgba(0,0,0,0.12);
                    overflow: hidden;
                }
                .invite-scaler {
                    position: absolute;
                    top: 0;
                    left: 0;
                }
                .invite-scaler :global(.canvas-container) {
                    margin: 0 !important;
                }
                .stage-caption {
                    margin-top: 14px;
                    font-size: 0.82rem;
                    color: #7a7a7a;
                    text-align: center;
                }

                .toast {
                    position: fixed;
                    bottom: calc(100px + env(safe-area-inset-bottom));
                    left: 50%;
                    transform: translateX(-50%);
                    background: #111;
                    color: #fff;
                    padding: 12px 18px;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    z-index: 100;
                    white-space: nowrap;
                }

                @media (max-width: 900px) {
                    .topbar {
                        height: 52px;
                        padding: 0 12px;
                    }
                    .dock-nav {
                        min-width: 56px;
                        padding: 0 8px;
                        font-size: 0.78rem;
                    }
                    .dock-step-label {
                        max-width: 90px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .workspace.step-template {
                        /* Keep template picker above the fold — never a blank white frame */
                        min-height: calc(100vh - 52px - 88px);
                    }
                    .template-step {
                        padding: 20px 14px 140px;
                        min-height: auto;
                    }
                    .step-intro h1 {
                        font-size: 1.45rem;
                    }
                    .workspace.step-content,
                    .workspace.step-design,
                    .workspace.step-export {
                        flex-direction: column;
                    }
                    /* Content step: form first — never land on a blank gray area */
                    .workspace.step-content .side-panel {
                        order: 1;
                        max-height: none;
                        flex: 1;
                        border-bottom: none;
                        border-top: 1px solid rgba(0,0,0,0.08);
                    }
                    .workspace.step-content .stage {
                        order: 2;
                        min-height: 36vh;
                        max-height: 42vh;
                        flex: none;
                    }
                    .workspace.step-design .side-panel,
                    .workspace.step-export .side-panel {
                        width: 100%;
                        max-height: 42vh;
                        border-left: none;
                        border-bottom: 1px solid rgba(0,0,0,0.08);
                        order: 2;
                    }
                    .workspace.step-design .stage,
                    .workspace.step-export .stage {
                        order: 1;
                        min-height: 48vh;
                        padding: 12px;
                    }
                    .side-panel {
                        width: 100%;
                        border-left: none;
                    }
                    .mobile-sticky-cta {
                        display: block;
                        position: sticky;
                        bottom: calc(76px + env(safe-area-inset-bottom));
                        z-index: 30;
                        margin: 18px -14px 0;
                        padding: 12px 14px;
                        background: linear-gradient(180deg, rgba(243,242,239,0) 0%, #f3f2ef 28%, #f3f2ef 100%);
                        pointer-events: none;
                    }
                    .mobile-sticky-cta .btn-primary {
                        pointer-events: auto;
                        min-height: 48px;
                        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    }
                    .mobile-sticky-cta:not(.visible) .btn-primary {
                        opacity: 0.55;
                    }
                    .template-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                    }
                    .toast {
                        white-space: normal;
                        max-width: 90vw;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
}
