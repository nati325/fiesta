'use client';

import Link from 'next/link';
import { useCustomers } from '@/context/CustomerContext';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useVendors } from '@/context/VendorContext';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAdminHeaders } from '@/lib/getAdminHeaders';
import { VENDOR_CATEGORIES, getCategoryLabel } from '@/lib/vendorCategories';
import AdminNav from '@/components/admin/AdminNav';
import FileUploadField from '@/components/admin/FileUploadField';
import {
    DOCUMENT_ACCEPT,
    uploadVendorFile,
    calculateClientPrice,
    buildVendorPayload,
} from '@/lib/vendorFormUtils';

const EMPTY_VENDOR_FORM = {
    name: '',
    type: 'design',
    contact: '',
    description: '',
    image: '',
    region: 'מרכז',
    eventTypes: ['חתונה'],
    originalPrice: '',
    price: '',
    discount: '',
    discountType: 'percent',
    commissionAmount: '',
    agreementSigned: false,
    agreementImage: '',
    adminNotes: '',
    googleReviewsLink: '',
    googleRating: 0,
    googleReviewsCount: 0,
    instagramLink: '',
    priceIncludesVat: true,
    videos: [],
    products: [],
    portfolio: [],
    mainProductId: ''
};

const EVENT_TYPES = [
    'חתונה', 'בר מצווה', 'בת מצווה', 'ברית', 'בריתה', 'אירוע עסקי', 'יום הולדת'
];

const StatCard = ({ count, label, icon, color, bg }) => (
    <div className="crm-stat-card">
        <div className="crm-stat-icon" style={{ backgroundColor: bg, color }}>
            <i className={`fas ${icon}`}></i>
        </div>
        <div className="crm-stat-info">
            <h4>{label}</h4>
            <div className="count">{count}</div>
        </div>
    </div>
);

export default function AdminPage() {
    return (
        <Suspense fallback={<div style={{ padding: '120px', textAlign: 'center' }}>טוען ניהול...</div>}>
            <AdminPageInner />
        </Suspense>
    );
}

