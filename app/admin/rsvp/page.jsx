'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function RSVPAdminPage() {
    const [rsvps, setRsvps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalComing: 0,
        totalDeclined: 0,
        totalGuests: 0,
        pendingInvites: 0,
        totalVegan: 0,
        totalVeg: 0
    });
    const [invitationImage, setInvitationImage] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'confirmed', 'declined', 'pending'
    const [msgType, setMsgType] = useState('round1'); // 'round1', 'reminder', 'final', 'eventDay', 'thankYou'
    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState([]);
    const fileInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isEligible, setIsEligible] = useState(false); // Free if booked 2+ vendors
    const [showPayModal, setShowPayModal] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [hasShuttle, setHasShuttle] = useState(false); // Toggle for shuttle feature
    
    const [msgTemplates, setMsgTemplates] = useState({
        round1: "היי {name}! ✨\nנשמח מאוד לראותכם בחתונה שלנו ב-14.09.\nאנא אשרו הגעה בקישור הבא:\n{link}\n\nשלכם, נועה ודניאל",
        reminder: "היי {name}, מה קורה? 😊\nרק רצינו לוודא שקיבלתם את ההזמנה לחתונה שלנו.\nנשמח אם תוכלו לאשר הגעה כאן:\n{link}\n\nמחכים לכם!",
        final: "היי {name}, שבוע טוב! 🌸\nאנחנו סוגרים רשימות סופיות מול האולם.\nנודה מאוד לעדכון בקישור אם אתם מגיעים:\n{link}\n\nתודה, נועה ודניאל",
        eventDay: "היי {name}, זה קורה היום! 🎉\nמתרגשים מאוד לראות אתכם.\n📍 מקום: גן האירועים \"החורשה\"\n🪑 שולחן: {table}\n🚙 ניווט בוויז: {waze}\n\nנתראה בשמחות!",
        thankYou: "היי {name}, תודה רבה שבאתם לשמוח איתנו! ❤️\nהיה לנו ערב בלתי נשכח, והנוכחות שלכם הפכה אותו למיוחד אפילו יותר.\nאוהבים, נועה ודניאל"
    });
    const [isEditingMsg, setIsEditingMsg] = useState(false);

    useEffect(() => {
        // Load XLSX library from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.async = true;
        document.head.appendChild(script);
        
        fetchRSVPs();
        checkEligibility();
    }, []);

    const checkEligibility = () => {
        const status = localStorage.getItem('fiesta_customer_status');
        const hasPaid = localStorage.getItem('fiesta_rsvp_paid');
        if (status === 'סגר עם אולם ושני ספקים' || hasPaid === 'true') {
            setIsEligible(true);
        } else {
            setIsEligible(false);
        }
    };

    const fetchRSVPs = async () => {
        try {
            const res = await fetch('/api/rsvp?eventId=test-event-123');
            const data = await res.json();
            if (Array.isArray(data)) {
                setRsvps(data);
                calculateStats(data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const stats = data.reduce((acc, curr) => {
            if (curr.hasResponded) {
                if (curr.isComing) {
                    acc.totalComing += 1;
                    acc.totalGuests += (curr.guests || 1);
                    acc.totalVegan += (curr.veganCount || 0);
                    acc.totalVeg += (curr.vegCount || 0);
                } else {
                    acc.totalDeclined += 1;
                }
            } else if (curr.invitationStatus === 'not_sent') {
                acc.pendingInvites += 1;
            }
            return acc;
        }, { totalComing: 0, totalDeclined: 0, totalGuests: 0, pendingInvites: 0, totalVegan: 0, totalVeg: 0 });
        setStats(stats);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = window.XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
            
            // Map columns (Assume Name is 1st col, Phone is 2nd)
            const guests = data.slice(1).map(row => ({
                name: row[0],
                phone: row[1]?.toString().replace(/[^0-9]/g, '')
            })).filter(g => g.name && g.phone);
            
            setImportData(guests);
            setShowImportModal(true);
        };
        reader.readAsBinaryString(file);
    };

    const confirmImport = async () => {
        setIsImporting(true);
        try {
            const res = await fetch('/api/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bulk: true,
                    eventId: 'test-event-123',
                    guests: importData
                })
            });
            if (res.ok) {
                setShowImportModal(false);
                fetchRSVPs();
            }
        } catch (err) {
            alert('שגיאה בייבוא הנתונים');
        } finally {
            setIsImporting(false);
        }
    };

    const sendWhatsApp = async (rsvp) => {
        let template = msgTemplates[msgType];
        const rsvpUrl = `http://localhost:3000/rsvp`;
        const wazeUrl = `https://waze.com/ul?q=test-location`;

        // Replace placeholders
        let message = template
            .replace(/{name}/g, rsvp.name)
            .replace(/{link}/g, rsvpUrl)
            .replace(/{table}/g, rsvp.tableNumber || 'ימתין לכם בכניסה')
            .replace(/{waze}/g, wazeUrl);

        const imagePart = invitationImage ? `\n\nמצורפת ההזמנה שלנו: ${invitationImage}` : '';
        const fullMessage = message + (msgType === 'round1' ? imagePart : '');
        const url = `https://wa.me/${rsvp.phone.startsWith('0') ? '972' + rsvp.phone.substring(1) : rsvp.phone}?text=${encodeURIComponent(fullMessage)}`;
        
        window.open(url, '_blank');

        // Update status and round in DB
        const roundMap = { round1: 1, reminder: 2, final: 3, eventDay: 4 };
        try {
            await fetch('/api/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updateId: rsvp._id,
                    updateData: { 
                        invitationStatus: 'sent',
                        invitationRound: roundMap[msgType] 
                    }
                })
            });
            fetchRSVPs();
        } catch (err) {
            console.error('Update status error:', err);
        }
    };

    const handlePayment = () => {
        setPaymentProcessing(true);
        // Simulate payment processing
        setTimeout(() => {
            setPaymentProcessing(false);
            setPaymentSuccess(true);
            setTimeout(() => {
                setIsEligible(true);
                setShowPayModal(false);
                setPaymentSuccess(false);
                localStorage.setItem('fiesta_rsvp_paid', 'true');
            }, 2000);
        }, 3000);
    };

    return (
        <div className="admin-rsvp-root" dir="rtl">
            <div className="admin-header">
                <div className="container">
                    <div className="header-flex">
                        <div>
                            <h1>ניהול אורחים ואישורי הגעה</h1>
                            <p>ייבוא רשימות ושליחת הזמנות בווטסאפ</p>
                        </div>
                        <div className="invitation-image-setup">
                            <div className="img-preview-mini">
                                {invitationImage ? <img src={invitationImage} alt="הזמנה" /> : <div className="no-img">🖼️</div>}
                            </div>
                            <input 
                                type="text" 
                                placeholder="לינק לתמונת ההזמנה" 
                                value={invitationImage}
                                onChange={(e) => setInvitationImage(e.target.value)}
                                className="img-url-input"
                            />
                        </div>
                        <div className="header-actions">
                            <div className="setting-toggle">
                                <label className="switch">
                                    <input type="checkbox" checked={hasShuttle} onChange={(e) => setHasShuttle(e.target.checked)} />
                                    <span className="slider round"></span>
                                </label>
                                <span className="toggle-label">ניהול הסעות</span>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleFileUpload}
                                accept=".xlsx, .xls, .csv"
                            />
                            <button className="btn-import" onClick={() => fileInputRef.current.click()}>
                                <i className="fas fa-file-excel"></i> ייבוא מאקסל
                            </button>
                            <button className="btn-export" onClick={() => {/* ... */}}>
                                <i className="fas fa-download"></i> ייצוא
                            </button>
                            <button className="btn-share-hall" onClick={() => {
                                const url = `${window.location.origin}/rsvp/summary`;
                                navigator.clipboard.writeText(url);
                                alert('הקישור לצפייה עבור האולם הועתק! תוכלו לשלוח אותו למנהל האירוע.');
                            }}>
                                <i className="fas fa-share-alt"></i> שיתוף עם האולם
                            </button>
                            <Link href="/admin/seating" className="btn-seating">
                                <i className="fas fa-chair"></i> סידור שולחנות
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {!isEligible && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="eligibility-banner"
                    >
                        <div className="banner-content">
                            <div className="banner-text">
                                <h3>🎁 הטבת פייסטה בלעדית!</h3>
                                <p>סגרתם 2 ספקים דרך פייסטה? <strong>מערכת אישורי ההגעה והסידורי שולחן שלכם בחינם!</strong></p>
                                <p className="price-tag">עלות למשתמשים רגילים: <span className="old-price">₪400</span></p>
                            </div>
                            <div className="banner-actions">
                                <button className="btn-secondary" onClick={() => router.push('/category/dj')}>מצא ספק נוסף</button>
                                <button className="btn-premium" onClick={() => setShowPayModal(true)}>רכישת המערכת ב-₪400</button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Payment Modal */}
                <AnimatePresence>
                    {showPayModal && (
                        <div className="modal-overlay payment-overlay">
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                                className="modal-card payment-card"
                            >
                                <button className="close-btn" onClick={() => setShowPayModal(false)}>×</button>
                                
                                {!paymentSuccess ? (
                                    <>
                                        <div className="payment-header">
                                            <div className="fiesta-logo-small">Fiesta</div>
                                            <h2>רכישת חבילת אישורי הגעה</h2>
                                            <div className="price-badge">₪400</div>
                                        </div>

                                        <div className="payment-form">
                                            <div className="input-row">
                                                <label>שם על הכרטיס</label>
                                                <input type="text" placeholder="שם מלא" />
                                            </div>
                                            <div className="input-row">
                                                <label>מספר כרטיס</label>
                                                <div className="cc-input-wrapper">
                                                    <input type="text" placeholder="0000 0000 0000 0000" />
                                                    <i className="fas fa-credit-card"></i>
                                                </div>
                                            </div>
                                            <div className="input-grid">
                                                <div className="input-row">
                                                    <label>תוקף</label>
                                                    <input type="text" placeholder="MM/YY" />
                                                </div>
                                                <div className="input-row">
                                                    <label>CVV</label>
                                                    <input type="text" placeholder="123" />
                                                </div>
                                            </div>
                                            
                                            <div className="security-badges">
                                                <span><i className="fas fa-shield-alt"></i> תשלום מאובטח SSL</span>
                                                <div className="card-icons">
                                                    <i className="fab fa-cc-visa"></i>
                                                    <i className="fab fa-cc-mastercard"></i>
                                                </div>
                                            </div>

                                            <button 
                                                className={`btn-pay-now ${paymentProcessing ? 'processing' : ''}`}
                                                onClick={handlePayment}
                                                disabled={paymentProcessing}
                                            >
                                                {paymentProcessing ? (
                                                    <span className="loader-dots">מבצע תשלום<span>.</span><span>.</span><span>.</span></span>
                                                ) : 'בצע תשלום מאובטח'}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="payment-success-content">
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="success-icon"
                                        >
                                            <i className="fas fa-check-circle"></i>
                                        </motion.div>
                                        <h2>התשלום בוצע בהצלחה!</h2>
                                        <p>מערכת אישורי ההגעה והסידורי שולחן פתוחה עבורכם.</p>
                                        <p>מתחילים לעבוד...</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon coming">✅</div>
                        <div className="stat-info">
                            <h3>אישרו הגעה</h3>
                            <div className="value">{stats.totalGuests}</div>
                            <p>מתוך {stats.totalComing} אישורים</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon vegan">🌱</div>
                        <div className="stat-info">
                            <h3>טבעוניים</h3>
                            <div className="value">{stats.totalVegan}</div>
                            <p>מנות טבעוניות נדרשות</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon shuttle">🚌</div>
                        <div className="stat-info">
                            <h3>בהסעות</h3>
                            <div className="value">{rsvps.filter(r => r.shuttle).reduce((acc, curr) => acc + curr.guests, 0)}</div>
                            <p>אורחים רשומים</p>
                        </div>
                    </div>
                </div>

                <div className="table-header-row">
                    <div className="msg-config-flex" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="msg-type-selector">
                            <span>סוג הודעה לשליחה:</span>
                            <div className="msg-tabs">
                                <button className={msgType === 'round1' ? 'active' : ''} onClick={() => setMsgType('round1')}>סיבוב 1 (הזמנה)</button>
                                <button className={msgType === 'reminder' ? 'active' : ''} onClick={() => setMsgType('reminder')}>תזכורת</button>
                                <button className={msgType === 'final' ? 'active' : ''} onClick={() => setMsgType('final')}>סבב 3 - הודעה סופית</button>
                                <button className={msgType === 'eventDay' ? 'active' : ''} onClick={() => setMsgType('eventDay')}>סבב 4 - יום האירוע</button>
                                <button className={msgType === 'thankYou' ? 'active' : ''} onClick={() => setMsgType('thankYou')}>סבב 5 - תודה שבאתם 💌</button>
                            </div>
                        </div>
                        <button className="btn-edit-msg" onClick={() => setIsEditingMsg(!isEditingMsg)}>
                            <i className={isEditingMsg ? "fas fa-check" : "fas fa-edit"}></i>
                            {isEditingMsg ? "סיום עריכה" : "ערוך נוסח הודעה"}
                        </button>
                    </div>

                    <AnimatePresence>
                        {isEditingMsg && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="msg-editor-panel"
                            >
                                <div className="editor-inner">
                                    <div className="editor-header">
                                        <h4>עריכת הודעת {
                                            msgType === 'round1' ? 'הזמנה' : 
                                            msgType === 'reminder' ? 'תזכורת' : 
                                            msgType === 'final' ? 'סיבוב סופי' : 'יום האירוע'
                                        }</h4>
                                        <p>השתמשו ב-<code>{"{name}"}</code> עבור שם האורח, ו-<code>{"{link}"}</code> עבור הקישור לאישור.</p>
                                    </div>
                                    <textarea 
                                        value={msgTemplates[msgType]} 
                                        onChange={(e) => setMsgTemplates({...msgTemplates, [msgType]: e.target.value})}
                                        rows="5"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="table-filters">
                        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>הכל ({rsvps.length})</button>
                        <button className={filter === 'confirmed' ? 'active' : ''} onClick={() => setFilter('confirmed')}>אישרו ({stats.totalComing})</button>
                        <button className={filter === 'declined' ? 'active' : ''} onClick={() => setFilter('declined')}>לא באים ({stats.totalDeclined})</button>
                        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>טרם ענו ({rsvps.filter(r => !r.hasResponded).length})</button>
                    </div>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="loading-state">טוען נתונים...</div>
                    ) : rsvps.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📂</div>
                            <h3>הרשימה ריקה</h3>
                            <p>העלו קובץ אקסל עם שמות וטלפונים כדי להתחיל</p>
                            <button className="btn-primary-small" onClick={() => fileInputRef.current.click()}>העלאת קובץ עכשיו</button>
                        </div>
                    ) : (
                        <table className="rsvp-table">
                            <thead>
                                <tr>
                                    <th>שם האורח</th>
                                    <th>טלפון</th>
                                    <th>סטטוס שליחה</th>
                                    <th>סיבוב</th>
                                    <th>סטטוס אישור</th>
                                    <th>אורחים</th>
                                    <th>תזונה</th>
                                    <th>פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rsvps
                                    .filter(r => {
                                        if (filter === 'confirmed') return r.hasResponded && r.isComing;
                                        if (filter === 'declined') return r.hasResponded && !r.isComing;
                                        if (filter === 'pending') return !r.hasResponded;
                                        return true;
                                    })
                                    .map((rsvp) => (
                                    <tr key={rsvp._id}>
                                        <td className="guest-name">{rsvp.name}</td>
                                        <td>{rsvp.phone}</td>
                                        <td>
                                            <span className={`status-badge ${rsvp.invitationStatus}`}>
                                                {rsvp.invitationStatus === 'sent' ? 'נשלח' : 'טרם נשלח'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="round-indicator">
                                                {rsvp.invitationRound >= 1 && <span className="dot active"></span>}
                                                {rsvp.invitationRound >= 2 && <span className="dot active"></span>}
                                                {rsvp.invitationRound >= 3 && <span className="dot active"></span>}
                                                {rsvp.invitationRound >= 4 && <span className="dot event"></span>}
                                                <span className="round-text">
                                                    {rsvp.invitationRound === 0 ? 'חדש' : 
                                                     rsvp.invitationRound === 4 ? 'יום אירוע' : 
                                                     `סיבוב ${rsvp.invitationRound}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`confirm-badge ${rsvp.hasResponded ? (rsvp.isComing ? 'yes' : 'no-declined') : 'none'}`}>
                                                {rsvp.hasResponded 
                                                    ? (rsvp.isComing ? 'אישר/ה הגעה' : 'הודיע/ה שלא יבוא') 
                                                    : 'טרם השיב/ה'}
                                            </span>
                                        </td>
                                        <td>{rsvp.isComing ? rsvp.guests : '-'}</td>
                                        <td className="dietary-cell">
                                            {rsvp.isComing && (rsvp.veganCount > 0 || rsvp.vegCount > 0 || rsvp.dietary) ? (
                                                <div className="dietary-tags">
                                                    {rsvp.veganCount > 0 && <span className="tag vegan">🌱 {rsvp.veganCount}</span>}
                                                    {rsvp.vegCount > 0 && <span className="tag veg">🧀 {rsvp.vegCount}</span>}
                                                    {rsvp.dietary && <span className="tag other" title={rsvp.dietary}>💬</span>}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-whatsapp-send"
                                                onClick={() => sendWhatsApp(rsvp)}
                                            >
                                                <i className="fab fa-whatsapp"></i> {rsvp.invitationStatus === 'sent' ? 'שלח שוב' : 'שלח הזמנה'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Import Confirmation Modal */}
            <AnimatePresence>
                {showImportModal && (
                    <div className="modal-overlay">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="modal-card"
                        >
                            <h2>נמצאו {importData.length} אורחים</h2>
                            <p>האם ברצונכם לייבא אותם למערכת?</p>
                            <div className="import-preview">
                                {importData.slice(0, 5).map((g, i) => (
                                    <div key={i} className="preview-row">
                                        <span>{g.name}</span>
                                        <span>{g.phone}</span>
                                    </div>
                                ))}
                                {importData.length > 5 && <p>...ועוד {importData.length - 5} נוספים</p>}
                            </div>
                            <div className="modal-actions">
                                <button className="btn-confirm" onClick={confirmImport} disabled={isImporting}>
                                    {isImporting ? 'מייבא...' : 'אשר וייבא'}
                                </button>
                                <button className="btn-cancel" onClick={() => setShowImportModal(false)}>ביטול</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .admin-rsvp-root { min-height: 100vh; background: #f8fafc; font-family: 'Assistant', sans-serif; padding-bottom: 50px; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
                
                .admin-header { background: white; padding: 40px 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 40px; }
                .header-flex { display: flex; justify-content: space-between; align-items: center; gap: 30px; }
                .header-flex h1 { font-size: 2rem; font-weight: 900; color: #1e293b; margin-bottom: 5px; }
                
                .invitation-image-setup { display: flex; align-items: center; gap: 15px; background: #f8fafc; padding: 10px 20px; border-radius: 16px; border: 1px solid #e2e8f0; }
                .img-preview-mini { width: 50px; height: 70px; border-radius: 8px; background: #eee; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd; }
                .img-preview-mini img { width: 100%; height: 100%; object-fit: cover; }
                .img-url-input { padding: 10px; border-radius: 10px; border: 1px solid #eee; width: 250px; font-size: 0.85rem; }

                .header-actions { display: flex; gap: 15px; }
                .btn-import { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
                .btn-import:hover { background: #1d4ed8; transform: translateY(-2px); }
                .btn-export { background: #f1f5f9; color: #475569; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; text-decoration: none; display: flex; align-items: center; gap: 8px; }
                .btn-share-hall { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
                .btn-share-hall:hover { background: #fef3c7; transform: translateY(-2px); }
                .btn-seating { background: #1e293b; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
                .btn-seating:hover { background: #0f172a; transform: translateY(-2px); }

                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 40px; }
                .stat-card { background: white; padding: 30px; border-radius: 24px; display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                .stat-icon { width: 60px; height: 60px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
                .stat-icon.coming { background: #ecfdf5; }
                .stat-icon.vegan { background: #f0fdf4; }
                .stat-icon.veg { background: #fffbeb; }
                .stat-icon.pending { background: #fffbeb; }
                .stat-icon.total { background: #f8fafc; }
                
                .stat-info h3 { font-size: 0.9rem; font-weight: 700; color: #64748b; margin-bottom: 5px; }
                .stat-info .value { font-size: 2.2rem; font-weight: 900; color: #1e293b; line-height: 1; }

                .table-container { background: white; border-radius: 24px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                
                .table-header-row { display: flex; flex-direction: column; gap: 20px; align-items: flex-start; margin-bottom: 30px; background: white; padding: 25px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .msg-type-selector { display: flex; align-items: center; gap: 15px; width: 100%; }
                .msg-type-selector span { font-weight: 800; color: #1e293b; font-size: 0.9rem; white-space: nowrap; }
                .msg-tabs { display: flex; background: #f1f5f9; padding: 4px; border-radius: 12px; flex-wrap: wrap; }
                .msg-tabs button { 
                    padding: 8px 16px; border-radius: 10px; border: none; background: transparent; 
                    color: #64748b; font-weight: 700; cursor: pointer; font-size: 0.85rem; transition: 0.2s;
                }
                .msg-tabs button.active { background: white; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

                .table-filters { display: flex; gap: 10px; width: 100%; border-top: 1px solid #f1f5f9; pt: 15px; margin-top: 5px; padding-top: 15px; }
                .table-filters button { 
                    padding: 6px 15px; border-radius: 50px; border: 1px solid #e2e8f0; 
                    background: white; color: #64748b; font-weight: 700; cursor: pointer; 
                    font-size: 0.85rem; transition: 0.2s;
                }
                .table-filters button.active { background: #1e293b; color: white; border-color: #1e293b; }
                .table-filters button:hover:not(.active) { background: #f8fafc; }

                .btn-edit-msg { background: white; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 10px; font-weight: 700; color: #475569; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
                .btn-edit-msg:hover { background: #f8fafc; color: #2563eb; border-color: #2563eb; }

                .msg-editor-panel { width: 100%; margin-top: 10px; overflow: hidden; }
                .editor-inner { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; }
                .editor-header { margin-bottom: 15px; }
                .editor-header h4 { font-size: 1rem; font-weight: 800; margin-bottom: 5px; }
                .editor-header p { font-size: 0.8rem; color: #64748b; }
                .editor-header code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #1e293b; font-weight: 700; }
                .editor-inner textarea { width: 100%; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; font-family: inherit; font-size: 0.95rem; line-height: 1.5; resize: none; }
                .editor-inner textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

                .rsvp-table { width: 100%; border-collapse: collapse; text-align: right; }
                .rsvp-table th { padding: 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 800; }
                .rsvp-table td { padding: 15px; border-bottom: 1px solid #f8fafc; color: #475569; vertical-align: middle; }
                .guest-name { font-weight: 800; color: #1e293b !important; }
                
                .status-badge { padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; }
                .status-badge.sent { background: #dcfce7; color: #166534; }
                .status-badge.not_sent { background: #f1f5f9; color: #64748b; }

                .confirm-badge { padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; }
                .confirm-badge.yes { background: #ecfdf5; color: #059669; }
                .confirm-badge.no-declined { background: #fef2f2; color: #dc2626; }
                .confirm-badge.none { color: #94a3b8; }

                .round-indicator { display: flex; align-items: center; gap: 4px; }
                .round-indicator .dot { width: 6px; height: 6px; border-radius: 50%; background: #e2e8f0; }
                .round-indicator .dot.active { background: #2563eb; }
                .round-indicator .dot.event { background: #8b5cf6; }
                .round-text { font-size: 0.75rem; font-weight: 700; color: #64748b; margin-right: 5px; }

                .dietary-tags { display: flex; gap: 5px; justify-content: flex-end; }
                .tag { font-size: 0.7rem; padding: 2px 6px; border-radius: 6px; font-weight: 800; }
                .tag.vegan { background: #dcfce7; color: #166534; }
                .tag.veg { background: #fef9c3; color: #854d0e; }
                .tag.other { background: #f1f5f9; color: #64748b; cursor: help; }

                .btn-whatsapp-send { 
                    background: #25d366; color: white; border: none; padding: 8px 16px; 
                    border-radius: 10px; font-weight: 700; cursor: pointer; 
                    display: flex; align-items: center; gap: 8px; transition: 0.2s;
                    font-size: 0.85rem;
                }
                .btn-whatsapp-send:hover { background: #128c7e; transform: scale(1.05); }

                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-card { background: white; padding: 40px; border-radius: 32px; width: 100%; max-width: 500px; text-align: center; }
                .import-preview { background: #f8fafc; border-radius: 16px; padding: 20px; margin: 20px 0; text-align: right; }
                .preview-row { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 8px 0; }
                .modal-actions { display: flex; gap: 15px; justify-content: center; margin-top: 30px; }
                .btn-confirm { background: #2563eb; color: white; border: none; padding: 12px 30px; border-radius: 12px; font-weight: 700; cursor: pointer; }
                .btn-cancel { background: #f1f5f9; color: #64748b; border: none; padding: 12px 30px; border-radius: 12px; font-weight: 700; cursor: pointer; }

                .empty-state { text-align: center; padding: 60px; }
                .btn-primary-small { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; margin-top: 15px; }

                .setting-toggle { display: flex; align-items: center; gap: 10px; background: #f1f5f9; padding: 8px 15px; border-radius: 12px; margin-left: 15px; }
                .toggle-label { font-size: 0.85rem; font-weight: 800; color: #475569; }
                
                /* Switch Style */
                .switch { position: relative; display: inline-block; width: 40px; height: 22px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; }
                .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
                input:checked + .slider { background-color: #2563eb; }
                input:checked + .slider:before { transform: translateX(18px); }
                .slider.round { border-radius: 34px; }
                .slider.round:before { border-radius: 50%; }

                .eligibility-banner { 
                    background: linear-gradient(135deg, #1e293b 0%, #334155 100%); 
                    color: white; padding: 30px; border-radius: 24px; margin-bottom: 30px;
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.1);
                    position: relative; overflow: hidden;
                }
                .eligibility-banner::after {
                    content: 'PREMIUM'; position: absolute; top: 10px; left: -30px;
                    background: #fbbf24; color: #000; font-size: 0.7rem; font-weight: 900;
                    padding: 5px 40px; transform: rotate(-45deg);
                }
                .banner-content { display: flex; justify-content: space-between; align-items: center; }
                .banner-text h3 { font-size: 1.4rem; font-weight: 900; margin-bottom: 8px; color: #fbbf24; }
                .banner-text p { font-size: 1rem; opacity: 0.9; margin: 0; }
                .price-tag { margin-top: 10px !important; font-size: 0.9rem !important; }
                .old-price { text-decoration: line-through; opacity: 0.6; }

                .banner-actions { display: flex; gap: 15px; }
                .btn-premium { background: #fbbf24; color: #1e293b; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; }
                .btn-premium:hover { background: #f59e0b; transform: translateY(-2px); }
                .btn-secondary { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-secondary:hover { background: rgba(255,255,255,0.2); }

                .btn-secondary:hover { background: rgba(255,255,255,0.2); }

                .payment-overlay { z-index: 2000; }
                .payment-card { max-width: 450px; padding: 0; overflow: hidden; }
                .close-btn { position: absolute; top: 15px; left: 20px; background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; z-index: 10; }
                
                .payment-header { background: #1e293b; color: white; padding: 30px; text-align: center; position: relative; }
                .fiesta-logo-small { font-family: 'var(--font-display)'; font-size: 1.2rem; font-weight: 900; color: #fbbf24; margin-bottom: 10px; }
                .payment-header h2 { font-size: 1.2rem; font-weight: 800; margin: 0; }
                .price-badge { 
                    position: absolute; bottom: -20px; right: 50%; transform: translateX(50%);
                    background: #fbbf24; color: #1e293b; padding: 10px 25px; border-radius: 50px;
                    font-weight: 900; font-size: 1.2rem; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }

                .payment-form { padding: 40px 30px 30px; text-align: right; }
                .input-row { margin-bottom: 20px; }
                .input-row label { display: block; font-size: 0.8rem; font-weight: 800; color: #64748b; margin-bottom: 8px; }
                .input-row input { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 1rem; }
                .cc-input-wrapper { position: relative; }
                .cc-input-wrapper i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

                .security-badges { display: flex; justify-content: space-between; align-items: center; margin: 20px 0; border-top: 1px solid #f1f5f9; padding-top: 20px; }
                .security-badges span { font-size: 0.75rem; color: #22c55e; font-weight: 700; display: flex; align-items: center; gap: 5px; }
                .card-icons { display: flex; gap: 10px; font-size: 1.5rem; color: #cbd5e1; }

                .btn-pay-now { 
                    width: 100%; padding: 15px; background: #1e293b; color: white; border: none; 
                    border-radius: 15px; font-weight: 800; font-size: 1.1rem; cursor: pointer;
                    transition: 0.2s;
                }
                .btn-pay-now:hover { background: #0f172a; transform: translateY(-2px); }
                .btn-pay-now.processing { background: #94a3b8; cursor: not-allowed; transform: none; }

                .payment-success-content { padding: 50px 30px; }
                .success-icon { font-size: 4rem; color: #22c55e; margin-bottom: 20px; }
                .payment-success-content h2 { color: #1e293b; font-weight: 900; margin-bottom: 10px; }
                .payment-success-content p { color: #64748b; font-weight: 600; }

                @media (max-width: 900px) {
                    .stats-grid { grid-template-columns: 1fr; }
                    .header-flex { flex-direction: column; text-align: center; gap: 20px; }
                    .rsvp-table th:nth-child(4), .rsvp-table td:nth-child(4) { display: none; }
                }
            `}</style>
        </div>
    );
}
