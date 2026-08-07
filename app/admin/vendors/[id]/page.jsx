'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useVendors } from '@/context/VendorContext';
import AdminNav from '@/components/admin/AdminNav';
import FileUploadField from '@/components/admin/FileUploadField';
import VendorProductsManager from '@/components/admin/VendorProductsManager';
import { VENDOR_CATEGORIES } from '@/lib/vendorCategories';
import {
  QUICK_VENDOR_DEFAULTS,
  DOCUMENT_ACCEPT,
  uploadVendorFile,
  buildVendorPayload,
  calculateClientPrice,
} from '@/lib/vendorFormUtils';

function vendorToForm(vendor) {
  const types = [...new Set(
    [vendor.type, ...(Array.isArray(vendor.types) ? vendor.types : [])]
      .filter(Boolean)
  )];
  const agreementImages = [
    ...(Array.isArray(vendor.agreementImages) ? vendor.agreementImages : []),
    vendor.agreementImage,
  ]
    .map((u) => String(u || '').trim())
    .filter(Boolean)
    .filter((u, i, arr) => arr.indexOf(u) === i)
    .slice(0, 3);

  return {
    ...QUICK_VENDOR_DEFAULTS,
    ...vendor,
    name: vendor.name || '',
    type: types[0] || vendor.type || 'design',
    types: types.length ? types : [vendor.type || 'design'],
    contact: vendor.contact || '',
    region: vendor.region || '',
    description: vendor.description || '',
    image: vendor.image || '',
    originalPrice: vendor.originalPrice ?? '',
    price: vendor.price ?? '',
    discount: vendor.discount ?? '',
    discountType: vendor.discountType || 'percent',
    commissionAmount: vendor.commissionAmount ?? '',
    commissionPercent: vendor.commissionPercent ?? '',
    agreementSigned: Boolean(vendor.agreementSigned),
    agreementImage: agreementImages[0] || '',
    agreementImages,
    googleReviewsLink: vendor.googleReviewsLink || '',
    googleRating: vendor.googleRating ?? 0,
    googleReviewsCount: vendor.googleReviewsCount ?? 0,
    adminNotes: vendor.adminNotes || '',
    instagramLink: vendor.instagramLink || '',
    portfolio: Array.isArray(vendor.portfolio) ? vendor.portfolio : [],
    products: Array.isArray(vendor.products) ? vendor.products : [],
    mainProductId: vendor.mainProductId || '',
    videos: Array.isArray(vendor.videos) ? vendor.videos : [],
  };
}

