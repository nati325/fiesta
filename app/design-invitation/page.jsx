'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const IMAGE_TEMPLATES = [
    { id: 'tpl-1', name: 'עיצוב קלאסי', url: '/invitation-templates/new-tpl-1.jpeg' },
    { id: 'tpl-2', name: 'עיצוב רומנטי', url: '/invitation-templates/new-tpl-2.jpeg' },
    { id: 'tpl-3', name: 'עיצוב יוקרתי', url: '/invitation-templates/new-tpl-3.jpeg' },
    { id: 'tpl-4', name: 'עיצוב מודרני', url: '/invitation-templates/new-tpl-4.jpeg' },
    { id: 'tpl-5', name: 'עיצוב בוטיק', url: '/invitation-templates/new-tpl-5.jpeg' },
    { id: 'tpl-6', name: 'עיצוב מינימליסטי', url: '/invitation-templates/new-tpl-6.jpeg' }
];

const FONTS = [
    { id: 'Assistant', name: 'אסיסטנט (מודרני נקי)' },
    { id: 'Heebo', name: 'היבו (נקי וישר)' },
    { id: 'Rubik', name: 'רוביק (זורם ומעוגל)' },
    { id: 'Open Sans', name: 'אופן סאנס (קלאסי גוגל)' },
    { id: 'Noto Sans Hebrew', name: 'נוטו סאנס (רשמי ומודרני)' },
    { id: 'Arimo', name: 'ארימו (מודרני יוקרתי)' },
    { id: 'Varela Round', name: 'ורלה עגול (רך וידידותי)' },
    { id: 'Secular One', name: 'סקולר (עבה ומעוצב)' },
    { id: 'Frank Ruhl Libre', name: 'פרנק ריהל (מסורתי)' },
    { id: 'Noto Serif Hebrew', name: 'נוטו סריף (ספרותי מעוטר)' },
    { id: 'Amatic SC', name: 'אמטיק (כתב יד גבוה ויצירתי)' },
    { id: 'Dana Yad', name: 'דנה יד (כתב יד זורם ואמיתי)' },
    { id: 'Alef', name: 'אלף (קריא וברור)' },
    { id: 'Tinos', name: 'טינוס (רשמי ואלגנטי)' },
    { id: 'David Libre', name: 'דוד (קלאסי - תנכ״י)' },
    { id: 'Suez One', name: 'סואץ (כבד ובולט)' },
    { id: 'Karantina', name: 'קרנטינה (כתב יד צר)' },
    { id: 'Miriam Libre', name: 'מרים (הייטקיסטי וצר)' },
    { id: 'Fredoka', name: 'פרדוקה (שמנמן ושמח)' },
    { id: 'M PLUS Rounded 1c', name: 'אמ פלוס (סגנון בועות)' },
    { id: 'Cousine', name: 'קוזין (סגנון מכונת כתיבה)' },
    { id: 'Blinker', name: 'בלינקר (כבד ואגרסיבי)' },
    { id: 'IBM Plex Sans Hebrew', name: 'פלקס (טכנולוגי)' }
];

const DEFAULT_INVITATION_DATA = {
    bsd: 'בס״ד',
    intro: 'שמחים ומתרגשים להזמינכם לחגוג איתנו את יום נישואינו',
    names: 'נועה ועומר',
    parents: 'משפחת כהן | משפחת לוי',
    date: 'יום חמישי, י"ב באב תשפ"ו | 12.08.2026',
    times: 'קבלת פנים 19:30 | חופה וקידושין 20:30',
    location: 'מתחם האירועים שדות, קיבוץ שדות'
};

const LAYOUT_1 = [
    { id: 'bsd', top: 100, fontSize: 16, fontWeight: 'normal' },
    { id: 'intro', top: 220, fontSize: 18, fontWeight: 'normal' },
    { id: 'names', top: 300, fontSize: 50, fontWeight: 'bold' },
    { id: 'parents', top: 400, fontSize: 16, fontWeight: 'normal' },
    { id: 'date', top: 520, fontSize: 22, fontWeight: 'bold' },
    { id: 'times', top: 580, fontSize: 20, fontWeight: 'normal' },
    { id: 'location', top: 660, fontSize: 22, fontWeight: 'bold' }
];

