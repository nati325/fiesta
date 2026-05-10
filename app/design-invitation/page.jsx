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
    { id: 'Karantina', name: 'קרנטינה' }
];

const IMAGE_TEMPLATES = [
    { id: 'tpl-1', name: 'יוקרה קלאסית', url: '/invitation-templates/new-tpl-1.jpeg' },
    { id: 'tpl-2', name: 'בוטני עדין', url: '/invitation-templates/new-tpl-2.jpeg' },
    { id: 'tpl-3', name: 'מינימליזם נקי', url: '/invitation-templates/new-tpl-3.jpeg' },
    { id: 'tpl-4', name: 'זהב מלכותי', url: '/invitation-templates/new-tpl-4.jpeg' },
    { id: 'tpl-5', name: 'רטרו שיק', url: '/invitation-templates/new-tpl-5.jpeg' },
    { id: 'tpl-6', name: 'מודרני נוצץ', url: '/invitation-templates/new-tpl-6.jpeg' },
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

const TEMPLATE_LAYOUTS = {
    'tpl-1': [{ id: 'bsd', top: 100, fontSize: 16 }, { id: 'intro', top: 220, fontSize: 18 }, { id: 'names', top: 300, fontSize: 50 }, { id: 'parents', top: 400, fontSize: 16 }, { id: 'date', top: 520, fontSize: 22 }, { id: 'times', top: 580, fontSize: 20 }, { id: 'location', top: 660, fontSize: 22 }],
    'tpl-2': [{ id: 'bsd', top: 120, fontSize: 14 }, { id: 'intro', top: 180, fontSize: 16 }, { id: 'names', top: 300, fontSize: 45 }, { id: 'parents', top: 510, fontSize: 14 }, { id: 'date', top: 580, fontSize: 20 }, { id: 'times', top: 640, fontSize: 18 }, { id: 'location', top: 710, fontSize: 20 }],
    'tpl-3': [{ id: 'bsd', top: 150, fontSize: 14 }, { id: 'intro', top: 220, fontSize: 16 }, { id: 'names', top: 320, fontSize: 45 }, { id: 'parents', top: 500, fontSize: 14 }, { id: 'date', top: 580, fontSize: 20 }, { id: 'times', top: 640, fontSize: 18 }, { id: 'location', top: 700, fontSize: 20 }],
    'tpl-4': [{ id: 'bsd', top: 260, fontSize: 16 }, { id: 'intro', top: 320, fontSize: 18 }, { id: 'names', top: 400, fontSize: 50 }, { id: 'parents', top: 480, fontSize: 16 }, { id: 'date', top: 560, fontSize: 22 }, { id: 'times', top: 620, fontSize: 20 }, { id: 'location', top: 690, fontSize: 22 }],
    'tpl-5': [{ id: 'bsd', top: 130, fontSize: 16 }, { id: 'intro', top: 200, fontSize: 18 }, { id: 'names', top: 280, fontSize: 50 }, { id: 'parents', top: 360, fontSize: 16 }, { id: 'date', top: 480, fontSize: 22 }, { id: 'times', top: 550, fontSize: 20 }, { id: 'location', top: 630, fontSize: 22 }],
    'tpl-6': [{ id: 'bsd', top: 170, fontSize: 16 }, { id: 'intro', top: 240, fontSize: 18 }, { id: 'names', top: 320, fontSize: 50 }, { id: 'parents', top: 400, fontSize: 16 }, { id: 'date', top: 520, fontSize: 22 }, { id: 'times', top: 580, fontSize: 20 }, { id: 'location', top: 660, fontSize: 22 }]
};

export default function DesignInvitationPage() {
    const { user } = useAuth();
    const fabricRef = useRef(null);
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [selectedTemplate, setSelectedTemplate] = useState(IMAGE_TEMPLATES[0]);
    const [activeTab, setActiveTab] = useState(null);
    const [fabricLoaded, setFabricLoaded] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [canvasScale, setCanvasScale] = useState(1);
    const [userZoom, setUserZoom] = useState(1);
    const [activeObject, setActiveObject] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [formData, setFormData] = useState(DEFAULT_INVITATION_DATA);
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
        l.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;800&family=Heebo:wght@400;700&family=Rubik:wght@400;700&family=Varela+Round&family=Secular+One&family=Alef:wght@400;700&family=Frank+Ruhl+Libre:wght@400;700&family=Amatic+SC:wght@400;700&family=Suez+One&family=Karantina:wght@400;700&family=Playfair+Display:wght@900&display=swap';
        document.head.appendChild(l);
    }, []);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const isMobile = window.innerWidth <= 900;
                const paddingW = isMobile ? 40 : 60;
                const paddingH = isMobile ? 220 : 150;
                const availableWidth = isMobile ? window.innerWidth - paddingW : containerRef.current.offsetWidth - paddingW;
                const availableHeight = window.innerHeight - paddingH;
                const scaleW = availableWidth / 600;
                const scaleH = availableHeight / 840;
                const baseScale = Math.min(scaleW, scaleH) * (isMobile ? 0.95 : 1);
                setCanvasScale(baseScale * userZoom);
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
        canvas.on('selection:created selection:updated', () => setActiveObject(canvas.getActiveObject()));
        canvas.on('selection:cleared', () => setActiveObject(null));
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
                    fontFamily: 'Assistant', fill: '#1a1a1a', textAlign: 'center', originX: 'center'
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
        if (!activeObject) return;
        activeObject.set(prop, val); 
        fabricRef.current.renderAll(); 
        setActiveObject({...activeObject}); 
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
        <div className="studio-root" onClick={() => setContextMenu(null)}>
            <div className="studio-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Link href="/" className="back-btn"><i className="fas fa-arrow-right"></i></Link>
                    <h1 className="logo-text">Fiesta <span className="logo-accent">Studio</span></h1>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <AnimatePresence>
                        {activeObject && (
                            <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} onClick={deleteSelected} className="icon-btn-del">
                                <i className="fas fa-trash-alt"></i>
                            </motion.button>
                        )}
                    </AnimatePresence>
                    <button className="export-btn" onClick={handleSave}>שמירה</button>
                </div>
            </div>

            <div className="studio-main-container">
                <div className="canvas-area" ref={containerRef} onContextMenu={handleContextMenu}>
                    <div className="zoom-controls">
                        <button onClick={() => setUserZoom(p => Math.min(p + 0.2, 3))}><i className="fas fa-search-plus"></i></button>
                        <div className="zoom-value">{Math.round(userZoom * 100)}%</div>
                        <button onClick={() => setUserZoom(p => Math.max(p - 0.2, 0.5))}><i className="fas fa-search-minus"></i></button>
                        <button onClick={() => setUserZoom(1)}><i className="fas fa-sync-alt"></i></button>
                    </div>
                    <motion.div animate={{ scale: canvasScale }} style={{ transformOrigin: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', background: '#fff', margin: 'auto' }}>
                        <canvas ref={canvasRef} />
                    </motion.div>
                </div>

                <div className="sidebar desktop-only">
                    <div className="sidebar-tabs">
                        <button onClick={() => setActiveTab('templates')} className={activeTab === 'templates' ? 'active' : ''}>תבניות</button>
                        <button onClick={() => setActiveTab('form')} className={activeTab === 'form' ? 'active' : ''}>עריכה</button>
                    </div>
                    <div className="sidebar-content">
                        {activeTab === 'templates' ? (
                            <div className="template-grid">
                                {IMAGE_TEMPLATES.map(t => (
                                    <div key={t.id} onClick={() => handleTemplateSelect(t)} className={`tpl-item ${selectedTemplate.id === t.id ? 'active' : ''}`}>
                                        <Image src={t.url} alt={t.name} width={150} height={210} style={{ objectFit: 'cover', borderRadius: '8px' }} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="form-container">
                                {formFields.map(field => (
                                    <div key={field.id} className="field-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <label>{field.label}</label>
                                            <button onClick={() => {
                                                const obj = fabricRef.current.getObjects().find(o => o.fieldId === field.id);
                                                if (obj) fabricRef.current.remove(obj);
                                                setFormFields(p => p.filter(f => f.id !== field.id));
                                                fabricRef.current.renderAll();
                                            }} className="del-field-btn"><i className="fas fa-times"></i></button>
                                        </div>
                                        <textarea value={formData[field.id]} onChange={(e) => handleFormChange(field.id, e.target.value)} rows={2} />
                                    </div>
                                ))}
                                {activeObject && (
                                    <div className="active-controls-sidebar" style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                                        <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '10px' }}>עיצוב טקסט נבחר</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div className="field-group">
                                                <label>גופן</label>
                                                <select value={activeObject.fontFamily} onChange={e => handleActiveStyleChange('fontFamily', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                                    {FONTS.map(f => (
                                                        <option key={f.id} value={f.id} style={{ fontFamily: f.id }}>{f.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="field-group">
                                                <label>צבע</label>
                                                <input type="color" value={activeObject.fill} onChange={e => handleActiveStyleChange('fill', e.target.value)} style={{ width: '100%', height: '40px', padding: '2px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mobile-toolbar">
                <button onClick={() => setActiveTab('templates')} className={activeTab === 'templates' ? 'active' : ''}><i className="fas fa-image"></i><span>תבניות</span></button>
                <button onClick={() => setActiveTab('form')} className={activeTab === 'form' ? 'active' : ''}><i className="fas fa-edit"></i><span>עריכה</span></button>
                <button onClick={() => {
                    const id = `custom_${Date.now()}`;
                    setFormFields(p => [...p, { id, label: 'טקסט חופשי' }]);
                    const t = new window.fabric.IText('טקסט חדש', { left: 300, top: 400, fontFamily: 'Assistant', fontSize: 30, fill: '#1a1a1a', textAlign: 'center', originX: 'center', fieldId: id });
                    fabricRef.current.add(t);
                    fabricRef.current.setActiveObject(t);
                    setActiveTab('form');
                }}><i className="fas fa-plus-circle"></i><span>הוספה</span></button>
                <button onClick={handleSave} className="save-btn-mobile"><i className="fas fa-check-circle"></i><span>שמירה</span></button>
            </div>

            <AnimatePresence>
                {contextMenu && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="ctx-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
                        <button onClick={() => { setActiveTab('form'); setContextMenu(null); }}><i className="fas fa-edit"></i> עריכה</button>
                        <button onClick={deleteSelected} style={{ color: '#ff4d4d' }}><i className="fas fa-trash-alt"></i> מחיקה</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeTab && (
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
                .studio-root { min-height: 100vh; background: #f0f2f5; position: relative; overflow: hidden; font-family: 'Assistant', sans-serif; }
                .studio-header { position: fixed; top: 0; left: 0; right: 0; height: 60px; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                .logo-text { font-family: 'Playfair Display', serif; font-size: 1.2rem; }
                .logo-accent { color: #D4AF37; }
                .export-btn { background: #D4AF37; color: white; border: none; padding: 8px 18px; border-radius: 50px; font-weight: bold; cursor: pointer; }
                .icon-btn-del { background: #fff5f5; color: #ff4d4d; border: 1px solid #ffebeb; padding: 8px 12px; border-radius: 50px; cursor: pointer; }
                .studio-main-container { display: grid; grid-template-columns: 1fr 350px; height: 100vh; padding-top: 60px; }
                .canvas-area { display: flex; align-items: center; justify-content: center; overflow: auto; background: #f0f2f5; width: 100%; position: relative; }
                .sidebar { background: white; border-left: 1px solid #eee; display: flex; flex-direction: column; }
                .sidebar-tabs { display: flex; border-bottom: 1px solid #eee; }
                .sidebar-tabs button { flex: 1; padding: 15px; border: none; background: none; cursor: pointer; font-weight: bold; color: #666; }
                .sidebar-tabs button.active { color: #D4AF37; border-bottom: 2px solid #D4AF37; }
                .sidebar-content { flex: 1; overflow-y: auto; padding: 20px; }
                .template-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .tpl-item { cursor: pointer; border: 2px solid transparent; border-radius: 10px; overflow: hidden; }
                .tpl-item.active { border-color: #D4AF37; }
                .field-group { margin-bottom: 15px; }
                .field-group label { display: block; font-size: 0.8rem; font-weight: bold; margin-bottom: 5px; }
                .field-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-family: Assistant; }
                .del-field-btn { background: none; border: none; color: #ff4d4d; cursor: pointer; }

                .zoom-controls { position: absolute; bottom: 30px; left: 30px; display: flex; gap: 10px; align-items: center; z-index: 100; background: white; padding: 10px; border-radius: 50px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
                .zoom-controls button { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #eee; background: white; cursor: pointer; }
                .zoom-value { font-weight: bold; color: #D4AF37; min-width: 50px; text-align: center; }

                .mobile-toolbar { display: none; }
                .ctx-menu { position: fixed; z-index: 2000; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); padding: 8px; minWidth: 150px; border: 1px solid #eee; }
                .ctx-menu button { width: 100%; padding: 10px; border: none; background: none; textAlign: right; cursor: pointer; font-weight: bold; display: flex; alignItems: center; gap: 8px; }

                @media (max-width: 900px) {
                    .desktop-only { display: none; }
                    .studio-main-container { grid-template-columns: 1fr; }
                    .mobile-toolbar { display: flex; position: fixed; bottom: 20px; left: 20px; right: 20px; background: rgba(255,255,255,0.9); backdrop-filter: blur(15px); border-radius: 20px; padding: 10px; justify-content: space-around; box-shadow: 0 10px 30px rgba(0,0,0,0.1); z-index: 1100; }
                    .mobile-toolbar button { background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 4px; color: #666; font-size: 0.7rem; font-weight: bold; }
                    .mobile-toolbar button.active { color: #D4AF37; }
                    .save-btn-mobile { background: #D4AF37 !important; color: white !important; padding: 8px 15px !important; border-radius: 15px !important; }
                    .drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); z-index: 1200; }
                    .bottom-drawer { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-radius: 25px 25px 0 0; padding: 20px; z-index: 1300; max-height: 70vh; overflow-y: auto; }
                    .drawer-handle { width: 40px; height: 4px; background: #ddd; border-radius: 10px; margin: 0 auto 15px; }
                    .template-grid-mobile { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                    .field-mobile { margin-bottom: 15px; }
                    .field-mobile textarea { width: 100%; padding: 12px; border: 1px solid #eee; border-radius: 10px; background: #f9f9f9; font-size: 1rem; }
                    .zoom-controls { bottom: 100px; right: 20px; left: auto; flex-direction: column; padding: 8px; border-radius: 15px; }
                    .zoom-controls button { width: 35px; height: 35px; }
                }
            `}} />

            {showAuthModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '25px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '10px' }}>כמעט שם!</h2>
                        <p style={{ color: '#666', marginBottom: '25px' }}>התחבר כדי לשמור את העיצוב שלך.</p>
                        <Link href="/login" className="export-btn" style={{ textDecoration: 'none', display: 'block', padding: '12px' }}>התחברות</Link>
                        <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', color: '#999', marginTop: '15px' }}>סגור</button>
                    </div>
                </div>
            )}
        </div>
    );
}