function AdminPageInner() {
    const { addVendor, vendors, deleteVendor, updateVendor, loading: vendorsLoading } = useVendors();
    const { customers, addCustomer, updateCustomer, deleteCustomer, STATUS_OPTIONS, loading: customersLoading } = useCustomers();
    const { user, logout } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState('vendors');
    const [vendorSearch, setVendorSearch] = useState('');
    const [editingVendor, setEditingVendor] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [agreementUploading, setAgreementUploading] = useState(false);
    const [agreementFileName, setAgreementFileName] = useState('');
    const [showVendorAdvanced, setShowVendorAdvanced] = useState(false);
    const [legacyTypeCount, setLegacyTypeCount] = useState(null);
    const [patchingTypes, setPatchingTypes] = useState(false);
    const [vendorForm, setVendorForm] = useState({ ...EMPTY_VENDOR_FORM });
    const [customerForm, setCustomerForm] = useState({ 
        name: '', 
        phone: '', 
        status: STATUS_OPTIONS?.[0] || '', 
        meetingDate: '', 
        eventDate: '', 
        leadSource: 'אורגני', 
        budget: '', 
        instagram: '', 
        vat: false,
        videos: []
    });
    const [stats, setStats] = useState({ total: 0, last7Days: {} });

    const fetchStats = () => {
        fetch('/api/track', { headers: getAdminHeaders(false) })
            .then(res => res.ok ? res.json() : { total: 0, last7Days: {} })
            .then(data => setStats(data))
            .catch(() => { });
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab !== 'vendors') return;
        fetch('/api/patch-vendor-types', { headers: getAdminHeaders(false) })
            .then(res => res.ok ? res.json() : null)
            .then(data => setLegacyTypeCount(data?.total ?? 0))
            .catch(() => setLegacyTypeCount(0));
    }, [activeTab]);

    const patchLegacyVendorTypes = async () => {
        if (!confirm('לתקן ספקים עם קטגוריות ישנות (photography → photographer, music → dj)?')) return;
        setPatchingTypes(true);
        try {
            const res = await fetch('/api/patch-vendor-types', {
                method: 'POST',
                headers: getAdminHeaders(),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'שגיאה');
            alert(data.message);
            setLegacyTypeCount(0);
        } catch (err) {
            alert(err.message || 'שגיאה בתיקון קטגוריות');
        } finally {
            setPatchingTypes(false);
        }
    };

    const todayKey = useMemo(() => new Date().toDateString(), []);

    const filteredVendors = useMemo(() => {
        const q = vendorSearch.trim().toLowerCase();
        if (!q) return vendors;
        return vendors.filter(v => v.name.toLowerCase().includes(q));
    }, [vendors, vendorSearch]);

    const todayEvents = useMemo(
        () => customers.filter(c => c.eventDate && new Date(c.eventDate).toDateString() === todayKey),
        [customers, todayKey]
    );

    const todayMeetings = useMemo(
        () => customers.filter(c => c.meetingDate && new Date(c.meetingDate).toDateString() === todayKey),
        [customers, todayKey]
    );

    const closedDealsCount = useMemo(
        () => customers.filter(c => c.status?.startsWith('סגר')).length,
        [customers]
    );

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const handleDeleteVendor = (id, name) => {
        if (confirm(`למחוק את הספק "${name}"?`)) {
            deleteVendor(id);
        }
    };

    const handleDeleteCustomer = (id, name) => {
        if (confirm(`למחוק את הלקוח "${name}"?`)) {
            deleteCustomer(id);
        }
    };

    const resetVendorForm = () => {
        setVendorForm({ ...EMPTY_VENDOR_FORM });
        setEditingVendor(null);
        setImagePreview('');
        setAgreementFileName('');
        setShowVendorAdvanced(false);
    };

    const updatePricingField = (field, value) => {
        setVendorForm(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'originalPrice' || field === 'discount' || field === 'discountType') {
                const calculated = calculateClientPrice(next);
                if (calculated > 0) {
                    next.price = String(Math.round(calculated));
                }
            }
            return next;
        });
    };

    const handleVendorSubmit = (e) => {
        e.preventDefault();
        
        if (vendorForm.type === 'venue' && !vendorForm.contact) {
            alert('חובה להזין מספר טלפון של מנהל האולם עבור אולם/גן אירועים');
            return;
        }

        const payload = buildVendorPayload(vendorForm);

        const submit = editingVendor
            ? updateVendor(editingVendor.id, payload)
            : addVendor(payload);

        submit
            .then(() => {
                resetVendorForm();
                alert(editingVendor ? '✅ הספק עודכן בהצלחה' : '✅ הספק נוסף בהצלחה לאתר');
            })
            .catch(() => {});
    };

    const sendVendorAvailabilityCheck = (vendor) => {
        const date = prompt('עבור איזה תאריך לבדוק זמינות? (לדוגמה: 14.09)');
        if (!date) return;
        
        const msg = `היי ${vendor.name}, מה קורה? 😊\nרציתי לבדוק זמינות עבור תאריך ה-${date}.\nנשמח לעדכון אם פנוי! ✨\nמצוות פייסטה`;
        const phone = vendor.contact?.replace(/[^0-9]/g, '') || '';
        const fullPhone = phone.startsWith('0') ? '972' + phone.slice(1) : phone;
        window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const sendVendorDealSummary = (vendor) => {
        const clientPrice = vendor.price;
        const fiestaComm = vendor.commissionAmount;
        
        const msg = `סיכום הצעה - ${vendor.name} 📝\n\n💰 מחיר ללקוח: ₪${clientPrice}\n🤝 עמלת פייסטה: ₪${fiestaComm}\n\nנא לאשר שזה תואם את מה שסיכמנו!`;
        const phone = vendor.contact?.replace(/[^0-9]/g, '') || '';
        const fullPhone = phone.startsWith('0') ? '972' + phone.slice(1) : phone;
        window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleCustomerSubmit = (e) => {
        e.preventDefault();

        // Validation: If status is 'ממתין לפגישה', meetingDate is mandatory
        if (customerForm.status === 'ממתין לפגישה' && !customerForm.meetingDate) {
            alert('חובה להזין תאריך פגישה כאשר הסטטוס הוא "ממתין לפגישה"');
            return;
        }
        
        if (editingCustomer) {
            updateCustomer(editingCustomer.id, customerForm);
        } else {
            addCustomer(customerForm);
        }
        setCustomerForm({ 
            name: '', 
            phone: '', 
            status: STATUS_OPTIONS?.[0] || '', 
            meetingDate: '', 
            eventDate: '', 
            leadSource: 'אורגני', 
            budget: '', 
            instagram: '', 
            vat: false,
            videos: []
        });
        setEditingCustomer(null);
    };

    const sendAdminDailyTask = (customer) => {
        const msg = `🔔 תזכורת יום אירוע - ${customer.name}!\n\nהיום מתקיים האירוע של ${customer.name}.\n\nמשימות לביצוע:\n✅ לוודא גביית תשלום מכל הספקים הרלוונטיים.\n✅ לוודא שביעות רצון מול הזוג במהלך/סוף האירוע.\n✅ לבדוק אם יש חוסרים או בעיות של הרגע האחרון.\n\nבהצלחה! ✨`;
        const adminPhone = '972535378985'; // Fiesta Admin Official Line
        window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const sendMeetingFollowUp = (customer) => {
        const msg = `היי ${customer.name}, מה קורה? 😊\nרציתי לשאול איך הייתה הפגישה שלכם היום עם הספק? 🤝\n\nהאם הכל עבר כשורה? הרגשתם חיבור? סגרתם בסוף? 😉\n\nנשמח מאוד לשמוע עדכון כדי שנוכל להמשיך לעזור לכם להפיק את האירוע המושלם!\nשלכם, צוות פייסטה ✨`;
        const phone = customer.phone?.replace(/[^0-9]/g, '') || '';
        const fullPhone = phone.startsWith('0') ? '972' + phone.slice(1) : phone;
        window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const getWhatsAppMsg = (customer) => {
        const phone = customer.phone?.replace(/[^0-9]/g, '') || '';
        const fullPhone = phone.startsWith('0') ? '972' + phone.slice(1) : phone;
        const msg = `היי ${customer.name}, מה קורה? 😊\nרציתי לעדכן שהסטטוס שלך עודכן ל: ${customer.status}.\nנשמח לעמוד לרשותכם לכל שאלה! ✨\nצוות פייסטה`;
        return `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';

        setImageUploading(true);
        try {
            const data = await uploadVendorFile(file, 'image');
            setVendorForm(prev => ({ ...prev, image: data.url }));
            setImagePreview(data.url);
        } catch (err) {
            alert(err.message || 'שגיאה בהעלאת התמונה');
        } finally {
            setImageUploading(false);
        }
    };

    const handleAgreementUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';

        setAgreementUploading(true);
        try {
            const data = await uploadVendorFile(file, 'document');
            setVendorForm(prev => ({
                ...prev,
                agreementImage: data.url,
                agreementSigned: true
            }));
            setAgreementFileName(data.fileName || file.name);
        } catch (err) {
            alert(err.message || 'שגיאה בהעלאת הקובץ');
        } finally {
            setAgreementUploading(false);
        }
    };

    const startEditVendor = (vendor) => {
        setEditingVendor(vendor);
        setVendorForm({ ...EMPTY_VENDOR_FORM, ...vendor });
        setImagePreview(vendor.image || '');
        setAgreementFileName(
            vendor.agreementImage
                ? decodeURIComponent(vendor.agreementImage.split('/').pop() || '')
                : ''
        );
        setShowVendorAdvanced(true);
        setActiveTab('vendors');
        window.scrollTo(0, 0);
    };

    // Deep-link from public site: /admin?editVendor=<id> → dedicated edit page
    useEffect(() => {
        const editId = searchParams.get('editVendor');
        if (!editId) return;
        router.replace(`/admin/vendors/${editId}`);
    }, [searchParams, router]);

    const getMeetingCountdown = (date) => {
        if (!date) return null;
        const target = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diff = target - today;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return { text: 'היום!', color: '#e74c3c' };
        if (days === 1) return { text: 'מחר', color: '#f39c12' };
        if (days < 0) return { text: `עברו ${Math.abs(days)} ימים`, color: '#94a3b8' };
        return { text: `בעוד ${days} ימים`, color: '#2ecc71' };
    };

    return (
        <div className="admin-root" dir="rtl">
            <AdminNav
                user={user}
                onLogout={handleLogout}
                tabs={[
                    { id: 'vendors', label: 'ניהול ספקים', onClick: () => setActiveTab('vendors'), active: activeTab === 'vendors' },
                    { id: 'customers', label: 'ניהול לקוחות', onClick: () => setActiveTab('customers'), active: activeTab === 'customers' },
                    { id: 'stats', label: 'ביצועים וסטטיסטיקה', onClick: () => setActiveTab('stats'), active: activeTab === 'stats' },
                ]}
            />

            <main className="crm-main">
                <div className="crm-stats-row">
                    <StatCard count={vendorsLoading ? '...' : vendors.length} label="ספקים במערכת" icon="fa-handshake" color="#4a90e2" bg="#ebf4ff" />
                    <StatCard count={customersLoading ? '...' : customers.length} label="לידים פעילים" icon="fa-users" color="#2ecc71" bg="#eafaf1" />
                    <StatCard count={customersLoading ? '...' : closedDealsCount} label="עסקאות שנסגרו" icon="fa-check-circle" color="#f39c12" bg="#fef9e7" />
                    <StatCard count={stats.total.toLocaleString()} label="כניסות לאתר (סה״כ)" icon="fa-chart-line" color="#9b59b6" bg="#f5eef8" />
                </div>

                {(activeTab === 'vendors' || activeTab === 'customers') && (
                <>
                {/* Daily Admin Alerts Section */}
                <div className="admin-daily-alerts" style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>
                            <i className="fas fa-calendar-day" style={{ color: '#e74c3c', marginLeft: '10px' }}></i>
                            אירועים שמתקיימים היום
                        </h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {todayEvents.length > 0 ? (
                            todayEvents.map(c => (
                                <div key={c.id} style={{ background: 'white', padding: '20px', borderRadius: '20px', borderRight: '5px solid #e74c3c', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{c.name}</h4>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{c.status}</p>
                                    </div>
                                    <button 
                                        onClick={() => sendAdminDailyTask(c)}
                                        style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        שלח התראת ניהול
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: 'span 3', padding: '20px', background: '#f8fafc', borderRadius: '15px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                                אין אירועים רשומים להיום.
                            </div>
                        )}
                    </div>
                </div>

                {/* Daily Meetings Alerts Section */}
                <div className="admin-daily-alerts" style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>
                            <i className="fas fa-comments" style={{ color: '#3498db', marginLeft: '10px' }}></i>
                            פגישות שמתקיימות היום
                        </h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {todayMeetings.length > 0 ? (
                            todayMeetings.map(c => (
                                <div key={c.id} style={{ background: 'white', padding: '20px', borderRadius: '20px', borderRight: '5px solid #3498db', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{c.name}</h4>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>פגישה עם ספק</p>
                                    </div>
                                    <button 
                                        onClick={() => sendMeetingFollowUp(c)}
                                        style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        שלח פולו-אפ ללקוח
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: 'span 3', padding: '20px', background: '#f8fafc', borderRadius: '15px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                                אין פגישות רשומות להיום.
                            </div>
                        )}
                    </div>
                </div>
                </>
                )}

                <AnimatePresence mode="wait">
                    {activeTab === 'vendors' && (
                        <motion.div key="vendors_crm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="admin-vendor-toolbar">
                                <Link href="/admin/add-vendor" className="btn-primary admin-quick-add-link">
                                    📱 הוספה מהירה מהטלפון
                                </Link>
                                {legacyTypeCount > 0 && (
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={patchLegacyVendorTypes}
                                        disabled={patchingTypes}
                                    >
                                        {patchingTypes ? 'מתקן...' : `🔧 תקן ${legacyTypeCount} קטגוריות ישנות`}
                                    </button>
                                )}
                            </div>
                            <div className="crm-card">
                                <h3>{editingVendor ? 'עריכת ספק' : 'הוספת ספק חדש'}</h3>
                                <form onSubmit={handleVendorSubmit} className="vendor-form-simple">

                                    <div className="vendor-form-section">
                                        <h4>פרטים בסיסיים</h4>
                                        <div className="vendor-form-grid-simple">
                                            <div className="crm-input-group">
                                                <label>שם הספק *</label>
                                                <input value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} required placeholder="לדוגמה: DJ רועי כהן" />
                                            </div>
                                            <div className="crm-input-group">
                                                <label>קטגוריה *</label>
                                                <select value={vendorForm.type} onChange={e => setVendorForm({ ...vendorForm, type: e.target.value })}>
                                                    {VENDOR_CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                                </select>
                                            </div>
                                            <div className="crm-input-group">
                                                <label>אזור</label>
                                                <input value={vendorForm.region} onChange={e => setVendorForm({ ...vendorForm, region: e.target.value })} placeholder="מרכז, צפון..." />
                                            </div>
                                            <div className="crm-input-group">
                                                <label>{vendorForm.type === 'venue' ? 'טלפון מנהל האולם *' : 'טלפון (סודי)'}</label>
                                                <input
                                                    type="tel"
                                                    inputMode="tel"
                                                    autoComplete="tel"
                                                    value={vendorForm.contact}
                                                    onChange={e => setVendorForm({ ...vendorForm, contact: e.target.value })}
                                                    placeholder="050-1234567"
                                                    required={vendorForm.type === 'venue'}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="vendor-form-section">
                                        <h4>מחירים</h4>
                                        <div className="vendor-form-grid-simple">
                                            <div className="crm-input-group">
                                                <label>מחיר מקורי (₪)</label>
                                                <input type="number" value={vendorForm.originalPrice} onChange={e => updatePricingField('originalPrice', e.target.value)} placeholder="לפני הנחה" />
                                            </div>
                                            <div className="crm-input-group">
                                                <label>הנחת פייסטה</label>
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <input type="number" value={vendorForm.discount} onChange={e => updatePricingField('discount', e.target.value)} style={{ flex: 2 }} placeholder="10" />
                                                    <select value={vendorForm.discountType} onChange={e => updatePricingField('discountType', e.target.value)} style={{ flex: 1 }}>
                                                        <option value="percent">%</option>
                                                        <option value="amount">₪</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="crm-input-group">
                                                <label>מחיר ללקוח (₪) *</label>
                                                <input type="number" value={vendorForm.price} onChange={e => setVendorForm({ ...vendorForm, price: e.target.value })} required placeholder="מחושב אוטומטית" />
                                            </div>
                                            <div className="crm-input-group">
                                                <label>רווח מסגירה (₪)</label>
                                                <input type="number" value={vendorForm.commissionAmount} onChange={e => setVendorForm({ ...vendorForm, commissionAmount: e.target.value })} placeholder="עמלה" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="vendor-form-section">
                                        <h4>קבצים</h4>
                                        <div className="vendor-files-row">
                                            <FileUploadField
                                                label="תמונת הספק"
                                                hint="צלמו מהטלפון או העלו מהגלריה"
                                                accept="image/*"
                                                showCamera
                                                uploading={imageUploading}
                                                fileName={vendorForm.image && !imagePreview ? 'תמונה הועלתה' : ''}
                                                previewUrl={imagePreview || vendorForm.image}
                                                onFileSelect={handleImageUpload}
                                                icon="fa-image"
                                            />
                                            <div>
                                                <FileUploadField
                                                    label="הסכם / מסמך"
                                                    hint="צלמו את החוזה, או העלו PDF / Word"
                                                    accept={DOCUMENT_ACCEPT}
                                                    showCamera
                                                    uploading={agreementUploading}
                                                    fileName={agreementFileName}
                                                    previewUrl={vendorForm.agreementImage}
                                                    onFileSelect={handleAgreementUpload}
                                                    icon="fa-file-contract"
                                                />
                                                <label className="agreement-signed-row">
                                                    <input
                                                        type="checkbox"
                                                        checked={vendorForm.agreementSigned}
                                                        onChange={e => setVendorForm({ ...vendorForm, agreementSigned: e.target.checked })}
                                                    />
                                                    הסכם חתום
                                                </label>
                                                {vendorForm.agreementImage && (
                                                    <a href={vendorForm.agreementImage} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#4a90e2', marginTop: '6px', display: 'inline-block' }}>
                                                        <i className="fas fa-external-link-alt"></i> צפייה בקובץ
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="vendor-form-section">
                                        <h4>גלריית עבודות ({(vendorForm.portfolio || []).length})</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
                                            תמונות שיופיעו בגלריה בדף הספק באתר
                                        </p>
                                        {(vendorForm.portfolio || []).length > 0 && (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                                                {(vendorForm.portfolio || []).map((item, idx) => {
                                                    const src = typeof item === 'string' ? item : item?.image;
                                                    return (
                                                        <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <button
                                                                type="button"
                                                                onClick={() => setVendorForm((f) => ({
                                                                    ...f,
                                                                    portfolio: (f.portfolio || []).filter((_, i) => i !== idx),
                                                                }))}
                                                                style={{
                                                                    position: 'absolute', top: 4, left: 4,
                                                                    width: 22, height: 22, borderRadius: '50%',
                                                                    border: 'none', background: '#ef4444', color: 'white',
                                                                    cursor: 'pointer', fontWeight: 800, fontSize: 11,
                                                                }}
                                                                title="הסר"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <label
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: '10px 14px',
                                                borderRadius: 10,
                                                border: '1.5px dashed #94a3b8',
                                                cursor: 'pointer',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                color: '#334155',
                                                background: '#f8fafc',
                                            }}
                                        >
                                            <i className="fas fa-plus" />
                                            הוסף תמונות לגלריה
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                style={{ display: 'none' }}
                                                onChange={async (e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    e.target.value = '';
                                                    if (!files.length) return;
                                                    try {
                                                        for (const file of files) {
                                                            const data = await uploadVendorFile(file, 'image');
                                                            setVendorForm((f) => ({
                                                                ...f,
                                                                portfolio: [
                                                                    ...(f.portfolio || []),
                                                                    { title: `תמונה ${(f.portfolio || []).length + 1}`, image: data.url },
                                                                ],
                                                            }));
                                                        }
                                                    } catch (err) {
                                                        alert(err.message || 'שגיאה בהעלאת תמונות');
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>

                                    <div className="crm-input-group">
                                        <label>תיאור קצר (אופציונלי)</label>
                                        <textarea value={vendorForm.description} onChange={e => setVendorForm({ ...vendorForm, description: e.target.value })} rows={2} placeholder="משפט או שניים על הספק..." />
                                    </div>

                                    <button type="button" className="vendor-advanced-toggle" onClick={() => setShowVendorAdvanced(v => !v)}>
                                        <i className={`fas fa-chevron-${showVendorAdvanced ? 'up' : 'down'}`} style={{ marginLeft: '6px' }}></i>
                                        {showVendorAdvanced ? 'הסתר פרטים נוספים' : 'הצג פרטים נוספים (דירוג, אינסטגרם, סרטונים...)'}
                                    </button>

                                    {showVendorAdvanced && (
                                        <div className="vendor-advanced-panel">
                                            <div className="crm-input-group">
                                                <label>דירוג גוגל (0-5)</label>
                                                <input type="number" step="0.1" max="5" min="0" value={vendorForm.googleRating} onChange={e => setVendorForm({ ...vendorForm, googleRating: e.target.value })} />
                                            </div>
                                            <div className="crm-input-group">
                                                <label>כמות ביקורות</label>
                                                <input type="number" value={vendorForm.googleReviewsCount} onChange={e => setVendorForm({ ...vendorForm, googleReviewsCount: e.target.value })} />
                                            </div>
                                            <div className="crm-input-group">
                                                <label>לינק לאינסטגרם</label>
                                                <input value={vendorForm.instagramLink} onChange={e => setVendorForm({ ...vendorForm, instagramLink: e.target.value })} placeholder="https://instagram.com/..." />
                                            </div>
                                            <div className="crm-input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: 'row' }}>
                                                <input type="checkbox" checked={vendorForm.priceIncludesVat} onChange={e => setVendorForm({ ...vendorForm, priceIncludesVat: e.target.checked })} style={{ width: 'auto' }} />
                                                <label style={{ marginBottom: 0 }}>המחיר כולל מע"מ</label>
                                            </div>
                                            <div className="crm-input-group span-3" style={{ gridColumn: 'span 3' }}>
                                                <label>סוגי אירועים</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                                    {EVENT_TYPES.map(et => (
                                                        <label key={et} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                                                            <input
                                                                type="checkbox"
                                                                style={{ width: 'auto' }}
                                                                checked={vendorForm.eventTypes?.includes(et)}
                                                                onChange={(e) => {
                                                                    const current = vendorForm.eventTypes || [];
                                                                    setVendorForm({
                                                                        ...vendorForm,
                                                                        eventTypes: e.target.checked
                                                                            ? [...current, et]
                                                                            : current.filter(x => x !== et)
                                                                    });
                                                                }}
                                                            />
                                                            {et}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="crm-input-group span-3" style={{ gridColumn: 'span 3' }}>
                                                <label>סרטונים (YouTube/Vimeo)</label>
                                                {(vendorForm.videos || []).map((video, idx) => (
                                                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                                                        <input
                                                            value={video}
                                                            onChange={e => {
                                                                const newVideos = [...vendorForm.videos];
                                                                newVideos[idx] = e.target.value;
                                                                setVendorForm({ ...vendorForm, videos: newVideos });
                                                            }}
                                                            placeholder="קישור לסרטון"
                                                        />
                                                        <button type="button" onClick={() => setVendorForm({ ...vendorForm, videos: vendorForm.videos.filter((_, i) => i !== idx) })} className="btn-icon" style={{ color: '#e74c3c' }}>
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => setVendorForm({ ...vendorForm, videos: [...(vendorForm.videos || []), ''] })} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '5px 12px' }}>
                                                    + הוסף סרטון
                                                </button>
                                            </div>
                                            <div className="crm-input-group span-3" style={{ gridColumn: 'span 3' }}>
                                                <label>הערות מנהל (סודי)</label>
                                                <textarea value={vendorForm.adminNotes} onChange={e => setVendorForm({ ...vendorForm, adminNotes: e.target.value })} rows={2} placeholder="הערות פנימיות..." />
                                            </div>
                                        </div>
                                    )}

                                    <div className="crm-form-actions vendor-form-sticky-actions" style={{ gridColumn: 'unset', borderTop: '1px solid #f0f0f0', paddingTop: '16px', marginTop: 0 }}>
                                        <button type="submit" className="btn-primary btn-mobile-full">{editingVendor ? 'עדכן ספק' : 'שמור ספק חדש'}</button>
                                        {editingVendor && <button type="button" onClick={resetVendorForm} className="btn-secondary">ביטול עריכה</button>}
                                    </div>
                                </form>
                            </div>

                <div className="crm-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0 }}>ספקים קיימים ({filteredVendors.length})</h3>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>לחץ על &quot;עריכת ספק&quot; ליד כל שם</span>
                    </div>
                    <div className="crm-search-bar">
                        <div className="crm-search-input">
                            <i className="fas fa-search"></i>
                            <input placeholder="חיפוש ספק לפי שם..." value={vendorSearch} onChange={e => setVendorSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="crm-table-container">
                        <table className="crm-table">
                            <thead>
                                <tr>
                                    <th>שם ספק</th>
                                    <th>קטגוריה</th>
                                    <th>טלפון (מנהל)</th>
                                    <th>אזור</th>
                                    <th>מחיר והנחה</th>
                                    <th>סטטוס הסכם</th>
                                    <th style={{ textAlign: 'left' }}>פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVendors.map(v => (
                                    <tr key={v.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {v.image && <img src={v.image} alt={v.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{v.name}</div>
                                                    {v.adminNotes && (
                                                        <div style={{ fontSize: '0.7rem', color: '#856404', background: '#fff9e6', padding: '1px 5px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                            <i className="fas fa-sticky-note"></i> הערה
                                                        </div>
                                                    )}
                                                    <Link
                                                        href={`/admin/vendors/${v.id}`}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            marginTop: '8px',
                                                            background: '#16a34a',
                                                            color: 'white',
                                                            textDecoration: 'none',
                                                            padding: '8px 14px',
                                                            borderRadius: '8px',
                                                            fontWeight: 800,
                                                            fontSize: '0.85rem',
                                                            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)',
                                                        }}
                                                    >
                                                        <i className="fas fa-pen" />
                                                        עריכת ספק
                                                    </Link>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="crm-badge crm-badge-info">{getCategoryLabel(v.type)}</span></td>
                                        <td style={{ fontWeight: 600, color: '#4a90e2' }}>
                                            {v.contact || 'לא הוזן'}
                                        </td>
                                        <td>{v.region}</td>
                                        <td>
                                            {!v.price || String(v.price) === '0' ? (
                                                <div style={{ fontWeight: 600, color: '#c0392b' }}>חסר מחיר</div>
                                            ) : (
                                                <div style={{ fontWeight: 600 }}>₪{v.price}</div>
                                            )}
                                            {!v.discount || String(v.discount) === '0' ? (
                                                <div style={{ fontSize: '0.8rem', color: '#c0392b' }}>חסרה הנחה</div>
                                            ) : (
                                                <div style={{ fontSize: '0.8rem', color: '#e74c3c' }}>
                                                    {v.discount}{v.discountType === 'amount' ? '₪' : '%'} הטבה
                                                </div>
                                            )}
                                            {v.originalPrice && String(v.originalPrice) !== '0' && (
                                                <div style={{ fontSize: '0.75rem', color: '#999', textDecoration: 'line-through' }}>
                                                    ₪{v.originalPrice}
                                                </div>
                                            )}
                                        </td>
                                         <td>
                                            {v.agreementImage ? (
                                                <>
                                                    <span className="crm-badge crm-badge-success">חתום</span>
                                                    <a href={v.agreementImage} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', color: '#4a90e2' }} title="צפה בחוזה">
                                                        <i className="fas fa-file-alt"></i> חוזה
                                                    </a>
                                                </>
                                            ) : v.agreementSigned ? (
                                                <span className="crm-badge crm-badge-warning">חתום · חסר קובץ</span>
                                            ) : (
                                                <span className="crm-badge crm-badge-warning">ממתין לחוזה</span>
                                            )}
                                        </td>
                                        <td>
                                                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                        <button onClick={() => sendVendorAvailabilityCheck(v)} title="בדוק זמינות" style={{ background: '#3498db', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                                            <i className="far fa-calendar-check"></i>
                                                        </button>
                                                        <button onClick={() => sendVendorDealSummary(v)} title="שלח סיכום סגירה" style={{ background: '#f39c12', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                                            <i className="fas fa-file-invoice-dollar"></i>
                                                        </button>
                                                        <Link
                                                            href={`/admin/vendors/${v.id}`}
                                                            title="ערוך ספק"
                                                            style={{
                                                                background: '#2ecc71',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '5px 10px',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                textDecoration: 'none',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                fontWeight: 700,
                                                                fontSize: '0.8rem',
                                                            }}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                            עריכה
                                                        </Link>
                                                        <button onClick={() => handleDeleteVendor(v.id, v.name)} title="מחק" style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
                    )}
            {activeTab === 'customers' && (
                <motion.div key="customers_crm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className="crm-card">
                        <h3>{editingCustomer ? 'עריכת לקוח' : 'הוספת ליד חדש'}</h3>
                        <form onSubmit={handleCustomerSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                            <div className="crm-input-group">
                                <label>שם מלא</label>
                                <input value={customerForm.name} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} required />
                            </div>
                            <div className="crm-input-group">
                                <label>טלפון</label>
                                <input value={customerForm.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} required />
                            </div>
                            <div className="crm-input-group">
                                <label>תאריך האירוע</label>
                                <input type="date" value={customerForm.eventDate} onChange={e => setCustomerForm({ ...customerForm, eventDate: e.target.value })} />
                            </div>
                            <div className="crm-input-group">
                                <label>מקור ליד</label>
                                <select value={customerForm.leadSource} onChange={e => setCustomerForm({ ...customerForm, leadSource: e.target.value })}>
                                    <option value="אורגני">אורגני</option>
                                    <option value="פייסבוק">פייסבוק</option>
                                    <option value="אינסטגרם">אינסטגרם</option>
                                    <option value="המלצה">המלצה</option>
                                    <option value="גוגל">גוגל</option>
                                    <option value="אחר">אחר</option>
                                </select>
                            </div>
                            <div className="crm-input-group">
                                <label>תקציב משוער (₪)</label>
                                <input type="number" value={customerForm.budget} onChange={e => setCustomerForm({ ...customerForm, budget: e.target.value })} placeholder="לדוגמה: 100,000" />
                            </div>
                            <div className="crm-input-group">
                                <label>סטטוס טיפול</label>
                                <select value={customerForm.status} onChange={e => setCustomerForm({ ...customerForm, status: e.target.value })}>
                                    {STATUS_OPTIONS?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            {/* Meeting date - shows only when status = ממתין לפגישה */}
                            {customerForm.status === 'ממתין לפגישה' && (
                                <div className="crm-input-group" style={{ gridColumn: 'span 3', background: '#fdfaf0', padding: '15px', borderRadius: '12px', border: '1.5px solid #D4AF37' }}>
                                    <label style={{ color: '#D4AF37', fontWeight: 700 }}>
                                        <i className="fas fa-calendar-alt" style={{ marginLeft: '8px' }}></i>
                                        תאריך הפגישה
                                    </label>
                                    <input
                                        type="date"
                                        value={customerForm.meetingDate || ''}
                                        onChange={e => setCustomerForm({ ...customerForm, meetingDate: e.target.value })}
                                    />
                                    {customerForm.meetingDate && (() => {
                                        const cd = getMeetingCountdown(customerForm.meetingDate);
                                        return (
                                            <div style={{ marginTop: '8px', fontSize: '0.9rem', fontWeight: 700, color: cd?.color }}>
                                                <i className="fas fa-clock" style={{ marginLeft: '6px' }}></i>
                                                {cd?.text}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Vendor Selection - shows only when status starts with "סגר" */}
                            {customerForm.status?.startsWith('סגר') && (
                                <div className="crm-input-group" style={{ gridColumn: 'span 3', background: '#e6f4ea', padding: '15px', borderRadius: '12px', border: '1.5px solid #1e7e34' }}>
                                    <label style={{ color: '#1e7e34', fontWeight: 700 }}>
                                        <i className="fas fa-handshake" style={{ marginLeft: '8px' }}></i>
                                        ספק/אולם שסגר
                                    </label>
                                    <select
                                        value={customerForm.closedWithId || ''}
                                        onChange={e => setCustomerForm({ ...customerForm, closedWithId: e.target.value, closedWithTitle: vendors.find(v => v.id == e.target.value)?.name })}
                                        style={{ border: '1.5px solid #1e7e34' }}
                                    >
                                        <option value="">בחר ספק מהרשימה...</option>
                                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div style={{ gridColumn: 'span 3', display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                                {editingCustomer && <button type="button" className="btn btn-secondary" onClick={() => setEditingCustomer(null)}>ביטול עריכה</button>}
                                <button className="btn btn-primary" style={{ padding: '12px 60px' }}>{editingCustomer ? 'עדכן פרטי לקוח' : 'צור ליד חדש'}</button>
                            </div>
                        </form>
                    </div>

                    <div className="crm-card">
                        <h3>רשימת לידים</h3>
                        <div className="crm-table-container" style={{ marginTop: '20px' }}>
                            <table className="crm-table">
                                <thead>
                                    <tr>
                                        <th>שם הלקוח</th>
                                        <th>טלפון</th>
                                        <th>סטטוס</th>
                                        <th>פגישה</th>
                                        <th style={{ textAlign: 'left' }}>פעולות</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map(c => (
                                        <tr key={c.id}>
                                            <td style={{ fontWeight: 700, color: '#1a1a1a' }}>{c.name}</td>
                                            <td>
                                                <a href={`tel:${c.phone}`} style={{ color: '#4a90e2' }}>{c.phone}</a>
                                            </td>
                                            <td>
                                                <span className={`crm-badge ${c.status === 'ממתין לפגישה' ? 'crm-badge-warning' : c.status?.startsWith('סגר') ? 'crm-badge-success' : 'crm-badge-info'}`}>
                                                    {c.status}
                                                </span>
                                                {c.closedWithTitle && (
                                                    <div style={{ marginTop: '4px' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e7e34' }}>
                                                            <i className="fas fa-check-circle"></i> {c.closedWithTitle}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2ecc71', background: '#eafaf1', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', marginTop: '2px' }}>
                                                            + ₪{vendors.find(v => String(v.id) === String(c.closedWithId))?.commissionAmount || 0}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {c.meetingDate ? (
                                                    <div style={{ fontSize: '0.85rem' }}>
                                                        <div style={{ fontWeight: 600 }}>{new Date(c.meetingDate).toLocaleDateString('he-IL')}</div>
                                                        <div style={{ fontSize: '0.75rem', color: getMeetingCountdown(c.meetingDate)?.color, fontWeight: 700 }}>
                                                            {getMeetingCountdown(c.meetingDate)?.text}
                                                        </div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                    {c.eventId && (
                                                        <Link href={`/admin/rsvp?event=${c.eventId}`} className="btn-icon" style={{ color: '#9b59b6' }} title="ניהול RSVP">
                                                            <i className="fas fa-envelope-open-text"></i>
                                                        </Link>
                                                    )}
                                                    <a href={getWhatsAppMsg(c)} target="_blank" rel="noopener noreferrer" className="btn-icon" style={{ color: '#2ecc71' }} title="שלח ווטסאפ">
                                                        <i className="fab fa-whatsapp"></i>
                                                    </a>
                                                    <button title="עריכה" onClick={() => { setEditingCustomer(c); setCustomerForm(c); }} className="btn-icon"><i className="fas fa-edit"></i></button>
                                                    <button title="מחיקה" onClick={() => handleDeleteCustomer(c.id, c.name)} className="btn-icon" style={{ color: '#e74c3c' }}><i className="fas fa-trash"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === 'stats' && (
                <motion.div key="stats_crm" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                    <div className="crm-card">
                        <h3>ניתוח תנועה (7 ימים אחרונים)</h3>
                        {(() => {
                            const days = Object.keys(stats.last7Days || {}).sort();
                            const values = days.map(d => stats.last7Days[d]);
                            const max = Math.max(...values, 1);
                            const points = values.map((v, i) => ({
                                x: (i / (days.length - 1)) * 100,
                                y: 100 - (v / max) * 100,
                                val: v,
                                date: days[i],
                                rev: v
                            }));

                            return (
                                <>
                                    <div style={{ height: '250px', width: '100%', marginTop: '30px', position: 'relative' }}>
                                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            {/* Grid lines */}
                                            {[0, 25, 50, 75, 100].map(p => (
                                                <line key={p} x1="0" y1={p} x2="100" y2={p} stroke="#f0f0f0" strokeWidth="0.5" />
                                            ))}
                                            {/* The Line */}
                                            <motion.path
                                                d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`}
                                                fill="none"
                                                stroke="var(--primary-color)"
                                                strokeWidth="2"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                            />
                                            {/* Data Points */}
                                            {points.map((p, i) => (
                                                <g key={i}>
                                                    <motion.circle
                                                        cx={p.x} cy={p.y} r="1.5"
                                                        fill="white" stroke="var(--primary-color)" strokeWidth="1"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                                    />
                                                    {p.rev > 0 && (
                                                        <text x={p.x} y={p.y - 15} textAnchor="middle" style={{ fontSize: '12px', fontWeight: 700, fill: '#333' }}>
                                                            {p.val}
                                                        </text>
                                                    )}
                                                </g>
                                            ))}
                                        </svg>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', color: '#999', fontSize: '0.85rem', padding: '0 5px' }}>
                                        {days.map(d => (
                                            <span key={d}>{new Date(d).toLocaleDateString('he-IL', { weekday: 'short' }).replace('יום ', '')}</span>
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
                        {/* Revenue Breakdown Card */}
                        <div className="crm-card" style={{ height: 'fit-content' }}>
                            <h3>ניתוח הכנסות ורווחיות</h3>
                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ padding: '15px', background: '#fdfaf0', borderRadius: '15px', border: '1px solid #D4AF37' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#888' }}>סה"כ רווח מעסקאות שנסגרו</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#D4AF37' }}>
                                        ₪{customers.filter(c => c.status?.startsWith('סגר')).reduce((acc, curr) => {
                                            const vendor = vendors.find(v => String(v.id) === String(curr.closedWithId));
                                            return acc + (Number(vendor?.commissionAmount) || 0);
                                        }, 0).toLocaleString()}
                                    </div>
                                </div>

                                <div style={{ marginTop: '10px' }}>
                                    <h4 style={{ marginBottom: '10px', fontSize: '1rem' }}>פילוח לפי קטגוריות</h4>
                                    {VENDOR_CATEGORIES.map(cat => {
                                        const catVendors = vendors.filter(v => v.type === cat.value);
                                        const catRevenue = customers.filter(c => c.status?.startsWith('סגר')).reduce((acc, curr) => {
                                            const v = catVendors.find(vend => String(vend.id) === String(curr.closedWithId));
                                            return acc + (v ? (Number(v.commissionAmount) || 0) : 0);
                                        }, 0);
                                        const totalRevenue = customers.filter(c => c.status?.startsWith('סגר')).reduce((acc, curr) => {
                                            const v = vendors.find(vend => String(vend.id) === String(curr.closedWithId));
                                            return acc + (Number(v?.commissionAmount) || 0);
                                        }, 0) || 1;
                                        const percent = (catRevenue / totalRevenue) * 100;

                                        if (catRevenue === 0) return null;

                                        return (
                                            <div key={cat.value} style={{ marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                                                    <span>{cat.label}</span>
                                                    <span style={{ fontWeight: 700 }}>₪{catRevenue.toLocaleString()}</span>
                                                </div>
                                                <div style={{ height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${percent}%`, height: '100%', background: 'var(--primary-color)' }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Traffic & Performance Card */}
                        <div className="crm-card" style={{ height: 'fit-content' }}>
                            <h3>תנועת מבקרים וביצועים</h3>
                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '15px' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>כניסות ייחודיות (7 ימים)</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{Object.values(stats.last7Days || {}).reduce((a, b) => a + b, 0).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#2ecc71' }}><i className="fas fa-caret-up"></i> נתוני אמת</div>
                                    </div>
                                    <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '15px' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>סה"כ כניסות (מצטבר)</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.total?.toLocaleString() || 0}</div>
                                    </div>
                                </div>

                                <div style={{ padding: '20px', background: '#f0f7ff', borderRadius: '20px', border: '1px solid #4a90e2' }}>
                                    <h4 style={{ color: '#4a90e2', marginBottom: '15px' }}>משפך המרות (Conversion)</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span>סה"כ לידים</span>
                                            <span style={{ fontWeight: 700 }}>{customers.length}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span>סגירות בפועל</span>
                                            <span style={{ fontWeight: 700 }}>{customers.filter(c => c.status?.startsWith('סגר')).length}</span>
                                        </div>
                                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#4a90e2', marginBottom: '5px' }}>יחס המרה ליד/סגירה</div>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#4a90e2' }}>
                                                {Math.round((customers.filter(c => c.status?.startsWith('סגר')).length / (customers.length || 1)) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="crm-card" style={{ padding: '15px', background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)', color: 'white', border: 'none' }}>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>יחס המרה ליד/סגירה</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D4AF37' }}>
                                        {Math.round((customers.filter(c => c.status?.startsWith('סגר')).length / (customers.length || 1)) * 100)}%
                                    </div>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '5px' }}>
                                        {customers.filter(c => c.status?.startsWith('סגר')).length} סגירות מתוך {customers.length} לידים
                                    </p>
                                </div>

                                <div style={{ marginTop: '10px' }}>
                                    <h4 style={{ marginBottom: '10px', fontSize: '1rem' }}>הדפים הנצפים ביותר</h4>
                                    {stats.topPages?.map((tp, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '0.85rem' }}>
                                            <span style={{ dir: 'ltr' }}>{tp.page}</span>
                                            <span style={{ fontWeight: 700 }}>{tp.count} כניסות</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
            </main >
        </div >
    );
}
