'use client';

import Link from 'next/link';
import { useCustomers } from '@/context/CustomerContext';
import { useState, useEffect } from 'react';
import { useVendors } from '@/context/VendorContext';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { addVendor, vendors, deleteVendor, updateVendor } = useVendors();
    const { customers, addCustomer, updateCustomer, deleteCustomer, STATUS_OPTIONS } = useCustomers();

    const [activeTab, setActiveTab] = useState('vendors');
    const [vendorSearch, setVendorSearch] = useState('');
    const [articles, setArticles] = useState([]);

    const [editingVendor, setEditingVendor] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [editingArticle, setEditingArticle] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');

    const [vendorForm, setVendorForm] = useState({
        name: '', type: 'design', contact: '', description: '', image: '', region: 'מרכז', price: '', discount: '', agreementSigned: false
    });
    const [customerForm, setCustomerForm] = useState({ name: '', phone: '', status: STATUS_OPTIONS?.[0] || '', meetingDate: '' });
    const [articleForm, setArticleForm] = useState({ title: '', excerpt: '', image: '', link: '' });
    const [articleImagePreview, setArticleImagePreview] = useState('');
    const [articleImageUploading, setArticleImageUploading] = useState(false);

    const [packages, setPackages] = useState([]);
    const [editingPackage, setEditingPackage] = useState(null);
    const [packageForm, setPackageForm] = useState({ title: '', tagline: '', description: '', saving: '', badge: '', badgeColor: '#D4AF37', image: '', active: true });
    const [packageImagePreview, setPackageImagePreview] = useState('');
    const [packageImageUploading, setPackageImageUploading] = useState(false);

    const categoryLinks = [
        { label: '--- בחר קטגוריה ---', value: '' },
        { label: 'DJ ומוזיקה', value: '/category/dj' },
        { label: 'צלמים', value: '/category/photographer' },
        { label: 'אלכוהול ובר', value: '/category/alcohol' },
        { label: 'קייטרינג', value: '/category/catering' },
        { label: 'אולמות וגנים', value: '/category/venue' },
        { label: 'עיצוב אירועים', value: '/category/design' },
        { label: 'שמלות כלה', value: '/category/dresses' },
        { label: 'חליפות חתן', value: '/category/suits' },
        { label: 'עיצוב שיער', value: '/category/hair' },
        { label: 'איפור', value: '/category/makeup' },
        { label: 'טבעות נישואין', value: '/category/rings' },
        { label: 'נעלי כלה', value: '/category/bride-shoes' },
        { label: 'נעלי חתן', value: '/category/groom-shoes' },
        { label: 'הפקת אירועים', value: '/category/event-production' },
        { label: 'מנהלי אירועים', value: '/category/event-managers' },
        { label: 'הזמנות', value: '/category/invitations' },
        { label: 'הסעות', value: '/category/transportation' },
        { label: 'השכרת ציוד', value: '/category/equipment-rental' },
        { label: 'מסיבות רווקים', value: '/category/bachelor' },
        { label: 'ספא ונסיעות', value: '/category/spa-travel' },
        { label: 'מלונות', value: '/category/hotels' },
        { label: 'פייטנים', value: '/category/cantors' },
        { label: 'רב לחופה', value: '/category/rabbi' },
        { label: 'זמרים ולהקות', value: '/category/singers' },
        { label: 'אטרקציות', value: '/category/attractions' },
        { label: 'מזכרות', value: '/category/souvenirs' },
        { label: 'אולפני הקלטה', value: '/category/recording-studios' },
        { label: 'שיזוף', value: '/category/tanning' },
        { label: 'דיאטנים', value: '/category/dietitians' },
        { label: 'כושר אישי', value: '/category/personal-training' },
        { label: 'עלי אקספרס', value: '/category/aliexpress-ideas' },
    ];

    const categories = [
        { value: 'design', label: 'עיצוב אירועים' },
        { value: 'photographer', label: 'צלמים' },
        { value: 'dj', label: 'DJ ומוזיקה' },
        { value: 'catering', label: 'קייטרינג' },
        { value: 'venue', label: 'אולמות וגני אירועים' },
        { value: 'attractions', label: 'אטרקציות' },
        { value: 'suits', label: 'חליפות חתן' },
        { value: 'dresses', label: 'שמלות כלה' },
        { value: 'makeup', label: 'איפור' },
        { value: 'alcohol', label: 'בר אלכוהול' }
    ];

    useEffect(() => {
        fetchArticles();
        fetchPackages();
    }, []);

    const fetchArticles = () => {
        fetch('/api/articles')
            .then(res => res.json())
            .then(data => setArticles(data))
            .catch(() => setArticles([]));
    };

    const fetchPackages = () => {
        fetch('/api/packages')
            .then(res => res.json())
            .then(data => setPackages(data))
            .catch(() => setPackages([]));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show local preview instantly
        const localUrl = URL.createObjectURL(file);
        setImagePreview(localUrl);
        setImageUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                setVendorForm(prev => ({ ...prev, image: data.url }));
                setImagePreview(data.url);
            }
        } catch (err) {
            alert('שגיאה בהעלאת התמונה');
        } finally {
            setImageUploading(false);
        }
    };

    const handleVendorSubmit = (e) => {
        e.preventDefault();
        if (editingVendor) {
            updateVendor(editingVendor.id, vendorForm);
        } else {
            addVendor(vendorForm);
        }
        setVendorForm({ name: '', type: 'design', contact: '', description: '', image: '', region: 'מרכז', price: '', discount: '', agreementSigned: false });
        setEditingVendor(null);
        setImagePreview('');
    };

    const handleCustomerSubmit = (e) => {
        e.preventDefault();
        if (editingCustomer) {
            updateCustomer(editingCustomer.id, customerForm);
        } else {
            addCustomer(customerForm);
        }
        setCustomerForm({ name: '', phone: '', status: STATUS_OPTIONS?.[0] || '', meetingDate: '' });
        setEditingCustomer(null);
    };

    const getWhatsAppMsg = (customer) => {
        const phone = customer.phone?.replace(/[^0-9]/g, '') || '';
        const fullPhone = phone.startsWith('0') ? '972' + phone.slice(1) : phone;
        const msgs = {
            'ממתין לפגישה': `שלום ${customer.name}! היי מפיציסטה ורציתי לוודא שאישרת את הפגישה שלנו ל${customer.meetingDate ? new Date(customer.meetingDate).toLocaleDateString('he-IL') : 'התאריך הקרוב'}. אנא אשר או עדכן אותי אם יש שינוי בתוכניות ממך!`,
            'אחרי פגישה': `שלום ${customer.name}! היי מפיציסטה. הייתי שמח ללוודא - איך היתה הפגישה? אשמח לעזור בהמשך התהליך!`,
            'סגר עסקה עם אולם': `שלום ${customer.name}! מזל טוב על האולם! היי מפיציסטה. משיכים לחפש לכם את הספקים המושלמים לאירוע!`,
            'סגר עסקה עם ספק': `שלום ${customer.name}! מזל טוב על הספק! היי מפיציסטה. אשמח לעזור להשלים את התמונה!`,
        };
        const msg = msgs[customer.status] || `שלום ${customer.name}! היי מפיציסטה, אשמח לעזור!`;
        return `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
    };

    const getMeetingCountdown = (dateStr) => {
        if (!dateStr) return null;
        const diff = new Date(dateStr) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 0) return { text: `עברה לפני ${Math.abs(days)} ימים`, color: '#999' };
        if (days === 0) return { text: 'היום!', color: '#e74c3c' };
        if (days === 1) return { text: 'מחר!', color: '#f39c12' };
        if (days <= 3) return { text: `עוד ${days} ימים`, color: '#f39c12' };
        return { text: `עוד ${days} ימים`, color: '#1e7e34' };
    };

    const handleArticleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const localUrl = URL.createObjectURL(file);
        setArticleImagePreview(localUrl);
        setArticleImageUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                setArticleForm(prev => ({ ...prev, image: data.url }));
                setArticleImagePreview(data.url);
            }
        } catch { alert('שגיאה בהעלאת תמונה'); }
        finally { setArticleImageUploading(false); }
    };

    const handleArticleSubmit = (e) => {
        e.preventDefault();
        const method = editingArticle ? 'PUT' : 'POST';
        const url = editingArticle ? `/api/articles/${editingArticle.id}` : '/api/articles';
        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articleForm)
        }).then(() => {
            setArticleForm({ title: '', excerpt: '', image: '', link: '' });
            setEditingArticle(null);
            setArticleImagePreview('');
            fetchArticles();
        });
    };

    const handlePackageImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const localUrl = URL.createObjectURL(file);
        setPackageImagePreview(localUrl);
        setPackageImageUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                setPackageForm(prev => ({ ...prev, image: data.url }));
                setPackageImagePreview(data.url);
            }
        } catch { alert('שגיאה בהעלאת תמונה'); }
        finally { setPackageImageUploading(false); }
    };

    const handlePackageSubmit = (e) => {
        e.preventDefault();
        const method = editingPackage ? 'PUT' : 'POST';
        const url = editingPackage ? `/api/packages/${editingPackage.id}` : '/api/packages';
        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(packageForm)
        }).then(() => {
            setPackageForm({ title: '', tagline: '', description: '', saving: '', badge: '', badgeColor: '#D4AF37', image: '', active: true });
            setEditingPackage(null);
            setPackageImagePreview('');
            fetchPackages();
        });
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-logo">
                    <h2>Fiesta CRM</h2>
                </div>
                <nav className="admin-sidebar-nav">
                    <button className={`admin-nav-item ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}>
                        <i className="fas fa-users"></i>
                        <span>ניהול ספקים</span>
                    </button>
                    <button className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
                        <i className="fas fa-user-friends"></i>
                        <span>לידים ולקוחות</span>
                    </button>
                    <button className={`admin-nav-item ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}>
                        <i className="fas fa-box-open"></i>
                        <span>חבילות מבצע</span>
                    </button>
                    <button className={`admin-nav-item ${activeTab === 'articles' ? 'active' : ''}`} onClick={() => setActiveTab('articles')}>
                        <i className="fas fa-file-alt"></i>
                        <span>תוכן ומאמרים</span>
                    </button>
                </nav>
                <div className="admin-sidebar-footer">
                    <Link href="/" className="admin-nav-item">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>חזרה לאתר</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main-content">
                <header className="admin-header">
                    <div className="admin-title-section">
                        <h1>{
                            activeTab === 'vendors' ? 'ניהול ספקים' :
                                activeTab === 'customers' ? 'לידים ולקוחות' :
                                    activeTab === 'packages' ? 'חבילות מבצע' :
                                        activeTab === 'articles' ? 'ניהול תוכן' : 'הגדרות'
                        }</h1>
                        <p>שלום מנהל, ברוך הבא ללוח הבקרה של Fiesta</p>
                    </div>
                </header>

                <div className="admin-stats-container">
                    <StatCard count={vendors.length} label="ספקים רשומים" icon="fa-users" color="#4a90e2" bg="#e8f0fe" />
                    <StatCard count={customers.length} label="לידים חדשים" icon="fa-user-plus" color="#1e7e34" bg="#e6f4ea" />
                    <StatCard count={articles.length} label="מאמרים בבלוג" icon="fa-newspaper" color="#f2994a" bg="#fff4e5" />
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'vendors' && (
                        <motion.div key="vendors_crm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="crm-card">
                                <h3>{editingVendor ? 'עריכת ספק' : 'הוספת ספק חדש'}</h3>
                                <form onSubmit={handleVendorSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                                    <div className="crm-input-group">
                                        <label>שם העסק</label>
                                        <input value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} required />
                                    </div>
                                    <div className="crm-input-group">
                                        <label>סוג שירות</label>
                                        <select value={vendorForm.type} onChange={e => setVendorForm({ ...vendorForm, type: e.target.value })}>
                                            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="crm-input-group">
                                        <label>אזור פעילות</label>
                                        <select value={vendorForm.region} onChange={e => setVendorForm({ ...vendorForm, region: e.target.value })}>
                                            <option value="מרכז">מרכז</option>
                                            <option value="צפון">צפון</option>
                                            <option value="דרום">דרום</option>
                                            <option value="כל הארץ">כל הארץ</option>
                                        </select>
                                    </div>
                                    <div className="crm-input-group" style={{ gridColumn: 'span 3' }}>
                                        <label>תיאור העסק (יוצג באתר)</label>
                                        <textarea value={vendorForm.description} onChange={e => setVendorForm({ ...vendorForm, description: e.target.value })} rows="3" />
                                    </div>
                                    {/* Image Upload Field */}
                                    <div className="crm-input-group" style={{ gridColumn: 'span 3' }}>
                                        <label>תמונת הספק</label>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1 }}>
                                                <label htmlFor="vendor-image-upload" style={{
                                                    display: 'flex', alignItems: 'center', gap: '10px',
                                                    padding: '14px 18px', borderRadius: '12px',
                                                    border: '2px dashed #D4AF37', background: '#fdfaf0',
                                                    cursor: 'pointer', fontWeight: '600', color: '#D4AF37',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.3rem' }}></i>
                                                    {imageUploading ? 'מעלה תמונה...' : 'לחץ לבחירת תמונה'}
                                                    <input
                                                        id="vendor-image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={handleImageUpload}
                                                    />
                                                </label>
                                                {vendorForm.image && (
                                                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#888', wordBreak: 'break-all' }}>
                                                        <i className="fas fa-check-circle" style={{ color: '#1e7e34', marginLeft: '5px' }}></i>
                                                        {vendorForm.image}
                                                    </div>
                                                )}
                                            </div>
                                            {(imagePreview || vendorForm.image) && (
                                                <div style={{ position: 'relative' }}>
                                                    <img
                                                        src={imagePreview || vendorForm.image}
                                                        alt="תצוגה מקדימה"
                                                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #f0f0f0' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => { setImagePreview(''); setVendorForm(prev => ({ ...prev, image: '' })); }}
                                                        style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="crm-input-group">
                                        <label>מחיר בסיס (₪)</label>
                                        <input type="number" value={vendorForm.price} onChange={e => setVendorForm({ ...vendorForm, price: e.target.value })} />
                                    </div>
                                    <div className="crm-input-group">
                                        <label>אחוז הנחה לחברים (%)</label>
                                        <input type="number" value={vendorForm.discount} onChange={e => setVendorForm({ ...vendorForm, discount: e.target.value })} />
                                    </div>
                                    <div className="crm-input-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '15px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={vendorForm.agreementSigned} onChange={e => setVendorForm({ ...vendorForm, agreementSigned: e.target.checked })} />
                                            <span>הסכם חתום</span>
                                        </label>
                                    </div>
                                    <div style={{ gridColumn: 'span 3', display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                                        {editingVendor && <button type="button" className="btn btn-secondary" onClick={() => setEditingVendor(null)}>ביטול עריכה</button>}
                                        <button className="btn btn-primary" style={{ padding: '12px 60px' }}>{editingVendor ? 'עדכן ספק' : 'צור ספק חדש'}</button>
                                    </div>
                                </form>
                            </div>

                            <div className="crm-card">
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
                                                <th>אזור</th>
                                                <th>מחיר והנחה</th>
                                                <th>סטטוס הסכם</th>
                                                <th style={{ textAlign: 'left' }}>פעולות</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendors.filter(v => v.name.includes(vendorSearch)).map(v => (
                                                <tr key={v.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            {v.image && <img src={v.image} alt={v.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />}
                                                            <span style={{ fontWeight: 700, color: '#1a1a1a' }}>{v.name}</span>
                                                        </div>
                                                    </td>
                                                    <td><span className="crm-badge crm-badge-info">{categories.find(c => c.value === v.type)?.label}</span></td>
                                                    <td>{v.region}</td>
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>₪{v.price}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#e74c3c' }}>{v.discount}% הנחה</div>
                                                    </td>
                                                    <td>{v.agreementSigned ? <span className="crm-badge crm-badge-success">חתום</span> : <span className="crm-badge crm-badge-warning">ממתין</span>}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            <button title="עריכה" onClick={() => { setEditingVendor(v); setVendorForm(v); setImagePreview(v.image || ''); }} className="btn-icon"><i className="fas fa-edit"></i></button>
                                                            <button title="מחיקה" onClick={() => deleteVendor(v.id)} className="btn-icon" style={{ color: '#e74c3c' }}><i className="fas fa-trash"></i></button>
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
                                                    </td>
                                                    <td>
                                                        {c.status === 'ממתין לפגישה' && c.meetingDate ? (
                                                            <div>
                                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                                                    {new Date(c.meetingDate).toLocaleDateString('he-IL')}
                                                                </div>
                                                                {(() => {
                                                                    const cd = getMeetingCountdown(c.meetingDate);
                                                                    return <div style={{ fontSize: '0.75rem', color: cd?.color, fontWeight: 700 }}>{cd?.text}</div>;
                                                                })()}
                                                            </div>
                                                        ) : (
                                                            <span style={{ color: '#ccc', fontSize: '0.8rem' }}>-</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                            <a
                                                                href={getWhatsAppMsg(c)}
                                                                target="_blank" rel="noreferrer"
                                                                title={`שלח וואטסאפ - ${c.status}`}
                                                                style={{ background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
                                                            >
                                                                <i className="fab fa-whatsapp"></i>
                                                                {c.status === 'ממתין לפגישה' ? 'אישור' :
                                                                 c.status === 'אחרי פגישה' ? 'מעקב' :
                                                                 c.status?.startsWith('סגר') ? 'מזל טוב' : 'שלח'}
                                                            </a>
                                                            <button title="עריכה" onClick={() => { setEditingCustomer(c); setCustomerForm(c); }} className="btn-icon"><i className="fas fa-edit"></i></button>
                                                            <button title="מחיקה" onClick={() => deleteCustomer(c.id)} className="btn-icon" style={{ color: '#e74c3c' }}><i className="fas fa-trash"></i></button>
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

                    {activeTab === 'articles' && (
                        <motion.div key="articles_crm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="crm-card">
                                <h3>{editingArticle ? 'עריכת מאמר' : 'הוספת מאמר חדש'}</h3>
                                <form onSubmit={handleArticleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                                    <div className="crm-input-group">
                                        <label>כותרת המאמר</label>
                                        <input value={articleForm.title} onChange={e => setArticleForm({ ...articleForm, title: e.target.value })} required />
                                    </div>
                                    <div className="crm-input-group">
                                        <label>תקציר / תיאור</label>
                                        <textarea value={articleForm.excerpt} onChange={e => setArticleForm({ ...articleForm, excerpt: e.target.value })} rows="3" required />
                                    </div>

                                    {/* Image Upload */}
                                    <div className="crm-input-group">
                                        <label>תמונת המאמר</label>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1 }}>
                                                <label htmlFor="article-image-upload" style={{
                                                    display: 'flex', alignItems: 'center', gap: '10px',
                                                    padding: '14px 18px', borderRadius: '12px',
                                                    border: '2px dashed #D4AF37', background: '#fdfaf0',
                                                    cursor: 'pointer', fontWeight: '600', color: '#D4AF37'
                                                }}>
                                                    <i className="fas fa-image" style={{ fontSize: '1.3rem' }}></i>
                                                    {articleImageUploading ? 'מעלה תמונה...' : 'לחץ לבחירת תמונה'}
                                                    <input id="article-image-upload" type="file" accept="image/*"
                                                        style={{ display: 'none' }} onChange={handleArticleImageUpload} />
                                                </label>
                                                {articleForm.image && (
                                                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#888', wordBreak: 'break-all' }}>
                                                        <i className="fas fa-check-circle" style={{ color: '#1e7e34', marginLeft: '5px' }}></i>
                                                        {articleForm.image}
                                                    </div>
                                                )}
                                            </div>
                                            {(articleImagePreview || articleForm.image) && (
                                                <div style={{ position: 'relative' }}>
                                                    <img src={articleImagePreview || articleForm.image} alt="תצוגה"
                                                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #f0f0f0' }} />
                                                    <button type="button"
                                                        onClick={() => { setArticleImagePreview(''); setArticleForm(prev => ({ ...prev, image: '' })); }}
                                                        style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.7rem' }}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Category Link */}
                                    <div className="crm-input-group">
                                        <label>קישור לדף קטגוריה באתר</label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <select
                                                value={categoryLinks.find(l => l.value === articleForm.link) ? articleForm.link : ''}
                                                onChange={e => setArticleForm({ ...articleForm, link: e.target.value })}
                                                style={{ flex: 1, minWidth: '200px', padding: '12px 15px', borderRadius: '12px', border: '1.5px solid #e1e8ed', background: '#f8fafb', fontFamily: 'inherit' }}
                                            >
                                                {categoryLinks.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <span style={{ color: '#aaa', fontSize: '0.9rem' }}>או</span>
                                            <input
                                                type="text"
                                                placeholder="הקלד קישור מותאם אישית..."
                                                value={articleForm.link}
                                                onChange={e => setArticleForm({ ...articleForm, link: e.target.value })}
                                                style={{ flex: 2, minWidth: '200px', padding: '12px 15px', borderRadius: '12px', border: '1.5px solid #e1e8ed', background: '#f8fafb', fontFamily: 'inherit' }}
                                            />
                                        </div>
                                        {articleForm.link && (
                                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                                <i className="fas fa-link" style={{ color: '#D4AF37' }}></i>
                                                <a href={articleForm.link} target="_blank" rel="noreferrer"
                                                    style={{ color: '#4a90e2', textDecoration: 'underline' }}>
                                                    {articleForm.link}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                                        {editingArticle && <button type="button" className="btn btn-secondary" onClick={() => { setEditingArticle(null); setArticleImagePreview(''); }}>ביטול עריכה</button>}
                                        <button className="btn btn-primary" style={{ padding: '12px 60px' }}>{editingArticle ? 'עדכן מאמר' : 'פרסם מאמר חדש'}</button>
                                    </div>
                                </form>
                            </div>

                            <div className="crm-card">
                                <h3>מאמרים שפורסמו</h3>
                                <div className="crm-table-container" style={{ marginTop: '20px' }}>
                                    <table className="crm-table">
                                        <thead>
                                            <tr>
                                                <th>כותרת המאמר</th>
                                                <th>תקציר</th>
                                                <th>קישור</th>
                                                <th>תאריך</th>
                                                <th style={{ textAlign: 'left' }}>פעולות</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {articles.map(a => (
                                                <tr key={a.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            {a.image && <img src={a.image} alt={a.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />}
                                                            <span style={{ fontWeight: 700, color: '#1a1a1a' }}>{a.title}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ color: '#666', fontSize: '0.9rem' }}>{a.excerpt?.substring(0, 60)}...</td>
                                                    <td>
                                                        {a.link && (
                                                            <a href={a.link} target="_blank" rel="noreferrer"
                                                                style={{ fontSize: '0.8rem', color: '#4a90e2', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <i className="fas fa-link"></i> קישור
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td>{a.date || new Date().toLocaleDateString()}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            <button title="עריכה" onClick={() => { setEditingArticle(a); setArticleForm(a); setArticleImagePreview(a.image || ''); }} className="btn-icon"><i className="fas fa-edit"></i></button>
                                                            <button title="מחיקה" onClick={() => {
                                                                if (window.confirm('האם למחוק מאמר זה?')) {
                                                                    fetch(`/api/articles/${a.id}`, { method: 'DELETE' }).then(() => fetchArticles());
                                                                }
                                                            }} className="btn-icon" style={{ color: '#e74c3c' }}><i className="fas fa-trash"></i></button>
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

                    {activeTab === 'packages' && (
                        <motion.div key="packages_crm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="crm-card">
                                <h3>{editingPackage ? 'עריכת חבילה' : 'הוספת חבילת מבצע'}</h3>
                                <form onSubmit={handlePackageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                                    <div className="crm-input-group">
                                        <label>כותרת החבילה</label>
                                        <input value={packageForm.title} onChange={e => setPackageForm({ ...packageForm, title: e.target.value })} required placeholder="לדוגמה: חבילת הכל כלול" />
                                    </div>
                                    <div className="crm-input-group">
                                        <label>שורת מחץ (Tagline)</label>
                                        <input value={packageForm.tagline} onChange={e => setPackageForm({ ...packageForm, tagline: e.target.value })} placeholder="לדוגמה: אולם + 2 ספקים = מתנה!" />
                                    </div>
                                    <div className="crm-input-group" style={{ gridColumn: 'span 3' }}>
                                        <label>תיאור</label>
                                        <textarea value={packageForm.description} onChange={e => setPackageForm({ ...packageForm, description: e.target.value })} rows="2" required />
                                    </div>
                                    
                                    {/* Image Upload */}
                                    <div className="crm-input-group" style={{ gridColumn: 'span 3' }}>
                                        <label>תמונת החבילה</label>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1 }}>
                                                <label htmlFor="package-image-upload" style={{
                                                    display: 'flex', alignItems: 'center', gap: '10px',
                                                    padding: '14px 18px', borderRadius: '12px',
                                                    border: '2px dashed #D4AF37', background: '#fdfaf0',
                                                    cursor: 'pointer', fontWeight: '600', color: '#D4AF37'
                                                }}>
                                                    <i className="fas fa-image" style={{ fontSize: '1.3rem' }}></i>
                                                    {packageImageUploading ? 'מעלה תמונה...' : 'לחץ לבחירת תמונה'}
                                                    <input id="package-image-upload" type="file" accept="image/*"
                                                        style={{ display: 'none' }} onChange={handlePackageImageUpload} />
                                                </label>
                                            </div>
                                            {(packageImagePreview || packageForm.image) && (
                                                <div style={{ position: 'relative' }}>
                                                    <img src={packageImagePreview || packageForm.image} alt="תצוגה"
                                                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #f0f0f0' }} />
                                                    <button type="button"
                                                        onClick={() => { setPackageImagePreview(''); setPackageForm(prev => ({ ...prev, image: '' })); }}
                                                        style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.7rem' }}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="crm-input-group">
                                        <label>כיתוב חיסכון</label>
                                        <input value={packageForm.saving} onChange={e => setPackageForm({ ...packageForm, saving: e.target.value })} placeholder="לדוגמה: חסכון של עד ₪2,000" />
                                    </div>
                                    <div className="crm-input-group">
                                        <label>תג מיוחד</label>
                                        <input value={packageForm.badge} onChange={e => setPackageForm({ ...packageForm, badge: e.target.value })} placeholder="לדוגמה: הכי פופולרי" />
                                    </div>
                                    <div className="crm-input-group">
                                        <label>צבע התג</label>
                                        <input type="color" value={packageForm.badgeColor} onChange={e => setPackageForm({ ...packageForm, badgeColor: e.target.value })} style={{ width: '100%', height: '40px', padding: '0', border: '1px solid #ddd', borderRadius: '8px' }} />
                                    </div>

                                    <div className="crm-input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" id="pkgActive" checked={packageForm.active} onChange={e => setPackageForm({ ...packageForm, active: e.target.checked })} />
                                        <label htmlFor="pkgActive" style={{ margin: 0 }}>פעיל באתר (יופיע בקרוסלה)</label>
                                    </div>

                                    <div style={{ gridColumn: 'span 3', display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                                        {editingPackage && <button type="button" className="btn btn-secondary" onClick={() => { setEditingPackage(null); setPackageImagePreview(''); }}>ביטול עריכה</button>}
                                        <button className="btn btn-primary" style={{ padding: '12px 60px' }}>{editingPackage ? 'עדכן חבילה' : 'שמור חבילה חדשה'}</button>
                                    </div>
                                </form>
                            </div>

                            <div className="crm-card">
                                <h3>חבילות קיימות</h3>
                                <div className="crm-table-container" style={{ marginTop: '20px' }}>
                                    <table className="crm-table">
                                        <thead>
                                            <tr>
                                                <th>חבילה</th>
                                                <th>סטטוס</th>
                                                <th style={{ textAlign: 'left' }}>פעולות</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {packages.map(p => (
                                                <tr key={p.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            {p.image && <img src={p.image} alt={p.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />}
                                                            <div>
                                                                <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{p.title}</div>
                                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.tagline}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{p.active ? <span className="crm-badge crm-badge-success">פעיל</span> : <span className="crm-badge crm-badge-warning">לא פעיל</span>}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            <button title="עריכה" onClick={() => { setEditingPackage(p); setPackageForm(p); setPackageImagePreview(p.image || ''); }} className="btn-icon"><i className="fas fa-edit"></i></button>
                                                            <button title="מחיקה" onClick={() => {
                                                                if (window.confirm('האם למחוק חבילה זו?')) {
                                                                    fetch(`/api/packages/${p.id}`, { method: 'DELETE' }).then(() => fetchPackages());
                                                                }
                                                            }} className="btn-icon" style={{ color: '#e74c3c' }}><i className="fas fa-trash"></i></button>
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
                </AnimatePresence>
            </main>
        </div>
    );
}