const LAYOUT_2 = [
    { id: 'bsd', top: 120, fontSize: 14, fontWeight: 'normal' },
    { id: 'intro', top: 180, fontSize: 16, fontWeight: 'normal' },
    { id: 'names', top: 300, fontSize: 45, fontWeight: 'bold' },
    { id: 'parents', top: 510, fontSize: 14, fontWeight: 'normal' },
    { id: 'date', top: 580, fontSize: 20, fontWeight: 'bold' },
    { id: 'times', top: 640, fontSize: 18, fontWeight: 'normal' },
    { id: 'location', top: 710, fontSize: 20, fontWeight: 'bold' }
];

const LAYOUT_3 = [
    { id: 'bsd', top: 150, fontSize: 14, fontWeight: 'normal' },
    { id: 'intro', top: 220, fontSize: 16, fontWeight: 'normal' },
    { id: 'names', top: 320, fontSize: 45, fontWeight: 'bold' },
    { id: 'parents', top: 500, fontSize: 14, fontWeight: 'normal' },
    { id: 'date', top: 580, fontSize: 20, fontWeight: 'bold' },
    { id: 'times', top: 640, fontSize: 18, fontWeight: 'normal' },
    { id: 'location', top: 700, fontSize: 20, fontWeight: 'bold' }
];

const LAYOUT_4 = [
    { id: 'bsd', top: 260, fontSize: 16, fontWeight: 'normal' },
    { id: 'intro', top: 320, fontSize: 18, fontWeight: 'normal' },
    { id: 'names', top: 400, fontSize: 50, fontWeight: 'bold' },
    { id: 'parents', top: 480, fontSize: 16, fontWeight: 'normal' },
    { id: 'date', top: 560, fontSize: 22, fontWeight: 'bold' },
    { id: 'times', top: 620, fontSize: 20, fontWeight: 'normal' },
    { id: 'location', top: 690, fontSize: 22, fontWeight: 'bold' }
];

const LAYOUT_5 = [
    { id: 'bsd', top: 130, fontSize: 16, fontWeight: 'normal' },
    { id: 'intro', top: 200, fontSize: 18, fontWeight: 'normal' },
    { id: 'names', top: 280, fontSize: 50, fontWeight: 'bold' },
    { id: 'parents', top: 360, fontSize: 16, fontWeight: 'normal' },
    { id: 'date', top: 480, fontSize: 22, fontWeight: 'bold' },
    { id: 'times', top: 550, fontSize: 20, fontWeight: 'normal' },
    { id: 'location', top: 630, fontSize: 22, fontWeight: 'bold' }
];

const LAYOUT_6 = [
    { id: 'bsd', top: 170, fontSize: 16, fontWeight: 'normal' },
    { id: 'intro', top: 240, fontSize: 18, fontWeight: 'normal' },
    { id: 'names', top: 320, fontSize: 50, fontWeight: 'bold' },
    { id: 'parents', top: 400, fontSize: 16, fontWeight: 'normal' },
    { id: 'date', top: 520, fontSize: 22, fontWeight: 'bold' },
    { id: 'times', top: 580, fontSize: 20, fontWeight: 'normal' },
    { id: 'location', top: 660, fontSize: 22, fontWeight: 'bold' }
];

const TEMPLATE_LAYOUTS = {
    'tpl-1': LAYOUT_1,
    'tpl-2': LAYOUT_2,
    'tpl-3': LAYOUT_3,
    'tpl-4': LAYOUT_4,
    'tpl-5': LAYOUT_5,
    'tpl-6': LAYOUT_6
};

