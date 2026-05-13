'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const FONTS = [
    { id: 'Assistant', name: 'אסיסטנט (Assistant)' },
    { id: 'Heebo', name: 'היבו (Heebo)' },
    { id: 'Rubik', name: 'רוביק (Rubik)' },
    { id: 'Varela Round', name: 'ורלה (Varela)' },
    { id: 'Secular One', name: 'סקולר (Secular)' },
    { id: 'Amatic SC', name: 'אמטיק (Amatic)' },
    { id: 'Alef', name: 'אלף (Alef)' },
    { id: 'Frank Ruhl Libre', name: 'פרנק ריהל' },
    { id: 'Suez One', name: 'סואץ' },
    { id: 'Karantina', name: 'קרנטינה' },
    { id: 'David Libre', name: 'דוד ליברה (David)' },
    { id: 'IBM Plex Sans Hebrew', name: 'יבמ פלקס (IBM)' },
    { id: 'Noto Sans Hebrew', name: 'נוטו סאנס (Noto)' },
    { id: 'Noto Serif Hebrew', name: 'נוטו סריף (Noto)' },
    { id: 'Noto Rashi Hebrew', name: 'נוטו רש"י (Rashi)' },
    { id: 'Tinos', name: 'טינוס (Tinos)' },
    { id: 'Arimo', name: 'ארימו (Arimo)' },
    { id: 'Miriam Libre', name: 'מרים ליברה' },
    { id: 'Bellefair', name: 'בלפייר (Bellefair)' }
];

const IMAGE_TEMPLATES = [
    { id: 'new-1', name: 'יוקרה קלאסית', url: '/invitation-templates/new-tpl-1.jpeg' },
    { id: 'new-2', name: 'בוטני עדין', url: '/invitation-templates/new-tpl-2.jpeg' },
    { id: 'new-3', name: 'מינימליזם נקי', url: '/invitation-templates/new-tpl-3.jpeg' },
    { id: 'new-4', name: 'זהב מלכותי', url: '/invitation-templates/new-tpl-4.jpeg' },
    { id: 'new-5', name: 'רטרו שיק', url: '/invitation-templates/new-tpl-5.jpeg' },
    { id: 'new-6', name: 'מודרני נוצץ', url: '/invitation-templates/new-tpl-6.jpeg' },
    { id: 'tpl-1', name: 'בוטיק משי', url: '/invitation-templates/tpl-1.png' },
    { id: 'tpl-2', name: 'זהב עתיק', url: '/invitation-templates/tpl-2.png' },
    { id: 'tpl-3', name: 'פרחים ורודים', url: '/invitation-templates/tpl-3.png' },
    { id: 'tpl-4', name: 'מינימליזם פרימיום', url: '/invitation-templates/tpl-4.png' },
    { id: 'tpl-5', name: 'טבע פראי', url: '/invitation-templates/tpl-5.png' },
    { id: 'tpl-6', name: 'שיש יוקרתי', url: '/invitation-templates/tpl-6.png' },
    { id: 'tpl-7', name: 'זהב עדין', url: '/invitation-templates/tpl-7.png' },
    { id: 'tpl-8', name: 'מודרן פלטינום', url: '/invitation-templates/tpl-8.png' },
    ...Array.from({ length: 15 }, (_, i) => ({
        id: `missing-${i + 1}`,
        name: `תבנית חדשה ${i + 1}`,
        url: `/invitation-templates/missing-photo-${i + 1}.jpeg`
    }))
];

const DEFAULT_INVITATION_DATA = {
    bsd: 'בס"ד',
    intro: 'נעלה את ירושלים על ראש שמחתנו...',
    names: 'נועה & דניאל',
    parents: 'בני ושרה כהן | שלמה ורחל לוי',
    date: 'יום שלישי, י"ד באלול תשפ"ד',
    times: 'קבלת פנים: 19:30 | חופה: 20:30',
    location: 'מתחם האירועים שדות, קיבוץ שדות'
};

const DEFAULT_LAYOUT = [
    { id: 'bsd', top: 100, fontSize: 16 },
    { id: 'intro', top: 200, fontSize: 18 },
    { id: 'names', top: 300, fontSize: 50 },
    { id: 'parents', top: 400, fontSize: 16 },
    { id: 'date', top: 520, fontSize: 22 },
    { id: 'times', top: 580, fontSize: 20 },
    { id: 'location', top: 660, fontSize: 22 }
];