export default function EditVendorPage() {
  const params = useParams();
  const id = params?.id;
  const { user, logout } = useAuth();
  const { vendors, updateVendor, loading: vendorsLoading } = useVendors();
  const router = useRouter();

  const vendor = useMemo(
    () => vendors.find((v) => String(v.id) === String(id) || String(v._id) === String(id)),
    [vendors, id]
  );

  const [form, setForm] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [agreementUploading, setAgreementUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [agreementFileName, setAgreementFileName] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadedId, setLoadedId] = useState(null);

  useEffect(() => {
    if (!vendor) return;
    if (loadedId === String(vendor.id)) return;
    setForm(vendorToForm(vendor));
    setImagePreview(vendor.image || '');
    setAgreementFileName(
      vendor.agreementImage
        ? decodeURIComponent(vendor.agreementImage.split('/').pop() || '')
        : ''
    );
    setLoadedId(String(vendor.id));
  }, [vendor, loadedId]);

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
    const current = Array.isArray(form.agreementImages) ? form.agreementImages.filter(Boolean) : [];
    if (current.length >= 3) {
      alert('ניתן לצרף עד 3 תמונות חוזה');
      return;
    }
    setAgreementUploading(true);
    try {
      const data = await uploadVendorFile(file, 'document');
      const nextImages = [...current, data.url].slice(0, 3);
      const agreementImage = nextImages[0] || '';
      setForm((prev) => ({
        ...prev,
        agreementImages: nextImages,
        agreementImage,
        agreementSigned: true,
      }));
      setAgreementFileName(data.fileName || file.name);
      // Persist immediately — otherwise the admin list still shows "חסר קובץ"
      // until the user remembers to hit Save on the whole form.
      if (vendor?.id) {
        await updateVendor(vendor.id, {
          agreementImages: nextImages,
          agreementImage,
          agreementSigned: true,
        });
      }
    } catch (err) {
      alert(err.message || 'שגיאה בהעלאת הקובץ');
    } finally {
      setAgreementUploading(false);
    }
  };

  const toggleAdminCategory = (slug) => {
    setForm((prev) => {
      const current = [...new Set([prev.type, ...(prev.types || [])].filter(Boolean))];
      const has = current.includes(slug);
      let next = has ? current.filter((t) => t !== slug) : [...current, slug];
      if (!next.length) next = [slug];
      return { ...prev, types: next, type: next[0] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form?.name?.trim()) {
      alert('יש להזין שם ספק');
      return;
    }
    if (form.type === 'venue' && !String(form.contact || '').trim()) {
      alert('חובה להזין טלפון מנהל האולם');
      return;
    }

    setSaving(true);
    try {
      const payload = buildVendorPayload(form);
      await updateVendor(vendor.id, payload);
      alert('✅ הספק עודכן בהצלחה');
      router.push('/admin');
    } catch {
      // updateVendor shows its own alert
    } finally {
      setSaving(false);
    }
  };

  if (vendorsLoading || (!vendor && vendors.length === 0)) {
    return (
      <div className="admin-root quick-add-vendor" dir="rtl">
        <AdminNav user={user} onLogout={handleLogout} />
        <main className="crm-main">
          <p style={{ padding: '40px', textAlign: 'center' }}>טוען ספק...</p>
        </main>
      </div>
    );
  }

  if (!vendor || !form) {
    return (
      <div className="admin-root quick-add-vendor" dir="rtl">
        <AdminNav user={user} onLogout={handleLogout} />
        <main className="crm-main">
          <div className="crm-card" style={{ padding: '40px', textAlign: 'center' }}>
            <h2>הספק לא נמצא</h2>
            <Link href="/admin" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
              חזרה לניהול ספקים
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-root quick-add-vendor" dir="rtl">
      <AdminNav user={user} onLogout={handleLogout} />

      <main className="crm-main">
        <div className="quick-add-header">
          <div>
            <h1>עריכת ספק</h1>
            <p>{vendor.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href={`/vendor/${vendor.id}`} className="btn-secondary quick-add-back-link" target="_blank">
              צפייה באתר
            </Link>
            <Link href="/admin" className="btn-secondary quick-add-back-link">
              ← חזרה לניהול
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="crm-card quick-add-form">
          <div className="crm-input-group">
            <label>שם הספק *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="crm-input-group">
            <label>קטגוריות * (אפשר כמה)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {VENDOR_CATEGORIES.map((cat) => {
                const on = (form.types || []).includes(cat.value) || form.type === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleAdminCategory(cat.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '999px',
                      border: on ? '1.5px solid #8F7344' : '1px solid #ddd',
                      background: on ? '#f5efe6' : 'white',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {on ? '✓ ' : ''}{cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="vendor-form-grid-simple">
            <div className="crm-input-group">
              <label>טלפון {form.type === 'venue' ? '*' : ''}</label>
              <input
                type="tel"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                required={form.type === 'venue'}
              />
            </div>
            <div className="crm-input-group">
              <label>אזור</label>
              <input
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              />
            </div>
          </div>

          <div className="crm-input-group">
            <label>תיאור</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="תיאור הספק כפי שיופיע באתר"
            />
          </div>

          <div className="vendor-form-grid-simple">
            <div className="crm-input-group">
              <label>מחיר מחירון (₪)</label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => updatePricing('originalPrice', e.target.value)}
              />
            </div>
            <div className="crm-input-group">
              <label>הנחה</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  value={form.discount}
                  onChange={(e) => updatePricing('discount', e.target.value)}
                  style={{ flex: 2 }}
                />
                <select
                  value={form.discountType}
                  onChange={(e) => updatePricing('discountType', e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="percent">%</option>
                  <option value="amount">₪</option>
                </select>
              </div>
            </div>
            <div className="crm-input-group">
              <label>מחיר ללקוח (₪)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="crm-input-group">
              <label>עמלת Fiesta (%)</label>
              <input
                type="number"
                value={form.commissionPercent}
                onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })}
                placeholder="אחוז מהמחירון"
              />
            </div>
            <div className="crm-input-group">
              <label>עמלת Fiesta (₪)</label>
              <input
                type="number"
                value={form.commissionAmount}
                onChange={(e) => setForm({ ...form, commissionAmount: e.target.value })}
              />
            </div>
          </div>

          <VendorProductsManager
            products={form.products}
            discountPercent={form.discount}
            commissionPercent={form.commissionPercent}
            discountIsPercent={form.discountType === 'percent'}
            onChange={(products) => setForm((prev) => ({ ...prev, products }))}
          />

          <div className="vendor-files-row">
            <FileUploadField
              label="תמונת הספק"
              hint="צלמו או העלו תמונה ראשית"
              accept="image/*"
              showCamera
              uploading={imageUploading}
              fileName={form.image && !imagePreview ? 'תמונה הועלתה' : ''}
              previewUrl={imagePreview || form.image}
              onFileSelect={handleImageUpload}
              icon="fa-image"
            />
          </div>

          <div
            style={{
              marginTop: '8px',
              padding: '16px',
              border: ((form.agreementImages || []).length || form.agreementImage) ? '2px solid #86efac' : '2px dashed #f59e0b',
              background: ((form.agreementImages || []).length || form.agreementImage) ? '#f0fdf4' : '#fffbeb',
              borderRadius: '14px',
            }}
          >
            <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem', fontWeight: 800, color: '#92400e' }}>
              <i className="fas fa-file-contract" style={{ marginLeft: '8px' }} />
              חוזה / צילום שיחה (עד 3)
            </h3>
            {(form.agreementImages || []).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {(form.agreementImages || []).map((url, idx) => (
                  <div key={`${url}-${idx}`} style={{ position: 'relative', width: 96, height: 96, borderRadius: 10, overflow: 'hidden', border: '1px solid #86efac' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={async () => {
                        const next = (form.agreementImages || []).filter((_, i) => i !== idx);
                        setForm((prev) => ({
                          ...prev,
                          agreementImages: next,
                          agreementImage: next[0] || '',
                          agreementSigned: next.length > 0,
                        }));
                        if (vendor?.id) {
                          try {
                            await updateVendor(vendor.id, {
                              agreementImages: next,
                              agreementImage: next[0] || '',
                              agreementSigned: next.length > 0,
                            });
                          } catch {
                            // updateVendor already alerts
                          }
                        }
                      }}
                      style={{ position: 'absolute', top: 4, left: 4, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, padding: '2px 6px', cursor: 'pointer' }}
                    >
                      הסר
                    </button>
                  </div>
                ))}
              </div>
            )}
            {(form.agreementImages || []).length < 3 && (
              <FileUploadField
                label=""
                hint=""
                accept={DOCUMENT_ACCEPT}
                showCamera
                uploading={agreementUploading}
                fileName={agreementFileName}
                previewUrl=""
                onFileSelect={handleAgreementUpload}
                icon="fa-file-signature"
              />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px', flexWrap: 'wrap' }}>
              <label className="agreement-signed-row" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={form.agreementSigned}
                  onChange={(e) => setForm({ ...form, agreementSigned: e.target.checked })}
                />
                הסכם חתום
              </label>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800 }}>
              גלריית עבודות ({(form.portfolio || []).length})
            </h3>
            {(form.portfolio || []).length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                {(form.portfolio || []).map((item, idx) => {
                  const src = typeof item === 'string' ? item : item?.image;
                  return (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            portfolio: (f.portfolio || []).filter((_, i) => i !== idx),
                          }))
                        }
                        style={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          border: 'none',
                          background: '#ef4444',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: 800,
                          fontSize: 11,
                        }}
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
                      setForm((f) => ({
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

          <div className="crm-input-group" style={{ marginTop: '16px' }}>
            <label>הערות פנימיות (אדמין)</label>
            <textarea
              rows={3}
              value={form.adminNotes}
              onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
            />
          </div>

          <div className="crm-form-actions vendor-form-sticky-actions">
            <button type="submit" className="btn-primary btn-mobile-full btn-save-vendor" disabled={saving}>
              {saving ? '⏳ שומר...' : '💾 שמור שינויים'}
            </button>
            <Link href="/admin" className="btn-secondary btn-mobile-full" style={{ textAlign: 'center' }}>
              ביטול
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