export default function DesignInvitationPage() {
    const { user } = useAuth();
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const containerRef = useRef(null);
    const [selectedTemplate, setSelectedTemplate] = useState(IMAGE_TEMPLATES[0]);
    const [activeTab, setActiveTab] = useState('templates');
    const [fabricLoaded, setFabricLoaded] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [canvasScale, setCanvasScale] = useState(1);
    const [activeObject, setActiveObject] = useState(null);
    
    // Global styling for the invitation text
    const [globalStyle, setGlobalStyle] = useState({
        color: '#1a1a1a',
        fontFamily: 'Assistant'
    });

    const [formFields, setFormFields] = useState([
        { id: 'bsd', label: 'כיתוב פתיחה (למשל: בס״ד)' },
        { id: 'intro', label: 'משפט פתיחה' },
        { id: 'names', label: 'שמות החתן והכלה' },
        { id: 'parents', label: 'שמות ההורים' },
        { id: 'date', label: 'תאריך האירוע' },
        { id: 'times', label: 'זמנים (קבלת פנים, חופה)' },
        { id: 'location', label: 'מיקום ושם האולם' }
    ]);
    
    // Form data
    const [formData, setFormData] = useState(DEFAULT_INVITATION_DATA);

    useEffect(() => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
        s.onload = () => setFabricLoaded(true);
        document.head.appendChild(s);
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;800&family=Heebo:wght@400;700&family=Rubik:wght@400;700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Sans+Hebrew:wght@400;700&family=Arimo:ital,wght@0,400;0,700;1,400;1,700&family=Varela+Round&family=Secular+One&family=Frank+Ruhl+Libre:wght@400;700&family=Noto+Serif+Hebrew:wght@400;700&family=Amatic+SC:wght@400;700&family=Alef:wght@400;700&family=Tinos:ital,wght@0,400;0,700;1,400;1,700&family=David+Libre:wght@400;500;700&family=Suez+One&family=Karantina:wght@300;400;700&family=Miriam+Libre:wght@400;700&family=Fredoka:wght@400;700&family=M+PLUS+Rounded+1c:wght@400;700&family=Cousine:ital,wght@0,400;0,700;1,400;1,700&family=Blinker:wght@400;700&family=IBM+Plex+Sans+Hebrew:wght@400;700&display=swap';
        document.head.appendChild(l);
        
        const dana = document.createElement('link');
        dana.rel = 'stylesheet';
        dana.href = 'https://fonts.cdnfonts.com/css/dana-yad';
        document.head.appendChild(dana);

        const handleResize = () => {
            if (containerRef.current) {
                const availableHeight = window.innerHeight - 150;
                const scale = Math.min(1, availableHeight / 840);
                setCanvasScale(scale);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!fabricLoaded || !canvasRef.current) return;
        const canvas = new window.fabric.Canvas(canvasRef.current, {
            width: 600,
            height: 840,
            backgroundColor: '#ffffff'
        });
        fabricRef.current = canvas;

        // Add event listener to update form when text is edited directly on canvas
        canvas.on('text:changed', (e) => {
            if (e.target && e.target.fieldId) {
                setFormData(prev => ({ ...prev, [e.target.fieldId]: e.target.text }));
            }
        });

        const updateActive = () => {
            const active = canvas.getActiveObject();
            if (active && (active.type === 'i-text' || active.type === 'text')) {
                setActiveObject({
                    fontFamily: active.fontFamily,
                    fill: active.fill,
                    fontSize: active.fontSize || 20
                });
            } else {
                setActiveObject(null);
            }
        };

        canvas.on('selection:created', updateActive);
        canvas.on('selection:updated', updateActive);
        canvas.on('selection:cleared', updateActive);
        canvas.on('object:modified', updateActive);

        renderTemplate(canvas, selectedTemplate, true);
        return () => canvas.dispose();
    }, [fabricLoaded]);

    const renderTemplate = (canvas, tpl, initialLoad = false) => {
        // Only preserve non-form objects or custom user-added text objects if not initial load
        const preserveObjs = initialLoad ? [] : canvas.getObjects().filter(o => o.type === 'i-text' && (!o.fieldId || o.fieldId.startsWith('custom_')));
        canvas.clear();
        
        window.fabric.Image.fromURL(tpl.url, (img) => {
            const scale = Math.max(600 / img.width, 840 / img.height);
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                scaleX: scale,
                scaleY: scale,
                originX: 'left',
                originY: 'top'
            });

            preserveObjs.forEach(o => canvas.add(o));
            
            // Re-add form objects with the template's specific layout
            addFormObjects(canvas, tpl.id);

            canvas.add(new window.fabric.Text('F I E S T A', {
                left: 300, top: 810, fontSize: 10, fill: '#ffffff',
                originX: 'center', opacity: 0.5, letterSpacing: 8, selectable: false,
                shadow: new window.fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 2 })
            }));

            canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
    };

    const addFormObjects = (canvas, tplId) => {
        const templateLayout = TEMPLATE_LAYOUTS[tplId] || DEFAULT_LAYOUT;
        
        templateLayout.forEach(field => {
            // Include user custom edits if present, otherwise default to formData
            const textValue = formData[field.id] || DEFAULT_INVITATION_DATA[field.id] || '';
            const t = new window.fabric.IText(textValue, {
                fieldId: field.id, 
                left: field.left || 300, top: field.top,
                fontFamily: globalStyle.fontFamily, 
                fontSize: field.fontSize,
                fill: globalStyle.color, 
                fontWeight: field.fontWeight,
                textAlign: 'center', originX: 'center', originY: 'center', direction: 'rtl',
                transparentCorners: false, cornerColor: '#D4AF37', cornerStrokeColor: '#D4AF37', borderColor: '#D4AF37'
            });
            canvas.add(t);
        });
    };

    const handleTemplateSelect = (t) => {
        setSelectedTemplate(t);
        if (fabricRef.current) {
            // Re-render template, preserving layout
            renderTemplate(fabricRef.current, t, false);
        }
    };

    const handleFormChange = (fieldId, value) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
        
        if (!fabricRef.current) return;
        
        // Find the object and update its text
        const obj = fabricRef.current.getObjects().find(o => o.fieldId === fieldId);
        if (obj) {
            obj.set('text', value);
            fabricRef.current.renderAll();
        }
    };

    const handleStyleChange = async (prop, value) => {
        setGlobalStyle(prev => ({ ...prev, [prop]: value }));
        
        if (!fabricRef.current) return;
        
        const objs = fabricRef.current.getObjects().filter(o => o.type === 'i-text' || o.type === 'text');
        
        // Force browser to load font before rendering in canvas
        if (prop === 'fontFamily') {
            try { await document.fonts.load(`1rem "${value}"`); } catch(e) {}
        }

        objs.forEach(obj => {
            if (prop === 'color') obj.set('fill', value);
            if (prop === 'fontFamily') obj.set('fontFamily', value);
        });
        fabricRef.current.renderAll();
    };

    const handleActiveStyleChange = async (prop, value) => {
        const active = fabricRef.current?.getActiveObject();
        if (!active) return;
        
        if (prop === 'fontFamily') {
            try { await document.fonts.load(`1rem "${value}"`); } catch(e) {}
        }
        
        active.set(prop, value);
        fabricRef.current.renderAll();
        setActiveObject(prev => ({ ...prev, [prop]: value }));
    };

    const handleGlobalFontSize = (delta) => {
        if (!fabricRef.current) return;
        const objs = fabricRef.current.getObjects().filter(o => o.type === 'i-text' || o.type === 'text');
        objs.forEach(obj => {
            const currentSize = obj.fontSize || 20;
            obj.set('fontSize', currentSize + delta);
        });
        fabricRef.current.renderAll();
    };

    const addNewText = () => {
        const newId = 'custom_' + Date.now();
        setFormFields(prev => [...prev, { id: newId, label: 'טקסט חופשי' }]);
        setFormData(prev => ({ ...prev, [newId]: 'טקסט חופשי' }));

        if (!fabricRef.current) return;
        const t = new window.fabric.IText('טקסט חופשי', {
            fieldId: newId,
            left: 300, top: 400,
            fontFamily: globalStyle.fontFamily, fontSize: 30,
            fill: globalStyle.color,
            textAlign: 'center', originX: 'center', originY: 'center', direction: 'rtl',
            transparentCorners: false, cornerColor: '#D4AF37', borderColor: '#D4AF37'
        });
        fabricRef.current.add(t);
        fabricRef.current.setActiveObject(t);
        fabricRef.current.renderAll();
    };

    const handleDownload = () => {
        if (!user) { setShowAuthModal(true); return; }
        if (!fabricRef.current) return;
        
        // Deselect before download so borders don't show
        fabricRef.current.discardActiveObject();
        fabricRef.current.renderAll();
        
        const url = fabricRef.current.toDataURL({ format: 'jpeg', quality: 1, multiplier: 3 });
        const a = document.createElement('a');
        a.download = 'Fiesta-Wedding-Invitation.jpg';
        a.href = url;
        a.click();
    };

    const copyLayoutConfig = () => {
        if (!fabricRef.current) return;
        const objs = fabricRef.current.getObjects().filter(o => o.fieldId && !o.fieldId.startsWith('custom_'));
        const layout = objs.map(o => ({
            id: o.fieldId,
            top: Math.round(o.top),
            left: Math.round(o.left),
            fontSize: o.fontSize,
            fontWeight: o.fontWeight
        }));
        
        const configStr = `'${selectedTemplate.id}': ` + JSON.stringify(layout, null, 4).replace(/"([^"]+)":/g, '$1:') + ',';
        navigator.clipboard.writeText(configStr);
        alert('המיקומים הועתקו! הדבק אותם בצ׳אט כדי שאשמור אותם לתבנית זו.');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fdfcf9', paddingTop: '80px', color: '#1a1a1a', overflow: 'hidden', fontFamily: 'Assistant, sans-serif' }}>
            {/* Hidden div to eagerly preload all fonts for Canvas */}
            <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
                {FONTS.map(f => <span key={f.id} style={{ fontFamily: f.id }}>טעינה</span>)}
            </div>

            {/* Header */}
            <div style={{ background: 'rgba(255, 255, 255, 0.98)', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '12px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '1.2rem', transition: 'color 0.3s' }} onMouseOver={e => e.currentTarget.style.color = '#D4AF37'} onMouseOut={e => e.currentTarget.style.color = '#666'}><i className="fas fa-arrow-right"></i></Link>
                    <h1 style={{ color: '#1a1a1a', margin: 0, fontSize: '1.5rem', fontFamily: 'Playfair Display, serif', fontWeight: 900 }}>
                        Fiesta <span style={{ color: '#D4AF37', fontWeight: 400, fontFamily: 'Assistant, sans-serif' }}>Studio</span>
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => { if(fabricRef.current) { fabricRef.current.remove(fabricRef.current.getActiveObject()); fabricRef.current.renderAll(); } }} style={{ background: '#fff', border: '1px solid #eee', color: '#ff5555', padding: '8px 18px', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'} title="מחק טקסט נבחר"><i className="fas fa-trash-alt"></i></button>
                    <button onClick={handleDownload} style={{ background: 'linear-gradient(135deg, #D4AF37, #b8952a)', border: 'none', color: 'white', padding: '8px 30px', borderRadius: '50px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>ייצוא HD</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', height: 'calc(100vh - 80px)' }}>
                {/* Sidebar */}
                <div style={{ background: 'white', borderLeft: '1px solid #eee', overflowY: 'auto', boxShadow: '-5px 0 30px rgba(0,0,0,0.02)', zIndex: 10 }}>
                    <div style={{ display: 'flex', background: '#fafafa', borderBottom: '1px solid #eee' }}>
                        {[{id:'templates',label:'תבניות עיצוב',icon:'fa-image'},{id:'form',label:'פרטי האירוע',icon:'fa-edit'}].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '20px', background: activeTab === tab.id ? 'white' : 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '3px solid #D4AF37' : '3px solid transparent', color: activeTab === tab.id ? '#D4AF37' : '#777', cursor: 'pointer', transition: 'all 0.3s' }}>
                                <i className={`fas ${tab.icon}`} style={{ display: 'block', fontSize: '1.3rem', marginBottom: '8px' }}></i>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: '25px' }}>
                        {activeTab === 'templates' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                {IMAGE_TEMPLATES.map(t => (
                                    <button key={t.id} onClick={() => handleTemplateSelect(t)} style={{ background: 'white', border: selectedTemplate.id === t.id ? '2px solid #D4AF37' : '1px solid #eee', borderRadius: '16px', padding: '6px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease', boxShadow: selectedTemplate.id === t.id ? '0 10px 20px rgba(212,175,55,0.15)' : '0 5px 15px rgba(0,0,0,0.04)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <div style={{ position: 'relative', width: '100%', aspectRatio: '600/840', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                                            <Image src={t.url} alt={t.name} fill style={{ objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ color: selectedTemplate.id === t.id ? '#D4AF37' : '#555', fontWeight: 800, fontSize: '0.8rem', paddingBottom: '6px' }}>{t.name}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeTab === 'form' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                
                                <div style={{ background: '#f9f8f4', padding: '15px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '10px' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', lineHeight: 1.5, textAlign: 'right' }}>
                                        <i className="fas fa-info-circle" style={{ color: '#D4AF37', marginLeft: '5px' }}></i>
                                        מלאו את הפרטים כאן, או פשוט לחצו וגררו את הטקסטים ישירות על גבי ההזמנה!
                                    </p>
                                </div>

                                {/* Dynamic Form Fields */}
                                {formFields.map(field => (
                                    <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label style={{ color: '#1a1a1a', fontSize: '0.9rem', fontWeight: 700 }}>{field.label}</label>
                                            {field.id.startsWith('custom_') && (
                                                <button onClick={() => {
                                                    setFormFields(p => p.filter(f => f.id !== field.id));
                                                    const obj = fabricRef.current.getObjects().find(o => o.fieldId === field.id);
                                                    if(obj) { fabricRef.current.remove(obj); fabricRef.current.renderAll(); }
                                                }} style={{ background: 'none', border: 'none', color: '#ff5555', cursor: 'pointer', padding: 0, fontSize: '0.8rem' }} title="מחק שדה">
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                        <textarea 
                                            rows={2}
                                            value={formData[field.id] || ''} 
                                            onChange={(e) => handleFormChange(field.id, e.target.value)}
                                            style={{ padding: '12px 15px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'Assistant', resize: 'vertical' }}
                                        />
                                    </div>
                                ))}

                                <hr style={{ borderTop: '1px solid #eee', margin: '10px 0' }} />

                                {/* Dynamic Style Controls (Global vs Selected) */}
                                {activeObject ? (
                                    <div style={{ background: '#f5fbff', padding: '15px', borderRadius: '12px', border: '1px solid #cce5ff', boxShadow: '0 4px 12px rgba(0,91,159,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <label style={{ color: '#005b9f', fontSize: '0.9rem', fontWeight: 800, display: 'block' }}>עיצוב טקסט ספציפי</label>
                                            <span style={{ fontSize: '0.7rem', background: '#005b9f', color: 'white', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold' }}>נבחר</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div>
                                                <label style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '5px' }}>סגנון גופן (Font)</label>
                                                <select value={activeObject.fontFamily} onChange={e => handleActiveStyleChange('fontFamily', e.target.value)} style={{ width: '100%', background: 'white', border: '1px solid #b3d7ff', borderRadius: '10px', padding: '12px 10px', color: '#1a1a1a', fontSize: '1.1rem', cursor: 'pointer', fontFamily: activeObject.fontFamily }}>
                                                    {FONTS.map(f => (
                                                        <option key={f.id} value={f.id} style={{ fontFamily: f.id, fontSize: '1.1rem' }}>
                                                            {f.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                <div>
                                                    <label style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '5px' }}>צבע הטקסט</label>
                                                    <div style={{ position: 'relative', width: '100%', height: '45px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #b3d7ff' }}>
                                                        <input type="color" value={activeObject.fill} onChange={e => handleActiveStyleChange('fill', e.target.value)} style={{ position: 'absolute', top: '-10px', left: '-10px', width: '150%', height: '150%', cursor: 'pointer', border: 'none' }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '5px' }}>גודל טקסט</label>
                                                    <div style={{ display: 'flex', gap: '5px', height: '45px' }}>
                                                        <button onClick={() => handleActiveStyleChange('fontSize', activeObject.fontSize + 3)} style={{ flex: 1, background: 'white', border: '1px solid #b3d7ff', borderRadius: '10px', cursor: 'pointer', color: '#005b9f', fontWeight: 'bold', fontSize: '1.1rem', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#e6f2ff'} onMouseOut={e => e.currentTarget.style.background='white'}>A+</button>
                                                        <button onClick={() => handleActiveStyleChange('fontSize', Math.max(10, activeObject.fontSize - 3))} style={{ flex: 1, background: 'white', border: '1px solid #b3d7ff', borderRadius: '10px', cursor: 'pointer', color: '#005b9f', fontWeight: 'bold', fontSize: '1.1rem', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#e6f2ff'} onMouseOut={e => e.currentTarget.style.background='white'}>A-</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
                                        <label style={{ color: '#1a1a1a', fontSize: '0.9rem', fontWeight: 800, display: 'block', marginBottom: '15px' }}>עיצוב טקסט כללי (לכל ההזמנה)</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div>
                                                <label style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '5px' }}>סגנון גופן (Font)</label>
                                                <select value={globalStyle.fontFamily} onChange={e => handleStyleChange('fontFamily', e.target.value)} style={{ width: '100%', background: 'white', border: '1px solid #ddd', borderRadius: '10px', padding: '12px 10px', color: '#1a1a1a', fontSize: '1.1rem', cursor: 'pointer', fontFamily: globalStyle.fontFamily }}>
                                                    {FONTS.map(f => (
                                                        <option key={f.id} value={f.id} style={{ fontFamily: f.id, fontSize: '1.1rem' }}>
                                                            {f.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                <div>
                                                    <label style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '5px' }}>צבע הטקסט</label>
                                                    <div style={{ position: 'relative', width: '100%', height: '45px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                                        <input type="color" value={globalStyle.color} onChange={e => handleStyleChange('color', e.target.value)} style={{ position: 'absolute', top: '-10px', left: '-10px', width: '150%', height: '150%', cursor: 'pointer', border: 'none' }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '5px' }}>גודל טקסט</label>
                                                    <div style={{ display: 'flex', gap: '5px', height: '45px' }}>
                                                        <button onClick={() => handleGlobalFontSize(3)} style={{ flex: 1, background: 'white', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', color: '#1a1a1a', fontWeight: 'bold', fontSize: '1.1rem', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }} onMouseOver={e => e.currentTarget.style.background='#f0f0f0'} onMouseOut={e => e.currentTarget.style.background='white'}>A+</button>
                                                        <button onClick={() => handleGlobalFontSize(-3)} style={{ flex: 1, background: 'white', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', color: '#1a1a1a', fontWeight: 'bold', fontSize: '1.1rem', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }} onMouseOver={e => e.currentTarget.style.background='#f0f0f0'} onMouseOut={e => e.currentTarget.style.background='white'}>A-</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button onClick={addNewText} style={{ background: 'transparent', color: '#1a1a1a', border: '2px dashed #ccc', borderRadius: '12px', padding: '15px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: '10px', transition: 'all 0.3s' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.color = '#D4AF37'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.color = '#1a1a1a'; }}>
                                    <i className="fas fa-plus" style={{ marginLeft: '8px' }}></i>
                                    הוסף תיבת טקסט חופשית
                                </button>
                                
                                <button onClick={copyLayoutConfig} style={{ background: '#eee', color: '#555', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', marginTop: '20px' }}>
                                    <i className="fas fa-code" style={{ marginLeft: '5px' }}></i>
                                    העתק מיקומים לתבנית (למפתחים)
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Studio Canvas Area with Auto-Scale */}
                <div ref={containerRef} style={{ background: '#f5f7f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '30px' }}>
                    <div style={{ 
                        transform: `scale(${canvasScale})`, 
                        transformOrigin: 'center', 
                        boxShadow: '0 30px 60px rgba(0,0,0,0.15)', 
                        background: '#fff',
                        transition: 'transform 0.2s ease-out',
                        borderRadius: '4px'
                    }}>
                        <canvas ref={canvasRef} />
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            <AnimatePresence>
                {showAuthModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAuthModal(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(15px)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
                            style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '30px', padding: '50px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                            <h2 style={{ color: '#1a1a1a', marginBottom: '15px', fontFamily: 'Playfair Display, serif', fontWeight: 900 }}>שמירת עיצוב</h2>
                            <p style={{ color: '#555', marginBottom: '30px', fontSize: '1.1rem' }}>הצטרפו ל-Fiesta כדי להוריד את ההזמנה שלכם באיכות הדפסה.</p>
                            <Link href="/register" style={{ background: 'linear-gradient(135deg, #D4AF37, #b8952a)', color: 'white', padding: '15px', borderRadius: '50px', fontWeight: 800, textDecoration: 'none', display: 'block', boxShadow: '0 10px 20px rgba(212,175,55,0.2)' }}>להרשמה חינם</Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