const TEMPLATE_LAYOUTS = {
    'new-1': [{ id: 'bsd', top: 100, fontSize: 16 }, { id: 'intro', top: 220, fontSize: 18 }, { id: 'names', top: 300, fontSize: 50 }, { id: 'parents', top: 400, fontSize: 16 }, { id: 'date', top: 520, fontSize: 22 }, { id: 'times', top: 580, fontSize: 20 }, { id: 'location', top: 660, fontSize: 22 }],
    'new-2': [{ id: 'bsd', top: 120, fontSize: 14 }, { id: 'intro', top: 180, fontSize: 16 }, { id: 'names', top: 300, fontSize: 45 }, { id: 'parents', top: 510, fontSize: 14 }, { id: 'date', top: 580, fontSize: 20 }, { id: 'times', top: 640, fontSize: 18 }, { id: 'location', top: 710, fontSize: 20 }],
    'new-3': [{ id: 'bsd', top: 150, fontSize: 14 }, { id: 'intro', top: 220, fontSize: 16 }, { id: 'names', top: 320, fontSize: 45 }, { id: 'parents', top: 500, fontSize: 14 }, { id: 'date', top: 580, fontSize: 20 }, { id: 'times', top: 640, fontSize: 18 }, { id: 'location', top: 700, fontSize: 20 }],
    'new-4': [{ id: 'bsd', top: 260, fontSize: 16 }, { id: 'intro', top: 320, fontSize: 18 }, { id: 'names', top: 400, fontSize: 50 }, { id: 'parents', top: 480, fontSize: 16 }, { id: 'date', top: 560, fontSize: 22 }, { id: 'times', top: 620, fontSize: 20 }, { id: 'location', top: 690, fontSize: 22 }],
    'new-5': [{ id: 'bsd', top: 130, fontSize: 16 }, { id: 'intro', top: 200, fontSize: 18 }, { id: 'names', top: 280, fontSize: 50 }, { id: 'parents', top: 360, fontSize: 16 }, { id: 'date', top: 480, fontSize: 22 }, { id: 'times', top: 550, fontSize: 20 }, { id: 'location', top: 630, fontSize: 22 }],
    'new-6': [{ id: 'bsd', top: 170, fontSize: 16 }, { id: 'intro', top: 240, fontSize: 18 }, { id: 'names', top: 320, fontSize: 50 }, { id: 'parents', top: 400, fontSize: 16 }, { id: 'date', top: 520, fontSize: 22 }, { id: 'times', top: 580, fontSize: 20 }, { id: 'location', top: 660, fontSize: 22 }],
    'tpl-1': DEFAULT_LAYOUT,
    'tpl-2': DEFAULT_LAYOUT,
    'tpl-3': DEFAULT_LAYOUT,
    'tpl-4': DEFAULT_LAYOUT,
    'tpl-5': DEFAULT_LAYOUT,
    'tpl-6': DEFAULT_LAYOUT,
    'tpl-7': DEFAULT_LAYOUT,
    'tpl-8': DEFAULT_LAYOUT,
    ...Object.fromEntries(Array.from({ length: 15 }, (_, i) => [`missing-${i + 1}`, DEFAULT_LAYOUT]))
};

