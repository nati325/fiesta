'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

function RSVPContent() {
    const [step, setStep] = useState(1); // 1: Welcome/Names, 2: Form, 3: Thank you
    const [isComing, setIsComing] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        guests: 1,
        dietary: '',
        shuttle: false,
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const searchParams = useSearchParams();
    const [hasShuttleSetting, setHasShuttleSetting] = useState(false);

    useEffect(() => {
        // In a real app, we would fetch this from the event settings API
        // For now, we check the URL param ?shuttle=1
        if (searchParams.get('shuttle') === '1') {
            setHasShuttleSetting(true);
        }
    }, [searchParams]);

    // Mock Event Data
    const eventData = {
        couple: 'נועה & דניאל',
        date: 'יום שלישי, 14.09.2026',
        location: 'מתחם האירועים "שדות"',
        city: 'עמק חפר',
        time: '19:30'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    isComing,
                    eventId: 'test-event-123' // This would be dynamic in production
                })
            });
            
            if (response.ok) {
                setStep(3);
            } else {
                alert('חלה שגיאה בשליחת האישור. אנא נסו שוב.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('חלה שגיאה בחיבור לשרת.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rsvp-root" dir="rtl">
            <div className="background-overlay">
                <div className="gradient-overlay"></div>
            </div>

            <main className="rsvp-container">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card welcome-card"
                        >
                            <div className="decoration">✨</div>
                            <h2 className="event-label">מתחתנים!</h2>
                            <h1 className="couple-names">{eventData.couple}</h1>
                            <div className="event-details">
                                <p><i className="far fa-calendar-alt"></i> {eventData.date}</p>
                                <p><i className="fas fa-map-marker-alt"></i> {eventData.location}, {eventData.city}</p>
                                <p><i className="far fa-clock"></i> קבלת פנים: {eventData.time}</p>
                            </div>
                            
                            <div className="action-buttons">
                                <button 
                                    className="btn-primary" 
                                    onClick={() => { setIsComing(true); setStep(2); }}
                                >
                                    בטח שנגיע! 🎉
                                </button>
                                <button 
                                    className="btn-outline" 
                                    onClick={() => { setIsComing(false); setStep(2); }}
                                >
                                    לצערי לא נוכל להגיע
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="glass-card form-card"
                        >
                            <button className="back-link" onClick={() => setStep(1)}>
                                <i className="fas fa-chevron-right"></i> חזרה
                            </button>
                            
                            <h2>{isComing ? 'נשמח לראותכם!' : 'מצטערים שלא תוכלו להגיע'}</h2>
                            <p className="subtitle">
                                {isComing 
                                    ? 'אנא מלאו את הפרטים כדי שנוכל להיערך בהתאם' 
                                    : 'נודה לכם אם תעדכנו אותנו כדי שנדע'}
                            </p>

                            <form onSubmit={handleSubmit} className="rsvp-form">
                                <div className="input-group">
                                    <label>שם מלא</label>
                                    <input 
                                        type="text" 
                                        placeholder="איך קוראים לכם?" 
                                        required 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>מספר טלפון</label>
                                    <input 
                                        type="tel" 
                                        placeholder="בשביל הודעת האישור" 
                                        required 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>

                                {isComing && (
                                    <>
                                        <div className="input-group">
                                            <label>כמה מגיעים?</label>
                                            <div className="number-stepper">
                                                <button type="button" onClick={() => setFormData({...formData, guests: Math.max(1, formData.guests - 1)})}>-</button>
                                                <span>{formData.guests}</span>
                                                <button type="button" onClick={() => setFormData({...formData, guests: formData.guests + 1})}>+</button>
                                            </div>
                                        </div>

                                        <div className="dietary-options">
                                            <div className="input-group">
                                                <label>טבעוני 🌱</label>
                                                <div className="number-stepper mini">
                                                    <button type="button" onClick={() => setFormData({...formData, veganCount: Math.max(0, formData.veganCount - 1)})}>-</button>
                                                    <span>{formData.veganCount || 0}</span>
                                                    <button type="button" onClick={() => setFormData({...formData, veganCount: Math.min(formData.guests, (formData.veganCount || 0) + 1)})}>+</button>
                                                </div>
                                            </div>
                                            <div className="input-group">
                                                <label>צמחוני 🧀</label>
                                                <div className="number-stepper mini">
                                                    <button type="button" onClick={() => setFormData({...formData, vegCount: Math.max(0, formData.vegCount - 1)})}>-</button>
                                                    <span>{formData.vegCount || 0}</span>
                                                    <button type="button" onClick={() => setFormData({...formData, vegCount: Math.min(formData.guests, (formData.vegCount || 0) + 1)})}>+</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label>הערות קולינריות (צליאק / אלרגיות וכו')</label>
                                            <input 
                                                type="text" 
                                                placeholder="אם יש משהו שחשוב שנדע" 
                                                value={formData.dietary}
                                                onChange={(e) => setFormData({...formData, dietary: e.target.value})}
                                            />
                                        </div>

                                        {hasShuttleSetting && (
                                            <div className="checkbox-group">
                                                <label className="checkbox-container">
                                                    צריכים הסעה? 🚌
                                                    <input 
                                                        type="checkbox" 
                                                        checked={formData.shuttle}
                                                        onChange={(e) => setFormData({...formData, shuttle: e.target.checked})}
                                                    />
                                                    <span className="checkmark"></span>
                                                </label>
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="input-group">
                                    <label>משהו לזוג?</label>
                                    <textarea 
                                        placeholder="כתבו לנו משהו יפה..." 
                                        rows={3}
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    />
                                </div>

                                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'שולח...' : 'אישור ושליחה'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card success-card"
                        >
                            <div className="success-icon">❤️</div>
                            <h1>תודה רבה!</h1>
                            <p>
                                {isComing 
                                    ? 'האישור שלכם התקבל בהצלחה. מחכים לראותכם!' 
                                    : 'תודה על העדכון, נתראה בשמחות אחרות!'}
                            </p>
                            
                            <div className="success-actions">
                                <button className="btn-outline-dark" onClick={() => window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=החתונה+של+נועה+ודניאל&dates=20260914T163000Z/20260914T210000Z&details=נתראה+בשמחות!&location=${eventData.location}`, '_blank')}>
                                    <i className="far fa-calendar-plus"></i> הוספה ליומן
                                </button>
                                <button className="btn-outline-dark" onClick={() => window.open(`https://waze.com/ul?q=${encodeURIComponent(eventData.location + ' ' + eventData.city)}`, '_blank')}>
                                    <i className="fab fa-waze"></i> ניווט לאירוע
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="rsvp-footer">
                <p>הופק באמצעות <span className="logo">Fiesta</span></p>
            </footer>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700;800&family=Playfair+Display:wght@700;900&display=swap');
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

                :root {
                    --primary: #D4AF37;
                    --primary-dark: #B8962D;
                    --text: #1a1a1a;
                    --bg-overlay: rgba(255, 255, 255, 0.1);
                }

                .rsvp-root {
                    min-height: 100vh;
                    font-family: 'Assistant', sans-serif;
                    color: var(--text);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    position: relative;
                    overflow-x: hidden;
                }

                .background-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: -1;
                    background-image: url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80');
                    background-size: cover;
                    background-position: center;
                }

                .gradient-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%);
                }

                .rsvp-container {
                    width: 100%;
                    max-width: 500px;
                    z-index: 10;
                }

                .glass-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 40px;
                    padding: 40px;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.1);
                    text-align: center;
                }

                /* Welcome Card */
                .welcome-card .decoration { font-size: 2.5rem; margin-bottom: 10px; }
                .event-label { font-size: 1.1rem; font-weight: 700; color: var(--primary); letter-spacing: 2px; margin-bottom: 10px; }
                .couple-names { font-family: 'Playfair Display', serif; font-size: 3.5rem; font-weight: 900; margin-bottom: 30px; line-height: 1.2; }
                .event-details { margin-bottom: 40px; display: flex; flex-direction: column; gap: 12px; font-size: 1.1rem; color: #555; }
                .event-details i { color: var(--primary); width: 25px; }

                .action-buttons { display: flex; flex-direction: column; gap: 15px; }
                .btn-primary { 
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: white; border: none; padding: 18px; border-radius: 20px;
                    font-size: 1.2rem; font-weight: 800; cursor: pointer; transition: 0.3s;
                    box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3);
                }
                .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(212, 175, 55, 0.4); }
                
                .btn-outline {
                    background: transparent; border: 2px solid #eee; padding: 16px; border-radius: 20px;
                    font-size: 1rem; font-weight: 600; color: #888; cursor: pointer; transition: 0.3s;
                }
                .btn-outline:hover { background: rgba(0,0,0,0.02); color: #555; border-color: #ddd; }

                /* Form Card */
                .form-card { text-align: right; }
                .form-card h2 { font-size: 1.8rem; font-weight: 900; margin-bottom: 5px; }
                .subtitle { color: #888; margin-bottom: 30px; font-size: 1rem; }
                .back-link { background: none; border: none; color: var(--primary); font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; padding: 0; }
                
                .rsvp-form { display: flex; flex-direction: column; gap: 20px; }
                .input-group { display: flex; flex-direction: column; gap: 8px; }
                .input-group label { font-weight: 800; font-size: 0.9rem; color: #555; }
                .input-group input, .input-group textarea {
                    padding: 15px; border-radius: 15px; border: 1.5px solid #eee;
                    font-size: 1rem; background: rgba(255,255,255,0.5); transition: 0.2s;
                }
                .input-group input:focus, .input-group textarea:focus {
                    outline: none; border-color: var(--primary); background: white;
                }

                .number-stepper { display: flex; align-items: center; gap: 20px; background: #f8f9fa; width: fit-content; padding: 5px; border-radius: 12px; }
                .number-stepper button { width: 35px; height: 35px; border-radius: 10px; border: none; background: white; font-weight: 900; cursor: pointer; transition: 0.2s; }
                .number-stepper.mini { gap: 10px; }
                .number-stepper.mini button { width: 30px; height: 30px; font-size: 0.8rem; }
                .number-stepper.mini span { font-size: 1rem; min-width: 20px; }
                
                .dietary-options { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px; }

                .checkbox-container { display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 700; }
                .checkbox-container input { display: none; }
                .checkmark { width: 20px; height: 20px; border: 2px solid #ddd; border-radius: 6px; display: inline-block; position: relative; transition: 0.2s; }
                .checkbox-container input:checked + .checkmark { background: var(--primary); border-color: var(--primary); }
                .checkmark:after { content: '✔'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 0.7rem; opacity: 0; }
                .checkbox-container input:checked + .checkmark:after { opacity: 1; }

                .btn-submit {
                    background: #1a1a1a; color: white; border: none; padding: 18px; border-radius: 20px;
                    font-size: 1.2rem; font-weight: 800; cursor: pointer; margin-top: 10px; transition: 0.3s;
                }
                .btn-submit:hover { background: black; transform: scale(1.02); }
                .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Success Card */
                .success-icon { font-size: 4rem; margin-bottom: 20px; }
                .success-card h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 10px; }
                .success-card p { font-size: 1.2rem; color: #555; margin-bottom: 40px; line-height: 1.6; }
                .success-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .btn-outline-dark {
                    background: transparent; border: 1.5px solid #1a1a1a; padding: 12px; border-radius: 12px;
                    font-weight: 700; color: #1a1a1a; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
                }
                .btn-outline-dark:hover { background: #1a1a1a; color: white; }

                .rsvp-footer { margin-top: 40px; opacity: 0.6; font-size: 0.9rem; }
                .rsvp-footer .logo { font-family: 'Playfair Display', serif; font-weight: 900; color: var(--primary); }

                @media (max-width: 480px) {
                    .glass-card { padding: 30px 20px; border-radius: 30px; }
                    .couple-names { font-size: 2.5rem; }
                    .success-actions { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}

export default function RSVPPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Assistant' }}>טוען...</div>}>
            <RSVPContent />
        </Suspense>
    );
}
