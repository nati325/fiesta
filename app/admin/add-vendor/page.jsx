'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useVendors } from '@/context/VendorContext';
import AdminNav from '@/components/admin/AdminNav';
import FileUploadField from '@/components/admin/FileUploadField';
import { VENDOR_CATEGORIES } from '@/lib/vendorCategories';
import {
  QUICK_VENDOR_DEFAULTS,
  DOCUMENT_ACCEPT,
  uploadVendorFile,
  buildVendorPayload,
  calculateClientPrice,
} from '@/lib/vendorFormUtils';

export default function QuickAddVendorPage() {
  const { user, logout } = useAuth();
  const { addVendor } = useVendors();
  const router = useRouter();

  const [form, setForm] = useState({ ...QUICK_VENDOR_DEFAULTS });
  const [imageUploading, setImageUploading] = useState(false);
  const [agreementUploading, setAgreementUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [agreementFileName, setAgreementFileName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const updatePricing = (field, value) => {
    setForm((prev) => {
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImageUploading(true);
    try {
      const data = await uploadVendorFile(file, 'image');
      setForm((prev) => ({ ...prev, image: data.url }));
      setImagePreview(data.url);
    } catch (err) {
      alert(err.message || 'שגיאה בהעלאת התמונה');
    } finally {
      setImageUploading(false);
    }
  };

  const handleAgreementUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setAgreementUploading(true);
    try {
      const data = await uploadVendorFile(file, 'document');
      setForm((prev) => ({
        ...prev,
        agreementImage: data.url,
        agreementSigned: true,
      }));
      setAgreementFileName(data.fileName || file.name);
    } catch (err) {
      alert(err.message || 'שגיאה בהעלאת הקובץ');
    } finally {
      setAgreementUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert('יש להזין שם ספק');
      return;
    }

    if (form.type === 'venue' && !form.contact.trim()) {
      alert('חובה להזין טלפון מנהל האולם');
      return;
    }

    if (!form.price && !form.originalPrice) {
      alert('יש להזין מחיר מקורי או מחיר ללקוח');
      return;
    }

    if (!form.googleReviewsLink?.trim()) {
      const skip = confirm('לא הוזן קישור לביקורות בגוגל.\nלהמשיך בכל זאת?');
      if (!skip) return;
    }

    setSaving(true);
    try {
      const payload = buildVendorPayload(form);
      await addVendor(payload);
      alert('✅ הספק נוסף בהצלחה לאתר!');
      setForm({ ...QUICK_VENDOR_DEFAULTS });
      setImagePreview('');
      setAgreementFileName('');
    } catch {
      // addVendor shows its own error alert
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-root quick-add-vendor" dir="rtl">
      <AdminNav user={user} onLogout={handleLogout} />

      <main className="crm-main">
        <div className="quick-add-header">
          <div>
            <h1>הוספת ספק מהירה</h1>
            <p>מותאם לסוכן בשטח — שם, קטגוריה, מחיר, תמונה וחוזה</p>
          </div>
          <Link href="/admin" className="btn-secondary quick-add-back-link">
            ← CRM מלא
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="crm-card quick-add-form">
          <div className="crm-input-group">
            <label>שם הספק *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="לדוגמה: DJ רועי כהן"
              required
              autoComplete="organization"
            />
          </div>

          <div className="crm-input-group">
            <label>קטגוריה *</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {VENDOR_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="vendor-form-grid-simple">
            <div className="crm-input-group">
              <label>טלפון {form.type === 'venue' ? '*' : '(סודי)'}</label>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="050-1234567"
                required={form.type === 'venue'}
              />
            </div>
            <div className="crm-input-group">
              <label>אזור</label>
              <input
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                placeholder="מרכז, צפון..."
              />
            </div>
          </div>

          <div className="vendor-form-grid-simple">
            <div className="crm-input-group">
              <label>מחיר מחירון (₪)</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.originalPrice}
                onChange={(e) => updatePricing('originalPrice', e.target.value)}
                placeholder="לפני הנחה"
              />
            </div>
            <div className="crm-input-group">
              <label>מחיר ללקוח (₪) *</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="אחרי הנחה"
              />
            </div>
            <div className="crm-input-group">
              <label>עמלת Fiesta (₪)</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.commissionAmount}
                onChange={(e) => setForm({ ...form, commissionAmount: e.target.value })}
                placeholder="עמלה"
              />
            </div>
          </div>

          <div className="crm-input-group">
            <label>קישור Google (מומלץ)</label>
            <input
              type="url"
              inputMode="url"
              value={form.googleReviewsLink}
              onChange={(e) => setForm({ ...form, googleReviewsLink: e.target.value })}
              placeholder="https://g.page/..."
            />
          </div>

          <div className="vendor-files-row">
            <FileUploadField
              label="תמונת הספק"
              hint="צלמו מהטלפון או העלו מהגלריה"
              accept="image/*"
              showCamera
              uploading={imageUploading}
              fileName={form.image && !imagePreview ? 'תמונה הועלתה' : ''}
              previewUrl={imagePreview || form.image}
              onFileSelect={handleImageUpload}
              icon="fa-image"
            />
            <div>
              <FileUploadField
                label="חוזה / צילום שיחה"
                hint="צלמו את החוזה או העלו PDF"
                accept={DOCUMENT_ACCEPT}
                showCamera
                uploading={agreementUploading}
                fileName={agreementFileName}
                previewUrl={form.agreementImage}
                onFileSelect={handleAgreementUpload}
                icon="fa-file-contract"
              />
              <label className="agreement-signed-row">
                <input
                  type="checkbox"
                  checked={form.agreementSigned}
                  onChange={(e) => setForm({ ...form, agreementSigned: e.target.checked })}
                />
                הסכם חתום
              </label>
            </div>
          </div>

          <div className="crm-form-actions vendor-form-sticky-actions">
            <button type="submit" className="btn-primary btn-mobile-full" disabled={saving}>
              {saving ? '⏳ שומר...' : '✅ שמור ספק לאתר'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