export default function DesignInvitationPage() {
    const { user } = useAuth();
    const fabricRef = useRef(null);
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [selectedTemplate, setSelectedTemplate] = useState(IMAGE_TEMPLATES[0]);
    const [activeTab, setActiveTab] = useState('templates');
    const [fabricLoaded, setFabricLoaded] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [canvasScale, setCanvasScale] = useState(1);
    const [userZoom, setUserZoom] = useState(1);
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('fiesta_studio_tutorial');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, []);

    const closeTutorial = () => {
        setShowTutorial(false);
        localStorage.setItem('fiesta_studio_tutorial', 'true');
    };
    const [activeObject, setActiveObject] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [formData, setFormData] = useState(DEFAULT_INVITATION_DATA);
    const [globalFont, setGlobalFont] = useState('Assistant');
    const [showFontPickerInMenu, setShowFontPickerInMenu] = useState(false);
    const longPressTimer = useRef(null);
    const [formFields, setFormFields] = useState([
        { id: 'bsd', label: 'בס"ד' },
        { id: 'intro', label: 'משפט פתיחה' },
        { id: 'names', label: 'שמות' },
        { id: 'parents', label: 'הורים' },
        { id: 'date', label: 'תאריך' },
        { id: 'times', label: 'שעות' },
        { id: 'location', label: 'מיקום' }
    ]);

    useEffect(() => {
        if (window.fabric) setFabricLoaded(true);
        else {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
            s.onload = () => setFabricLoaded(true);
            document.head.appendChild(s);
        }
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;800&family=Heebo:wght@400;700&family=Rubik:wght@400;700&family=Varela+Round&family=Secular+One&family=Alef:wght@400;700&family=Frank+Ruhl+Libre:wght@400;700&family=Amatic+SC:wght@400;700&family=Suez+One&family=Karantina:wght@400;700&family=David+Libre:wght@400;700&family=IBM+Plex+Sans+Hebrew:wght@400;700&family=Noto+Sans+Hebrew:wght@400;700&family=Noto+Serif+Hebrew:wght@400;700&family=Noto+Rashi+Hebrew:wght@400;700&family=Tinos:wght@400;700&family=Arimo:wght@400;700&family=Miriam+Libre:wght@400;700&family=Bellefair&family=Playfair+Display:wght@900&display=swap';
        document.head.appendChild(l);
    }, []);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const isMobile = window.innerWidth <= 900;
                const paddingW = isMobile ? 40 : 120;
                const paddingH = isMobile ? 220 : 120;
                const availableWidth = isMobile ? window.innerWidth - paddingW : (containerRef.current?.offsetWidth || window.innerWidth - 400) - paddingW;
                const availableHeight = window.innerHeight - paddingH;
                const scaleW = Math.max(0.1, availableWidth / 600);
                const scaleH = Math.max(0.1, availableHeight / 840);
                const baseScale = Math.min(scaleW, scaleH) * (isMobile ? 0.95 : 1.1);
                setCanvasScale(Math.max(0.1, baseScale * userZoom));
            }
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [userZoom, fabricLoaded]);

    useEffect(() => {
        if (!fabricLoaded || !canvasRef.current) return;
        const canvas = new window.fabric.Canvas(canvasRef.current, { width: 600, height: 840, backgroundColor: '#ffffff' });
        fabricRef.current = canvas;
        canvas.on('text:changed', (e) => { if (e.target.fieldId) setFormData(prev => ({ ...prev, [e.target.fieldId]: e.target.text })); });
        canvas.on('selection:created selection:updated', () => {
            setActiveObject(canvas.getActiveObject());
            setUpdateTrigger(v => v + 1);
        });
        canvas.on('selection:cleared', () => {
            setActiveObject(null);
            setUpdateTrigger(v => v + 1);
        });

        // Long press for mobile
        canvas.on('mouse:down', (e) => {
            if (e.target) {
                longPressTimer.current = setTimeout(() => {
                    const pointer = canvas.getPointer(e.e);
                    // On mobile we use clientX/Y from the original event
                    const touch = e.e.touches ? e.e.touches[0] : e.e;
                    setContextMenu({ x: touch.clientX, y: touch.clientY });
                    if (window.navigator.vibrate) window.navigator.vibrate(50);
                }, 600);
            }
        });
        canvas.on('mouse:up', () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); });
        canvas.on('mouse:move', () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); });

        renderTemplate(canvas, selectedTemplate);
        return () => canvas.dispose();
    }, [fabricLoaded]);

    const renderTemplate = (canvas, tpl) => {
        canvas.clear();
        window.fabric.Image.fromURL(tpl.url, (img) => {
            const scale = Math.max(600 / img.width, 840 / img.height);
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), { scaleX: scale, scaleY: scale });
            const layout = TEMPLATE_LAYOUTS[tpl.id] || [];
            layout.forEach(field => {
                const t = new window.fabric.IText(formData[field.id] || '', {
                    fieldId: field.id, left: 300, top: field.top, fontSize: field.fontSize,
                    fontFamily: globalFont, fill: '#1a1a1a', textAlign: 'center', originX: 'center'
                });
                canvas.add(t);
            });
        }, { crossOrigin: 'anonymous' });
    };

    const handleTemplateSelect = (t) => { setSelectedTemplate(t); renderTemplate(fabricRef.current, t); };
    const handleFormChange = (id, val) => { 
        setFormData(prev => ({...prev, [id]: val})); 
        const obj = fabricRef.current.getObjects().find(o => o.fieldId === id); 
        if(obj) { obj.set('text', val); fabricRef.current.renderAll(); } 
    };
    const handleActiveStyleChange = (prop, val) => { 
        const active = fabricRef.current?.getActiveObject();
        if (!active) return;
        active.set(prop, val); 
        fabricRef.current.renderAll(); 
        setUpdateTrigger(v => v + 1); 
    };

    const handleGlobalFontChange = (fontId) => {
        setGlobalFont(fontId);
        if (!fabricRef.current) return;
        fabricRef.current.getObjects().forEach(obj => {
            if (obj.type === 'i-text' || obj.type === 'text') {
                obj.set('fontFamily', fontId);
            }
        });
        fabricRef.current.renderAll();
        setUpdateTrigger(v => v + 1);
    };

    const deleteSelected = () => {
        if (!fabricRef.current) return;
        const active = fabricRef.current.getActiveObject();
        if (!active) return;
        if (active.fieldId) setFormFields(prev => prev.filter(f => f.id !== active.fieldId));
        fabricRef.current.remove(active);
        fabricRef.current.renderAll();
        setActiveObject(null);
        setContextMenu(null);
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        if (!fabricRef.current) return;
        const pointer = fabricRef.current.getPointer(e);
        const target = fabricRef.current.getObjects().findLast(o => o.containsPoint(pointer));
        if (target) {
            fabricRef.current.setActiveObject(target);
            fabricRef.current.renderAll();
            setContextMenu({ x: e.clientX, y: e.clientY });
        } else {
            setContextMenu(null);
        }
    };

    const handleSave = () => { if (!user) setShowAuthModal(true); else alert('העיצוב נשמר בהצלחה!'); };

    return (
        <div className="studio-root" onClick={() => setContextMenu(null)} dir="rtl">
            <div className="studio-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link href="/" className="back-btn"><i className="fas fa-chevron-right"></i></Link>
                    <div className="logo-container">
                        <h1 className="logo-text">Fiesta <span className="logo-accent">Studio</span></h1>
                        <span className="studio-badge" style={{ background: '#E8F5E9', color: '#2E7D32', border: '1px solid #C8E6C9' }}>100% חינם</span>
                    </div>
                </div>
                
                <div className="header-actions">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <AnimatePresence>
                            {activeObject && (
                                <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} onClick={deleteSelected} className="delete-action-btn" title="מחיקת פריט">
                                    <i className="fas fa-trash-alt"></i>
                                </motion.button>
                            )}
                        </AnimatePresence>
                        <button className="export-btn" onClick={handleSave}>
                            <i className="fas fa-cloud-upload-alt" style={{ marginLeft: '8px' }}></i>
                            שמירה והמשך
                        </button>
                    </div>
                </div>
            </div>

            <div className="studio-main-container">
                <div className="sidebar desktop-only">
                    <div className="sidebar-nav">
                        <button onClick={() => setActiveTab('templates')} className={activeTab === 'templates' ? 'active' : ''}>
                            <i className="fas fa-th-large"></i>
                            תבניות
                        </button>
                        <button onClick={() => setActiveTab('form')} className={activeTab === 'form' ? 'active' : ''}>
                            <i className="fas fa-font"></i>
                            תוכן
                        </button>
                        <button onClick={() => setActiveTab('styles')} className={activeTab === 'styles' ? 'active' : ''}>
                            <i className="fas fa-paint-brush"></i>
                            עיצוב
                        </button>
                        <button onClick={() => {
                            const id = `custom_${Date.now()}`;
                            setFormFields(p => [...p, { id, label: 'טקסט חופשי' }]);
                            const t = new window.fabric.IText('הקלד כאן...', { left: 300, top: 400, fontFamily: globalFont, fontSize: 30, fill: '#1a1a1a', textAlign: 'center', originX: 'center', fieldId: id });
                            fabricRef.current.add(t);
                            fabricRef.current.setActiveObject(t);
                            setActiveTab('form');
                        }}>
                            <i className="fas fa-plus"></i>
                            הוספה
                        </button>
                    </div>
                    
                    <div className="sidebar-content">
                        {activeTab === 'templates' ? (
                            <div className="template-grid">
                                {IMAGE_TEMPLATES.map(t => (
                                    <motion.div key={t.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleTemplateSelect(t)} className={`tpl-item ${selectedTemplate.id === t.id ? 'active' : ''}`}>
                                        <img src={t.url} alt={t.name} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
                                        <div className="tpl-overlay"><i className="fas fa-check"></i></div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : activeTab === 'form' ? (
                            <div className="form-container">
                                {formFields.map(field => (
                                    <div key={field.id} className="field-group">
                                        <div className="field-header">
                                            <label>{field.label}</label>
                                            <button onClick={() => {
                                                const obj = fabricRef.current.getObjects().find(o => o.fieldId === field.id);
                                                if (obj) fabricRef.current.remove(obj);
                                                setFormFields(p => p.filter(f => f.id !== field.id));
                                                fabricRef.current.renderAll();
                                            }} className="del-field-btn"><i className="fas fa-times"></i></button>
                                        </div>
                                        <textarea value={formData[field.id]} onChange={(e) => handleFormChange(field.id, e.target.value)} rows={2} placeholder={`הזן ${field.label}...`} />
                                    </div>
                                ))}
                            </div>
                        ) : activeTab === 'styles' ? (
                            <div className="styles-container">
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '20px', color: '#333' }}>עיצוב גלובלי</h3>
                                <div className="style-field">
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 800, fontSize: '0.9rem' }}>גופן לכל ההזמנה</label>
                                    <div className="font-grid-global">
                                        {FONTS.map(f => (
                                            <button 
                                                key={f.id} 
                                                onClick={() => handleGlobalFontChange(f.id)}
                                                className={`font-btn-global ${globalFont === f.id ? 'active' : ''}`}
                                                style={{ fontFamily: f.id }}
                                            >
                                                {f.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <AnimatePresence>
                            {activeObject && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="inspector-panel-fixed">
                                    <div className="inspector-header">
                                        <h3><i className="fas fa-magic"></i> עיצוב טקסט</h3>
                                        <button onClick={() => fabricRef.current.discardActiveObject().renderAll()}><i className="fas fa-times"></i></button>
                                    </div>
                                    <div className="inspector-body" key={updateTrigger}>
                                        <div className="inspector-row">
                                            <label>גופן</label>
                                            <select value={activeObject.fontFamily} onChange={e => handleActiveStyleChange('fontFamily', e.target.value)}>
                                                {FONTS.map(f => <option key={f.id} value={f.id} style={{ fontFamily: f.id }}>{f.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="inspector-row">
                                            <label>צבע</label>
                                            <div className="color-picker-container">
                                                <input type="color" value={activeObject.fill} onChange={e => handleActiveStyleChange('fill', e.target.value)} />
                                                <span className="color-code">{activeObject.fill}</span>
                                            </div>
                                        </div>
                                        <div className="inspector-row">
                                            <label>גודל</label>
                                            <div className="size-control">
                                                <button onClick={() => handleActiveStyleChange('fontSize', (activeObject.fontSize || 30) - 2)}>-</button>
                                                <span>{Math.round(activeObject.fontSize || 30)}px</span>
                                                <button onClick={() => handleActiveStyleChange('fontSize', (activeObject.fontSize || 30) + 2)}>+</button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="canvas-area" ref={containerRef} onContextMenu={handleContextMenu}>
                    <div className="zoom-controls-floating">
                        <button onClick={() => setUserZoom(p => Math.min(p + 0.2, 3))} title="זום אין"><i className="fas fa-search-plus"></i></button>
                        <div className="zoom-display">{Math.round(userZoom * 100)}%</div>
                        <button onClick={() => setUserZoom(p => Math.max(p - 0.2, 0.5))} title="זום אאוט"><i className="fas fa-search-minus"></i></button>
                        <div className="zoom-divider"></div>
                        <button onClick={() => setUserZoom(1)} title="איפוס גודל"><i className="fas fa-sync-alt"></i></button>
                    </div>
                    
                    <motion.div animate={{ scale: canvasScale }} transition={{ type: 'spring', damping: 25, stiffness: 120 }} style={{ transformOrigin: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.2)', background: '#fff', margin: 'auto', position: 'relative' }}>
                        <canvas ref={canvasRef} />
                    </motion.div>
                </div>
            </div>

            <div className="mobile-toolbar">
                <button onClick={() => setActiveTab('templates')} className={activeTab === 'templates' ? 'active' : ''}><i className="fas fa-image"></i><span>תבניות</span></button>
                <button onClick={() => setActiveTab('form')} className={activeTab === 'form' ? 'active' : ''}><i className="fas fa-edit"></i><span>תוכן</span></button>
                <button onClick={() => setActiveTab('styles')} className={activeTab === 'styles' ? 'active' : ''}><i className="fas fa-paint-brush"></i><span>עיצוב</span></button>
                <button onClick={() => {
                    const id = `custom_${Date.now()}`;
                    setFormFields(p => [...p, { id, label: 'טקסט חופשי' }]);
                    const t = new window.fabric.IText('טקסט חדש', { left: 300, top: 400, fontFamily: globalFont, fontSize: 30, fill: '#1a1a1a', textAlign: 'center', originX: 'center', fieldId: id });
                    fabricRef.current.add(t);
                    fabricRef.current.setActiveObject(t);
                    setActiveTab('form');
                }}><i className="fas fa-plus-circle"></i><span>הוספה</span></button>
            </div>

            <AnimatePresence>
                {contextMenu && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.9 }} 
                        className="ctx-menu" 
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {!showFontPickerInMenu ? (
                            <>
                                <button onClick={() => { 
                                    if(activeObject && activeObject.enterEditing) {
                                        activeObject.enterEditing();
                                        fabricRef.current.renderAll();
                                    }
                                    setContextMenu(null); 
                                }}>
                                    <i className="fas fa-edit"></i> עריכת טקסט
                                </button>
                                <button onClick={() => setShowFontPickerInMenu(true)}>
                                    <i className="fas fa-font"></i> שינוי גופן
                                </button>
                                <div className="ctx-divider"></div>
                                <button onClick={deleteSelected} style={{ color: '#ff4d4d' }}>
                                    <i className="fas fa-trash-alt"></i> מחיקה מהירה
                                </button>
                            </>
                        ) : (
                            <div className="ctx-font-picker">
                                <div className="ctx-font-header">
                                    <button onClick={() => setShowFontPickerInMenu(false)} className="ctx-back">
                                        <i className="fas fa-chevron-right"></i> חזרה
                                    </button>
                                    <span>בחר גופן</span>
                                </div>
                                <div className="ctx-font-list">
                                    {FONTS.map(f => (
                                        <button 
                                            key={f.id} 
                                            onClick={() => { 
                                                handleActiveStyleChange('fontFamily', f.id);
                                                setContextMenu(null);
                                                setShowFontPickerInMenu(false);
                                            }}
                                            style={{ fontFamily: f.id }}
                                            className={activeObject?.fontFamily === f.id ? 'active' : ''}
                                        >
                                            {f.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeTab && window.innerWidth <= 900 && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveTab(null)} className="drawer-overlay" />
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bottom-drawer">
                            <div className="drawer-handle" />
                            <div className="drawer-scroll">
                                {activeTab === 'templates' ? (
                                    <div className="template-grid-mobile">
                                        {IMAGE_TEMPLATES.map(t => (
                                            <div key={t.id} onClick={() => { handleTemplateSelect(t); setActiveTab(null); }} className={`tpl-card-mobile ${selectedTemplate.id === t.id ? 'active' : ''}`}>
                                                <Image src={t.url} alt={t.name} width={100} height={140} style={{ objectFit: 'cover' }} />
                                            </div>
                                        ))}
                                    </div>
                                ) : activeTab === 'styles' ? (
                                    <div className="styles-mobile">
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '20px', textAlign: 'right' }}>עיצוב גלובלי</h3>
                                        <div className="font-grid-global">
                                            {FONTS.map(f => (
                                                <button 
                                                    key={f.id} 
                                                    onClick={() => { handleGlobalFontChange(f.id); setActiveTab(null); }}
                                                    className={`font-btn-global ${globalFont === f.id ? 'active' : ''}`}
                                                    style={{ fontFamily: f.id }}
                                                >
                                                    {f.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-mobile">
                                        {formFields.map(field => (
                                            <div key={field.id} className="field-mobile">
                                                <label>{field.label}</label>
                                                <textarea value={formData[field.id]} onChange={(e) => handleFormChange(field.id, e.target.value)} rows={2} />
                                            </div>
                                        ))}
                                        {activeObject && (
                                            <div className="active-controls-mobile">
                                                <select value={activeObject.fontFamily} onChange={e => handleActiveStyleChange('fontFamily', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #eee' }}>
                                                    {FONTS.map(f => <option key={f.id} value={f.id} style={{ fontFamily: f.id }}>{f.name}</option>)}
                                                </select>
                                                <input type="color" value={activeObject.fill} onChange={e => handleActiveStyleChange('fill', e.target.value)} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
                
                .studio-root { min-height: 100vh; background: #eef1f5; position: relative; overflow: hidden; font-family: 'Assistant', sans-serif; color: #1a1a1a; }
                
                .studio-header { 
                    position: fixed; top: 0; left: 0; right: 0; height: 70px; 
                    background: white; display: flex; align-items: center; 
                    justify-content: space-between; padding: 0 24px; z-index: 1000; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.06); 
                }
                
                .logo-container { display: flex; align-items: center; gap: 10px; }
                .logo-text { font-family: 'Playfair Display', serif; font-size: 1.5rem; margin: 0; letter-spacing: -0.5px; }
                .logo-accent { color: #D4AF37; font-weight: 900; }
                .studio-badge { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; color: #666; }
                
                .back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: #f8f9fa; color: #333; text-decoration: none; transition: all 0.2s; }
                .back-btn:hover { background: #e9ecef; transform: translateX(2px); }
                
                .header-actions { display: flex; align-items: center; gap: 20px; }
                .delete-action-btn { width: 42px; height: 42px; border-radius: 12px; border: 1px solid #ffebeb; background: #fff5f5; color: #ff4d4d; cursor: pointer; transition: all 0.2s; }
                .delete-action-btn:hover { transform: scale(1.1); background: #ffeded; }
                
                .export-btn { 
                    background: linear-gradient(135deg, #D4AF37 0%, #B8962D 100%); 
                    color: white; border: none; padding: 12px 24px; border-radius: 12px; 
                    font-weight: 800; cursor: pointer; display: flex; align-items: center;
                    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3); transition: all 0.3s;
                }
                .export-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4); }

                .studio-main-container { display: flex; flex-direction: row-reverse; height: 100vh; padding-top: 70px; overflow: hidden; background: #eef1f5; }
                
                .sidebar { width: 400px; min-width: 400px; background: white; border-left: 1px solid #eee; display: flex; flex-direction: row; z-index: 10; height: 100%; position: relative; }
                .sidebar-nav { width: 85px; background: #fdfdfd; border-left: 1px solid #eee; display: flex; flex-direction: column; align-items: center; padding: 25px 0; gap: 25px; }
                .sidebar-nav button { width: 50px; height: 50px; border: none; background: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; font-size: 0.7rem; font-weight: bold; color: #999; transition: all 0.2s; border-radius: 12px; }
                .sidebar-nav button.active { background: white; color: #D4AF37; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                
                .sidebar-content { flex: 1; overflow-y: auto; padding: 24px; background: white; padding-bottom: 250px; }
                .template-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
                .tpl-item { cursor: pointer; position: relative; border-radius: 16px; overflow: hidden; border: 3px solid transparent; transition: all 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .tpl-item.active { border-color: #D4AF37; transform: scale(1.02); }
                .tpl-item.active .tpl-overlay { display: flex; }
                
                .form-container { display: flex; flex-direction: column; gap: 16px; }
                .field-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
                .field-group label { font-size: 0.85rem; font-weight: 800; color: #555; }
                .field-group textarea { width: 100%; padding: 14px; border: 2px solid #f0f0f0; border-radius: 12px; font-family: Assistant; font-size: 0.95rem; resize: none; transition: all 0.2s; background: #fafafa; }
                .field-group textarea:focus { border-color: #D4AF37; background: white; outline: none; }

                .inspector-panel-fixed { position: absolute; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #eee; padding: 20px; box-shadow: 0 -10px 40px rgba(0,0,0,0.1); z-index: 20; }
                .inspector-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .inspector-header h3 { margin: 0; font-size: 1rem; color: #D4AF37; font-weight: 900; }
                .inspector-header button { background: none; border: none; color: #ccc; cursor: pointer; }
                .inspector-body { display: flex; flex-direction: column; gap: 15px; }
                .inspector-row { display: flex; align-items: center; justify-content: space-between; }
                .inspector-row label { font-size: 0.8rem; font-weight: bold; color: #666; }
                .inspector-row select { padding: 10px; border-radius: 10px; border: 1px solid #eee; width: 160px; font-family: inherit; }
                .color-picker-container { display: flex; align-items: center; gap: 10px; }
                .color-picker-container input { width: 35px; height: 35px; border: none; border-radius: 50%; cursor: pointer; }
                .color-code { font-family: monospace; font-size: 0.8rem; color: #999; }
                .size-control { display: flex; align-items: center; gap: 12px; }
                .size-control button { width: 32px; height: 32px; border-radius: 10px; border: 1px solid #eee; background: white; cursor: pointer; font-weight: bold; }
                .size-control span { font-weight: 900; font-size: 1rem; color: #333; min-width: 40px; text-align: center; }

                .canvas-area { flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto; background: radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 100%); position: relative; padding: 60px; height: 100%; }
                .zoom-controls-floating { position: absolute; bottom: 30px; left: 30px; display: flex; align-items: center; gap: 10px; background: white; padding: 10px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); z-index: 100; border: 1px solid #eee; }
                .zoom-controls-floating button { width: 40px; height: 40px; border-radius: 12px; border: none; background: #f8f9fa; color: #333; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .zoom-controls-floating button:hover { background: #D4AF37; color: white; transform: scale(1.1); }
                .zoom-display { font-weight: 900; color: #D4AF37; min-width: 60px; text-align: center; font-size: 1rem; }
                .zoom-divider { width: 1px; height: 25px; background: #eee; margin: 0 5px; }

                .ctx-menu { position: fixed; z-index: 2000; background: white; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.25); padding: 8px; min-width: 200px; border: 1px solid rgba(0,0,0,0.05); backdrop-filter: blur(10px); }
                .ctx-menu button { width: 100%; padding: 12px 16px; border: none; background: none; text-align: right; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 12px; border-radius: 12px; transition: all 0.2s; font-size: 0.95rem; }
                .ctx-menu button:hover { background: #f8f9fa; color: #D4AF37; }
                .ctx-divider { height: 1px; background: #f0f0f0; margin: 4px 8px; }
                
                .ctx-font-picker { min-width: 220px; }
                .ctx-font-header { display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; margin-bottom: 5px; font-weight: 900; color: #333; }
                .ctx-back { font-size: 0.8rem !important; color: #D4AF37 !important; padding: 5px !important; width: auto !important; }
                .ctx-font-list { max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
                .ctx-font-list button { font-weight: 500; font-size: 1.1rem; }
                .ctx-font-list button.active { background: #fdfaf0; color: #D4AF37; }

                .font-grid-global { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .font-btn-global { 
                    padding: 12px; border: 2px solid #f0f0f0; border-radius: 12px; background: #fafafa;
                    cursor: pointer; transition: all 0.2s; font-size: 1rem; text-align: center;
                }
                .font-btn-global:hover { border-color: #D4AF37; background: #fdfaf0; }
                .font-btn-global.active { border-color: #D4AF37; background: #D4AF37; color: white; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3); }

                @media (max-width: 900px) {
                    .desktop-only { display: none; }
                    .studio-main-container { grid-template-columns: 1fr; padding-top: 60px; flex-direction: column; }
                    .canvas-area { padding: 20px; }
                    .mobile-toolbar { display: flex; position: fixed; bottom: 20px; left: 20px; right: 20px; background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 24px; padding: 12px; justify-content: space-around; box-shadow: 0 20px 40px rgba(0,0,0,0.15); z-index: 1100; }
                    .bottom-drawer { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-radius: 30px 30px 0 0; padding: 24px; z-index: 1300; max-height: 80vh; overflow-y: auto; }
                    .zoom-controls-floating { bottom: 100px; right: 20px; left: auto; flex-direction: column; padding: 8px; border-radius: 15px; }
                    .ctx-menu { left: 50% !important; transform: translateX(-50%) !important; bottom: 120px; top: auto !important; }
                }
            `}</style>
            {/* Tutorial Overlay */}
            <AnimatePresence>
                {showTutorial && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.85)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            style={{
                                background: 'white',
                                borderRadius: '30px',
                                padding: '40px',
                                maxWidth: '500px',
                                textAlign: 'center',
                                position: 'relative'
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎨</div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '15px' }}>ברוכים הבאים לסטודיו!</h2>
                            <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: 1.6, marginBottom: '30px' }}>
                                כאן תוכלו לעצב את ההזמנה המושלמת שלכם.
                                <br />
                                <b>טיפ:</b> ניתן לגרור כל אלמנט על גבי ההזמנה, להקליק לחיצה כפולה כדי לערוך טקסט, או להשתמש בסרגל הכלים לשינוי פונטים וצבעים.
                            </p>
                            <button 
                                onClick={closeTutorial}
                                className="btn btn-primary"
                                style={{ padding: '15px 60px', borderRadius: '50px', fontWeight: 800, fontSize: '1.2rem' }}
                            >
                                הבנתי, בואו נתחיל!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
